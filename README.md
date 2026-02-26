# FonadaLabs Podcast Studio 🎙️

A professional AI-powered podcast generation platform that transforms topics or raw content into high-fidelity audio productions using advanced Indian language synthesis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61dafb.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-purple.svg)

---

## ✨ Features

### 🧠 Topic Explorer (AI Brainstorming)
- **Interactive Chat**: Brainstorm podcast ideas with Gemini directly in the studio.
- **Smart Selection**: The AI listens for your preference and can auto-populate your selection into the main workbench.
- **Rich Formatting**: Clean, formatted suggestions with catchy title options.

### 🛠️ Studio Workbench
- **Flexible Modes**: Generate scripts from a simple **Topic** or long-form **Raw Content**.
- **Multi-Speaker Support**: Add up to 4 distinct speakers with customizable nicknames.
- **Multi-Language**: Support for **Hindi, Tamil, Telugu, and English (including Mix)**.
- **Audio Control**: Toggle between **Mono** and **Stereo** production.
- **Precise Duration**: Specify exact duration in minutes for your production.

### ✍️ Script Editor & Review
- **Live Editing**: Review and modify generated script lines.
- **Granular Regeneration**: Dislike a specific line? Regenerate it with a single click while maintaining context.
- **Pricing Estimator**: Professional cost breakdown based on character count:
    - Real-time **Credit** calculation (10 chars = 1 credit).
    - Estimated cost in **INR (₹)** and **USD ($)**.
    - Character limit verification (450 chars per request).

### 🔊 High-Fidelity Audio
- **Hyper-Realistic Voices**: Leveraging FonadaLabs' advanced Indian language TTS.
- **Production Grade**: Crystal-clear output ready for export.
- **Direct Download**: Export your final production as an MP3.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js & npm
- FFmpeg (for audio processing)
- Redis (for background task management)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AksharaaSharmaa/AI_Podcast_Generator.git
   cd AI_Podcast_Generator
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

---

## 🛠️ Running the Application

1. **Start Redis Server**
   ```bash
   sudo service redis-server start
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   python main.py
   ```

3. **Start Frontend (Vite)**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Start Worker (Optional, for background tasks)**
   ```bash
   cd backend
   rq worker podcast_tasks
   ```

---

## 🏗️ Tech Stack

- **Frontend**: React.js, Lucide Icons, Axios, Vanilla CSS (Glassmorphism).
- **Backend**: FastAPI, Google Generative AI (Gemini 2.5 Flash), FFmpeg-python.
- **Infrastructure**: Uvicorn, Redis, Python-RQ.

---

## 📜 Pricing Model (FonadaLabs)
- **Formula**: 10 Characters = 1 Credit.
- **Rate**: Approx. ₹12 / 10,000 characters.
- **Limits**: Max 450 characters per single API request.

---

## 🤝 Contributing
Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License
MIT License.

---
*Developed with ❤️ by Aksharaa Sharma*
