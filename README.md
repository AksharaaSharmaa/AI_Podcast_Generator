<h1 align="center"> FonadaLabs Podcast Studio 🎙️ </h1>


A professional AI-powered podcast generation platform that transforms topics or raw content into high-fidelity audio and **premium waveform videos**. Built for creators who want to distribute to **Spotify** and **YouTube** with ease.

🚀 **Live Production Link:** [https://ai-podcast-generator-1-om5g.onrender.com/](https://ai-podcast-generator-1-om5g.onrender.com/)

![React](https://img.shields.io/badge/frontend-React-61dafb.svg)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-purple.svg)
![FFmpeg](https://img.shields.io/badge/Media-FFmpeg-green.svg)

---

## 🌟 Key Modules

### 🎬 Elite Video Generation (YouTube Ready)
Transform your audio into a professional video with our **Elite Waveform Engine**:
- **Dynamic Waveforms**: Real-time RMS-based scaling with thinned, sleek bars and rounded gradients.
- **Premium Backgrounds**: Procedurally generated mesh backgrounds with radial glows and noise textures.
- **Ambient Animation**: Subtle scaling and glowing effects that react to the audio amplitude.
- **Cinematic Titles**: Prominent, high-clarity overlay of your podcast title with optimized typography.

### 🎧 Spotify & RSS Integration
Professional-grade distribution system built for Spotify for Podcasters:
- **Multi-Show Support**: Create and manage multiple podcast shows under a single email using unique directory slugs.
- **Unique Feed Isolation**: Each show gets its own independent `rss.xml`, solving the "duplicate podcast" error on Spotify.
- **Spotify Verification**: Built-in flow for email-linked RSS ownership and verification.
- **Auto-Assembly**: Seamlessly bundles multiple audio chunks with natural silence gaps and cross-fades.

### 🧠 AI Scripting & Brainstorming
- **Topic Explorer**: Interactive chat interface with Gemini to brainstorm and refine podcast ideas.
- **Contextual Generation**: Converts brainstormed topics or uploaded documents into natural, multi-speaker scripts.
- **Monologue Mode**: Smart prompt branching for single-speaker podcasts, ensuring a captivating and logical flow.

### 🛠️ Production Workbench
- **Speaker Customization**: Add up to 4 speakers with custom nicknames and hyper-realistic Indian voices.
- **Live Script Editor**: Granular control to edit or regenerate specific lines while maintaining a cohesive narrative.
- **Real-time Costing**: Integrated pricing estimator for character-based billing (INR/USD).
- **Error Resilience**: Robust retry logic with exponential backoff to handle TTS API timeouts.

---

## 🏗️ Technical Architecture

- **Frontend**: React.js with Glassmorphism UI, Lucide Icons, and Axios for async communication.
- **Backend**: FastAPI (Python) for high-performance API handling.
- **Media Engine**: FFmpeg and MoviePy for high-fidelity audio concatenation and video synthesis.
- **Intelligence**: Google Gemini 2.5 Flash for script generation and topic brainstorming.
- **Persistence**: File-system based multi-user isolation with email hashing.

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js & npm
- FFmpeg installed in your system PATH

### Installation steps
1. **Clone & Setup Backend**
   ```bash
   git clone https://github.com/AksharaaSharmaa/AI_Podcast_Generator.git
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python main.py
   ```

2. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

*Developed with ❤️ by Akshara Sharma*
