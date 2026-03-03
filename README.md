# FonadaLabs Podcast Studio 🎙️

A professional AI-powered podcast generation platform that transforms topics or raw content into high-fidelity audio and video productions using advanced Indian language synthesis.

🚀 **Deployed Link:** [Live Demo](https://ai-podcast-generator-1-om5g.onrender.com/)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React-61dafb.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-purple.svg)

---

## ✨ Features

### 🧠 AI Topic Explorer
- **Brainstorming Hub**: Chat with Gemini to discover trending podcast topics.
- **Contextual Selection**: Auto-populate the studio with brainstormed ideas.

### 🛠️ Production Workbench
- **Flexible Inputs**: Support for **Topics**, **Raw Text**, or **Document Uploads**.
- **Speaker Customization**: Add multiple speakers with unique nicknames and realistic Indian voices.
- **Intelligent Monologues**: Natively supports single-speaker podcasts with tailored narrative flow.
- **Multi-Language**: Hindi, Tamil, Telugu, and English (Global & Mix).

### 🎬 Elite Video Generation
- **Premium Waveforms**: Beautiful, sleek animated waveforms with radial glows.
- **YouTube Ready**: Export high-definition MP4 videos with dynamic titles and branding.
- **Custom Aesthetics**: Optimized layout with thinned waveforms and prominent titles for a premium feel.

### 🎧 Distribution & RSS
- **Multi-Show Support**: Create separate podcast shows with unique feed URLs for the same email.
- **Spotify Optimized**: Generates standardized RSS feeds that solve "duplicate podcast" errors.
- **One-Click Publishing**: Seamless flow from audio generation to RSS feed deployment.

### 🛡️ Reliability & Scale
- **Error Resilience**: Robust retry mechanism with exponential backoff for TTS synthesis (handles 522 timeouts).
- **Session Persistence**: Library management to keep track of your generated podcasts.

---

## 🏗️ Tech Stack

- **Frontend**: React.js, Lucide Icons, Axios, Vanilla CSS (Glassmorphism).
- **Backend**: FastAPI, Google Generative AI (Gemini 2.5 Flash), FFmpeg.
- **Production**: Uvicorn, Python-RQ (Worker management).

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js & npm
- FFmpeg (for media processing)

### Installation

1. **Clone & Setup Backend**
   ```bash
   git clone https://github.com/AksharaaSharmaa/AI_Podcast_Generator.git
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

3. **Run Application**
   - Start Backend: `python main.py`
   - Start Frontend: `npm run dev`

---

## 📜 Pricing Model (FonadaLabs)
- **Rate**: 10 Characters = 1 Credit.
- **Optimization**: Built-in pricing estimator to track credit usage in real-time.

---

*Developed with ❤️ by Aksharaa Sharma*
