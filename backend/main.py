import os
import json
import asyncio
import uuid
import subprocess
import requests
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai

app = FastAPI(title="AI Podcast Generator")

# Mount Static Files
TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=TEMP_DIR), name="audio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Speaker(BaseModel):
    name: str
    voice: str
    language: str

class ScriptLine(BaseModel):
    speaker: str
    text: str

class ScriptRequest(BaseModel):
    input_mode: str  # "topic" or "content"
    topic: str = ""
    content: str = ""
    language: str
    duration: int  # in minutes
    speakers: List[Speaker]
    llm_api_key: str

class AudioRequest(BaseModel):
    script: List[ScriptLine]
    speakers: List[Speaker]
    channels: str  # "mono" or "stereo"
    fonada_api_key: str

class RegenerateRequest(BaseModel):
    script: List[ScriptLine]
    index: int
    llm_api_key: str
    language: str

class BrainstormMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class BrainstormRequest(BaseModel):
    history: List[BrainstormMessage]
    user_input: str
    llm_api_key: str

def split_text(text: str, max_chars: int = 450) -> List[str]:
    chunks = []
    while len(text) > max_chars:
        split_pos = text.rfind(' ', 0, max_chars)
        if split_pos == -1:
            split_pos = max_chars
        chunks.append(text[:split_pos].strip())
        text = text[split_pos:].strip()
    if text:
        chunks.append(text)
    return chunks

async def generate_audio_chunk(text: str, voice: str, language: str, api_key: str, chunk_id: str):
    url = "https://api.fonada.ai/tts/generate-audio-large"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    # Normalize language for Fonada TTS
    normalized_lang = language
    if "English" in language:
        normalized_lang = "English"
        
    data = {
        "input": text,
        "voice": voice,
        "language": normalized_lang
    }
    
    response = requests.post(url, headers=headers, json=data)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"Fonada TTS error: {response.text}")
    
    file_path = os.path.join(TEMP_DIR, f"{chunk_id}.mp3")
    with open(file_path, "wb") as f:
        f.write(response.content)
    return file_path

@app.post("/generate-script")
async def generate_script(request: ScriptRequest):
    try:
        genai.configure(api_key=request.llm_api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        lang_instruction = request.language
        if request.language == "Pure English":
            lang_instruction = "strictly clear and professional English"
        elif request.language == "English (Mix)":
            lang_instruction = "English with occasional natural mix of local Indian context/terms"

        if request.input_mode == "topic":
            prompt = f"Generate a podcast script about '{request.topic}' in {lang_instruction}. "
            prompt += f"Research and include key facts. The podcast should be approximately {request.duration} minutes long. "
        else:
            prompt = f"Transform the following content into an interesting, highly conversational podcast script in {lang_instruction}: \n\n{request.content}\n\n"
            prompt += f"The script should be approximately {request.duration} minutes long. "
            
        speaker_names = [s.name for s in request.speakers]
        prompt += "The speakers are: " + ", ".join(speaker_names) + ". "
        prompt += f"IMPORTANT: Use these EXACT names [{', '.join(speaker_names)}] in the 'speaker' field of the JSON output. "
        prompt += "Make the conversation flow naturally with interruptions, agreements, and dynamic interactions. "
        prompt += "Return the script as a JSON list of objects with 'speaker' and 'text' fields. "
        prompt += "Format: {'script': [{'speaker': 'Name', 'text': '...'}]}"
        
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        script_data = json.loads(content)
        return {"script": script_data.get("script", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)}")

@app.post("/regenerate-script-part")
async def regenerate_script_part(request: RegenerateRequest):
    try:
        genai.configure(api_key=request.llm_api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        context = json.dumps([{"speaker": l.speaker, "text": l.text} for l in request.script])
        target = request.script[request.index]
        
        prompt = f"Given this podcast script context: \n{context}\n\n"
        prompt += f"Please regenerate the line at index {request.index} (currently by '{target.speaker}': '{target.text}'). "
        prompt += f"Keep it in {request.language}. Improve the flow, make it more engaging or natural. "
        prompt += "Return ONLY the new text for this specific line. Do not return JSON, just the text."
        
        response = model.generate_content(prompt)
        return {"new_text": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regeneration failed: {str(e)}")

@app.post("/brainstorm-topic")
async def brainstorm_topic(request: BrainstormRequest):
    try:
        print(f"Brainstorming topic with model gemini-2.5-flash. User input: {request.user_input}")
        genai.configure(api_key=request.llm_api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        chat_history = []
        for msg in request.history:
            chat_history.append({"role": msg.role, "parts": [msg.content]})
            
        chat = model.start_chat(history=chat_history)
        
        instruction = "You are a creative podcast topic brainstorm assistant. "
        instruction += "Help the user refine their ideas into a catchy, specific podcast topic. "
        instruction += "Use markdown: **bold** for titles/emphasis and bullet points for options. "
        instruction += "When the user expresses a preference for a specific topic (e.g., 'I like the second one' or 'Go with the first'), "
        instruction += "you MUST immediately confirm their choice and then END your message with a new line containing exactly: 'FINAL_TOPIC: [The Final Topic Name]'. "
        instruction += "Do not ask more questions once a choice is made. Just confirm and provide the FINAL_TOPIC tag."
        
        full_prompt = f"{instruction}\n\nUser: {request.user_input}"
        response = chat.send_message(full_prompt)
        print(f"AI Response: {response.text}")
        return {"response": response.text}
    except Exception as e:
        print(f"Brainstorming Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Brainstorming failed: {str(e)}")
async def audio_from_script(request: AudioRequest):
    # 1. Process Script into audio chunks
    audio_files = []
    session_id = str(uuid.uuid4())
    
    tasks = []
    for i, line in enumerate(request.script):
        line_speaker = line.speaker.strip().lower()
        speaker_info = None
        
        for s in request.speakers:
            if s.name.strip().lower() == line_speaker:
                speaker_info = s
                break
        
        if not speaker_info:
            speaker_info = request.speakers[i % len(request.speakers)]
            
        text_chunks = split_text(line.text)
        
        for j, chunk in enumerate(text_chunks):
            chunk_id = f"{session_id}_{i}_{j}"
            tasks.append(generate_audio_chunk(
                chunk, 
                speaker_info.voice, 
                speaker_info.language, 
                request.fonada_api_key, 
                chunk_id
            ))
    
    try:
        audio_files = await asyncio.gather(*tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

    # 2. Concatenate using FFmpeg
    output_filename = f"podcast_{session_id}.mp3"
    output_path = os.path.join(TEMP_DIR, output_filename)
    
    list_file_path = os.path.join(TEMP_DIR, f"list_{session_id}.txt")
    with open(list_file_path, "w") as f:
        for audio_file in audio_files:
            f.write(f"file '{os.path.basename(audio_file)}'\n")
            
    try:
        channel_count = "1" if request.channels == "mono" else "2"
        subprocess.run([
            "ffmpeg", "-f", "concat", "-safe", "0", "-i", list_file_path, 
            "-ac", channel_count, "-q:a", "0", "-map", "a", output_path, "-y"
        ], check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Audio concatenation failed: {e.stderr}")
    
    for f in audio_files:
        os.remove(f)
    os.remove(list_file_path)
    
    return {
        "message": "Audio generated successfully", 
        "audio_url": f"http://localhost:8000/audio/{output_filename}",
        "filename": output_filename
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
