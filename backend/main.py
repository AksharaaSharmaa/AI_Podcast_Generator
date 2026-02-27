import os
import json
import asyncio
import uuid
import subprocess
import requests
from typing import List
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai

# -----------------------------------
# App Initialization
# -----------------------------------

app = FastAPI(title="AI Podcast Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# Temp Audio Directory
# -----------------------------------

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)
app.mount("/audio", StaticFiles(directory=TEMP_DIR), name="audio")

# -----------------------------------
# Data Models
# -----------------------------------

class Speaker(BaseModel):
    name: str
    voice: str
    language: str

class ScriptLine(BaseModel):
    speaker: str
    text: str

class ScriptRequest(BaseModel):
    input_mode: str
    topic: str = ""
    content: str = ""
    language: str
    duration: int
    speakers: List[Speaker]
    llm_api_key: str

class AudioRequest(BaseModel):
    script: List[ScriptLine]
    speakers: List[Speaker]
    channels: str
    fonada_api_key: str

class RegenerateRequest(BaseModel):
    script: List[ScriptLine]
    index: int
    llm_api_key: str
    language: str

class BrainstormMessage(BaseModel):
    role: str
    content: str

class BrainstormRequest(BaseModel):
    history: List[BrainstormMessage]
    user_input: str
    llm_api_key: str

# -----------------------------------
# Utility
# -----------------------------------

def split_text(text: str, max_chars: int = 450) -> List[str]:
    chunks = []
    while len(text) > max_chars:
        split_pos = text.rfind(" ", 0, max_chars)
        if split_pos == -1:
            split_pos = max_chars
        chunks.append(text[:split_pos].strip())
        text = text[split_pos:].strip()
    if text:
        chunks.append(text)
    return chunks

async def generate_audio_chunk(text, voice, language, api_key, chunk_id):
    url = "https://api.fonada.ai/tts/generate-audio-large"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "input": text,
        "voice": voice,
        "language": language,
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Fonada TTS error: {response.text}",
        )

    file_path = os.path.join(TEMP_DIR, f"{chunk_id}.mp3")
    with open(file_path, "wb") as f:
        f.write(response.content)

    return file_path

# -----------------------------------
# Routes
# -----------------------------------

@app.get("/")
async def health():
    return {"status": "running"}

@app.post("/generate-script")
async def generate_script(request: ScriptRequest):
    try:
        genai.configure(api_key=request.llm_api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        if request.input_mode == "topic":
            prompt = (
                f"Generate a podcast script about '{request.topic}' in {request.language}. "
                f"Duration approximately {request.duration} minutes. "
            )
        else:
            prompt = (
                f"Convert this content into a conversational podcast script in {request.language}:\n\n"
                f"{request.content}\n\n"
                f"Duration: {request.duration} minutes."
            )

        speaker_names = [s.name for s in request.speakers]

        prompt += (
            f" Speakers: {', '.join(speaker_names)}. "
            f"Use EXACT speaker names only. "
            f"Return JSON format: {{'script': [{{'speaker': '', 'text': ''}}]}}"
        )

        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"},
        )

        content = response.text.strip()
        content = content.replace("```json", "").replace("```", "").strip()

        parsed = json.loads(content)

        return {"script": parsed.get("script", [])}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/regenerate-script-part")
async def regenerate_script_part(request: RegenerateRequest):
    try:
        genai.configure(api_key=request.llm_api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        context = json.dumps(
            [{"speaker": l.speaker, "text": l.text} for l in request.script]
        )

        target = request.script[request.index]

        prompt = (
            f"Context:\n{context}\n\n"
            f"Regenerate line {request.index} by {target.speaker} "
            f"in {request.language}. Return ONLY the new text."
        )

        response = model.generate_content(prompt)

        return {"new_text": response.text.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/brainstorm-topic")
async def brainstorm_topic(request: BrainstormRequest):
    try:
        genai.configure(api_key=request.llm_api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")

        history = [
            {"role": m.role, "parts": [m.content]}
            for m in request.history
        ]

        chat = model.start_chat(history=history)

        instruction = (
            "You are a podcast topic brainstorm assistant. "
            "When a final topic is chosen, end with:\n"
            "FINAL_TOPIC: <topic>"
        )

        response = chat.send_message(
            f"{instruction}\nUser: {request.user_input}"
        )

        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------------
# AUDIO ENDPOINT (MATCHES FRONTEND)
# -----------------------------------

@app.post("/audio-from-script")
async def audio_from_script(request: AudioRequest, req: Request):
    try:
        session_id = str(uuid.uuid4())
        tasks = []

        for i, line in enumerate(request.script):
            speaker = next(
                (s for s in request.speakers if s.name.lower() == line.speaker.lower()),
                request.speakers[i % len(request.speakers)],
            )

            for j, chunk in enumerate(split_text(line.text)):
                chunk_id = f"{session_id}_{i}_{j}"
                tasks.append(
                    generate_audio_chunk(
                        chunk,
                        speaker.voice,
                        speaker.language,
                        request.fonada_api_key,
                        chunk_id,
                    )
                )

        audio_files = await asyncio.gather(*tasks)

        list_file = os.path.join(TEMP_DIR, f"list_{session_id}.txt")
        with open(list_file, "w") as f:
            for a in audio_files:
                f.write(f"file '{os.path.basename(a)}'\n")

        output_file = f"podcast_{session_id}.mp3"
        output_path = os.path.join(TEMP_DIR, output_file)

        subprocess.run(
            [
                "ffmpeg",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                list_file,
                "-ac",
                "1" if request.channels == "mono" else "2",
                "-q:a",
                "0",
                output_path,
                "-y",
            ],
            check=True,
        )

        for f in audio_files:
            os.remove(f)
        os.remove(list_file)

        base_url = str(req.base_url).rstrip("/")

        return {
            "message": "Audio generated successfully",
            "audio_url": f"{base_url}/audio/{output_file}",
            "filename": output_file,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------------
# Local Development
# -----------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
