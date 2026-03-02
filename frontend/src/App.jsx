import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Trash2, Play, Download, Settings,
  Loader2, Sun, Moon, Sparkles, MessageSquare,
  Speaker, FileText, Globe, Home,
  ArrowRight, Mic2, Star, PlayCircle, RotateCw, Check, Pause, Upload
} from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://ai-podcast-generator-qam2.onrender.com';

const VOICES = {
  Hindi: [
    "Naad", "Dhwani", "Vaanee", "Swara", "Taal", "Laya", "Raaga", "Geetika",
    "Swarini", "Geet", "Sangeeta", "Raagini", "Madhura", "Komal", "Sangeet",
    "Meghra", "Gandhar", "Madhyam", "Shruti", "Pancham", "Dhaivat", "Nishad",
    "Tara", "Shadja", "Komalika", "Rishabh", "Mandra", "Tarana", "Swarika",
    "Komala", "Geetini", "Teevra", "Chaitra", "Madhur", "Raagika", "Swarita",
    "Vibhaag", "Gitanjali", "Aalap", "Sangeeti", "Taan", "Meend", "Raagita",
    "Gamak", "Murki", "Khatka", "Andolan", "Sparsh", "Kampan", "Shrutika",
    "Swaranjali", "Nada", "Lahar", "Tarang", "Dhwaniya", "Shrutini", "Swar",
    "Geetanjali", "Raaginika", "Sangeetika", "Meghra2", "Swaroopa",
    "Geetimala", "Naadayana", "Swarayana", "Layakari", "Taalayana", "Raag",
    "Swaranjana", "Naadanika", "Dhwanika", "Swaraka", "Sangeetara",
    "Layabaddha"
  ],

  Tamil: [
    "Vaani", "Isai", "Thalam", "Swaram", "Madhuram", "Naadham", "Ragam",
    "Pallavi", "Komalam", "Raagamalika", "Geetham", "Taalam", "Dhwani",
    "Sangeetham", "Raagaratna", "Shruti"
  ],

  Telugu: [
    "Naadamu", "Dhwani", "Taalam", "Geetamu", "Raagamalika", "Sangeetamu",
    "Vaani", "Swaramu", "Layamu", "Taalabaddha", "Raagapriya", "Swarajathi",
    "Raagini", "Komala", "Naada", "Meghamalini", "Sangeetapriya",
    "Raagamala", "Dhwaniya", "Shruti", "Tara", "Komalavani", "Mandara",
    "Taana", "Swarajati", "Raagaanjali", "Raagika", "Swaranjali", "Geetika",
    "Swaramala", "Aalapana", "Raagaratnam", "Meghavani", "Swarita",
    "Geetavani", "Taala", "Layakari", "Murki", "Sangeetavani", "Geetamala",
    "Naadapriya", "Dhwanika", "Dhwanimala", "Sangeetanjali", "Gamaka",
    "Raagasudha", "Sangeetaratna", "Taalabaddha2", "Sangeetasundari",
    "Naadayana", "Raagavalli", "Swarasudha", "Sangeetaswarna",
    "Raagapriya2", "Swaravara", "Naadeshwara", "Dhwanividya",
    "Taalapala", "Dhwanipala", "Swarapala"
  ]
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [view, setView] = useState('home'); // 'home', 'studio', 'library'

  // Studio States
  const [studioStep, setStudioStep] = useState('config'); // 'config', 'script', 'processing'
  const [inputMode, setInputMode] = useState('topic');
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('Hindi');
  const [duration, setDuration] = useState(2);
  const [channels, setChannels] = useState('mono');
  const [speakers, setSpeakers] = useState([
    { name: 'Host', voice: 'Naad', language: 'Hindi' }
  ]);
  const [fonadaKey, setFonadaKey] = useState('');
  const [llmKey, setLlmKey] = useState('');

  // Publish States
  const [publishPlatform, setPublishPlatform] = useState(''); // 'youtube', 'spotify'
  const [audioFilename, setAudioFilename] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [rssUrl, setRssUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Topic Explorer State
  const [showTopicExplorer, setShowTopicExplorer] = useState(false);

  // Generation & Script states
  const [generatedScript, setGeneratedScript] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Logic for Studio
  const addSpeaker = () => {
    if (speakers.length >= 4) return;
    setSpeakers([...speakers, { name: `Speaker ${speakers.length + 1}`, voice: VOICES[language][0], language }]);
  };

  const updateSpeaker = (index, field, value) => {
    const newSpeakers = [...speakers];
    newSpeakers[index][field] = value;
    setSpeakers(newSpeakers);
  };

  const generateScript = async () => {
    if ((inputMode === 'topic' && !topic) || (inputMode === 'content' && !content) || !llmKey) {
      setError('Please provide topic/content and Gemini API Key.');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-script`, {
        input_mode: inputMode, topic, content, language, duration, speakers, llm_api_key: llmKey
      });
      setGeneratedScript(response.data.script);
      setStudioStep('script');
    } catch (err) {
      setError(err.response?.data?.detail || 'Script generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const regeneratePart = async (index) => {
    setIsGenerating(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/regenerate-script-part`, {
        script: generatedScript, index, llm_api_key: llmKey, language
      });
      const newScript = [...generatedScript];
      newScript[index].text = response.data.new_text;
      setGeneratedScript(newScript);
    } catch (err) {
      setError('Regeneration failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async () => {
    if (!fonadaKey) {
      setError('Please provide Fonada API Key.');
      return;
    }
    setError('');
    setIsGenerating(true);
    setAudioUrl('');
    setStudioStep('processing');
    try {
      console.log('Sending audio generation request with script:', generatedScript);
      const response = await axios.post(`${API_BASE_URL}/audio-from-script`, {
        script: generatedScript, speakers, channels, fonada_api_key: fonadaKey
      });
      console.log('Backend response:', response.data);
      if (response.data.audio_url) {
        setAudioUrl(response.data.audio_url);
        setAudioFilename(response.data.filename);
        setStudioStep('done');
      } else {
        throw new Error('Backend returned success but no audio URL.');
      }
    } catch (err) {
      console.error('Audio generation error:', err);
      setError(err.response?.data?.detail || err.message || 'Audio generation failed.');
      setStudioStep('script');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setIsGenerating(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-content`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setContent(response.data.content);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async () => {
    if (!audioFilename) {
      setError('Audio filename missing.');
      return;
    }
    setError('');
    setIsVideoGenerating(true);
    setVideoUrl('');

    const formData = new FormData();
    formData.append('audio_filename', audioFilename);
    formData.append('title', topic || 'My Podcast');

    try {
      const response = await axios.post(`${API_BASE_URL}/create-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVideoUrl(response.data.video_url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Video generation failed.');
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const publishToSpotify = async () => {
    if (!audioUrl || !audioFilename) {
      setError('Audio generation not complete.');
      return;
    }
    if (!userEmail || !userEmail.includes('@')) {
      setError('Please provide a valid email to generate your RSS feed.');
      return;
    }
    setError('');
    setIsPublishing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/publish-to-rss`, {
        title: topic || 'Untitled Episode',
        description: `Generated podcast about ${topic || 'AI'}`,
        audio_url: audioUrl,
        filename: audioFilename,
        email: userEmail
      });
      setRssUrl(response.data.rss_url);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to publish to RSS.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="app-container">
      <button
        className="secondary theme-toggle"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <main style={{ minHeight: '60vh' }}>
        {view === 'home' && <LandingPage setView={setView} />}
        {view === 'studio' && (
          <StudioView
            setView={setView}
            studioStep={studioStep}
            setStudioStep={setStudioStep}
            inputMode={inputMode}
            setInputMode={setInputMode}
            topic={topic}
            setTopic={setTopic}
            content={content}
            setContent={setContent}
            language={language}
            setLanguage={setLanguage}
            duration={duration}
            setDuration={setDuration}
            channels={channels}
            setChannels={setChannels}
            speakers={speakers}
            setSpeakers={setSpeakers}
            VOICES={VOICES}
            fonadaKey={fonadaKey}
            setFonadaKey={setFonadaKey}
            llmKey={llmKey}
            setLlmKey={setLlmKey}
            isGenerating={isGenerating}
            generateScript={generateScript}
            regeneratePart={regeneratePart}
            generateAudio={generateAudio}
            generatedScript={generatedScript}
            setGeneratedScript={setGeneratedScript}
            updateSpeaker={updateSpeaker}
            addSpeaker={addSpeaker}
            audioUrl={audioUrl}
            setAudioUrl={setAudioUrl}
            error={error}
            showTopicExplorer={showTopicExplorer}
            setShowTopicExplorer={setShowTopicExplorer}
            handleFileUpload={handleFileUpload}
            publishPlatform={publishPlatform}
            setPublishPlatform={setPublishPlatform}
            generateVideo={generateVideo}
            isVideoGenerating={isVideoGenerating}
            videoUrl={videoUrl}
            publishToSpotify={publishToSpotify}
            isPublishing={isPublishing}
            rssUrl={rssUrl}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
          />
        )}
      </main>

      <footer style={{ marginTop: '6rem', paddingTop: '4rem', borderTop: '1px solid var(--card-border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>© 2026 FonadaLabs Podcast Studio. Powered by Advance Fonadaabs TTS.</p>
      </footer>
    </div>
  );
}

// Sub-components

const PricingCard = ({ script }) => {
  const totalChars = script.reduce((sum, line) => sum + line.text.length, 0);
  const totalCredits = Math.ceil(totalChars / 10);
  const costINR = (totalChars / 10000) * 12;
  const costUSD = costINR / 83; // Approx exchange rate

  const overLimitLines = script.filter(line => line.text.length > 450).length;

  return (
    <div className="glass-card pricing-card" style={{
      marginBottom: '2rem',
      padding: '1.5rem',
      border: '1px solid var(--primary)',
      background: 'rgba(99, 102, 241, 0.05)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2rem',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'slideDown 0.4s ease'
    }}>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Total Characters</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{totalChars.toLocaleString()}</div>
      </div>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Credits Required</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{totalCredits.toLocaleString()}</div>
      </div>
      <div className="stat-divider" style={{ width: '1px', height: '40px', background: 'var(--card-border)' }}></div>
      <div className="stat-item" style={{ textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>Estimated Cost</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          ₹{costINR.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ ${costUSD.toFixed(3)}</span>
        </div>
      </div>

      {overLimitLines > 0 && (
        <div style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.6rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '0.6rem',
          color: '#ef4444',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Settings size={14} />
          Warning: {overLimitLines} line{overLimitLines > 1 ? 's' : ''} exceed the 450 character limit per request.
          Please split them for successful generation.
        </div>
      )}
    </div>
  );
};

const TopicExplorer = ({ topic, setTopic, llmKey, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedTopic, setSuggestedTopic] = useState('');
  const chatEndRef = React.useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const formatMessage = (content) => {
    // Basic markdown-ish formatter
    const lines = content.replace(/FINAL_TOPIC: .*/, '').trim().split('\n');
    return lines.map((line, i) => {
      let formattedLine = line;
      // Bold
      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      const elements = boldParts.map((part, j) => {
        if (j % 2 === 1) return <strong key={j}>{part}</strong>;
        return part;
      });

      return <p key={i} style={{ marginBottom: '0.6rem' }}>{elements}</p>;
    });
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !llmKey) return;

    const newUserMsg = { role: 'user', content: userInput };
    setChatHistory([...chatHistory, newUserMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/brainstorm-topic`, {
        history: chatHistory,
        user_input: userInput,
        llm_api_key: llmKey
      });

      const aiResponse = response.data.response;
      const modelMsg = { role: 'model', content: aiResponse };
      setChatHistory(prev => [...prev, modelMsg]);

      // Detect FINAL_TOPIC
      const finalTopicMatch = aiResponse.match(/FINAL_TOPIC:\s*(.*)/i);
      if (finalTopicMatch && finalTopicMatch[1]) {
        let finalTopic = finalTopicMatch[1].trim();
        // Remove any trailing brackets, quotes or periods
        finalTopic = finalTopic.replace(/[\[\]\"\"\.\!\?]+$/, '').replace(/^[\[\]\"\"\s]+/, '');

        setSuggestedTopic(finalTopic);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting to the brain center." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="topic-explorer-overlay" onClick={onClose}>
      <div className="topic-explorer-card glass-card" onClick={e => e.stopPropagation()}>
        <div className="flex-between explorer-header">
          <h3><Sparkles size={18} className="gradient-text" /> Topic Explorer</h3>
          <button className="secondary close-btn" onClick={onClose}><Plus size={18} style={{ transform: 'rotate(45deg)' }} /></button>
        </div>

        <div className="chat-area">
          {chatHistory.length === 0 && (
            <div className="empty-chat">
              <MessageSquare size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Hi! Let's find the perfect topic for your podcast. What's on your mind?</p>
            </div>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              {msg.role === 'model' ? formatMessage(msg.content) : msg.content}
            </div>
          ))}
          {isTyping && <div className="chat-bubble model typing">...</div>}
          <div ref={chatEndRef} />
        </div>

        {suggestedTopic && (
          <div className="suggestion-box" style={{ animation: 'bounceIn 0.5s ease' }}>
            <p>Ready to go with: <strong>{suggestedTopic}</strong></p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center' }}>
              <button className="primary" onClick={() => {
                setTopic(suggestedTopic);
                onClose();
              }}><Check size={16} /> Apply This Topic</button>
            </div>
          </div>
        )}

        <div className="chat-input-area">
          <input
            placeholder="Type your ideas or preference..."
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
          />
          <button className="primary send-btn" onClick={sendMessage} disabled={isTyping}><ArrowRight size={18} /></button>
        </div>
      </div>
      <style>{`
        @keyframes bounceIn {
            0% { transform: scale(0.9); opacity: 0; }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const LandingPage = ({ setView }) => (
  <div className="landing-container" style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
    <div style={{ display: 'inline-flex', padding: '0.6rem 1.2rem', borderRadius: '2rem', background: 'var(--card-bg)', border: '1px solid var(--card-border)', marginBottom: '2rem', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--primary)' }}>
      <Sparkles size={18} /> Experience the Future of Audio
    </div>

    <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
      Professional Podcasts <br />
      <span className="gradient-text">Generated in Seconds</span>
    </h1>

    <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '3.5rem', lineHeight: '1.6' }}>
      FonadaLabs Podcast Studio combines cutting-edge AI with high-fidelity <br />
      Indian language synthesis to transform your ideas into captivating conversations.
    </p>

    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '6rem' }}>
      <button className="primary" style={{ padding: '1.2rem 2.5rem', fontSize: '1.15rem' }} onClick={() => setView('studio')}>
        Generate Your Own Podcast <ArrowRight size={20} />
      </button>
    </div>

    <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
      {[
        { icon: <Mic2 />, title: 'Natural Voices', text: '50+ hyper-realistic Indian voices.' },
        { icon: <Globe />, title: 'Multi-Language', text: 'Support for Hindi, Tamil, Telugu & English.' },
        { icon: <Star />, title: 'Studio Grade', text: 'Crystal clear Stereo & Mono production.' }
      ].map((f, i) => (
        <div key={i} className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>{f.icon}</div>
          <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{f.text}</p>
        </div>
      ))}
    </div>
  </div>
);


const StudioView = ({
  setView, studioStep, setStudioStep, inputMode, setInputMode, topic, setTopic,
  content, setContent, language, setLanguage,
  duration, setDuration, channels, setChannels,
  speakers, setSpeakers, VOICES, fonadaKey, setFonadaKey,
  llmKey, setLlmKey, isGenerating, generateScript, regeneratePart, generateAudio,
  generatedScript, setGeneratedScript, updateSpeaker, addSpeaker,
  audioUrl, setAudioUrl, error, showTopicExplorer, setShowTopicExplorer,
  handleFileUpload,
  publishPlatform, setPublishPlatform,
  generateVideo, isVideoGenerating, videoUrl,
  publishToSpotify, isPublishing, rssUrl,
  userEmail, setUserEmail
}) => {
  return (
    <div className="studio-container" style={{ paddingTop: '3rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '0.8rem' }}>Studio <span className="gradient-text">Workbench</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {studioStep === 'config' && "Configure your podcast parameters."}
          {studioStep === 'script' && "Review and edit your generated script."}
          {studioStep === 'processing' && "Synthesizing high-fidelity audio..."}
          {studioStep === 'done' && "Your podcast is ready for publishing!"}
        </p>
      </header>

      {studioStep === 'config' && (
        <>
          <button className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '2rem' }} onClick={() => setView('home')}>
            <Home size={14} /> Back to Home
          </button>
          <div className="main-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section className="glass-card">
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Settings size={22} className="gradient-text" /> Engine Settings
                </h2>
                <div className="form-group">
                  <label>API Keys</label>
                  <input type="password" placeholder="Fonada API Key" value={fonadaKey} onChange={(e) => setFonadaKey(e.target.value)} />
                  <input type="password" placeholder="Gemini API Key" value={llmKey} onChange={(e) => setLlmKey(e.target.value)} style={{ marginTop: '0.8rem' }} />
                </div>
                <div className="form-group">
                  <label>Mode</label>
                  <div className="toggle-group">
                    <div className={`toggle-item ${inputMode === 'topic' ? 'active' : ''}`} onClick={() => setInputMode('topic')}><Globe size={14} /> Topic</div>
                    <div className={`toggle-item ${inputMode === 'content' ? 'active' : ''}`} onClick={() => setInputMode('content')}><FileText size={14} /> Content</div>
                    <div className={`toggle-item ${inputMode === 'upload' ? 'active' : ''}`} onClick={() => setInputMode('upload')}><Upload size={14} /> Upload</div>
                  </div>
                </div>
                {inputMode === 'topic' ? (
                  <div className="form-group">
                    <div className="flex-between">
                      <label>Topic</label>
                      <button
                        className="secondary"
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.7rem', height: 'auto', marginBottom: '0.4rem' }}
                        onClick={() => setShowTopicExplorer(true)}
                      >
                        <Sparkles size={12} /> Brainstorm with AI
                      </button>
                    </div>
                    <input placeholder="e.g. AI in Agriculture" value={topic} onChange={(e) => setTopic(e.target.value)} />
                    {showTopicExplorer && (
                      <TopicExplorer
                        topic={topic}
                        setTopic={setTopic}
                        llmKey={llmKey}
                        onClose={() => setShowTopicExplorer(false)}
                      />
                    )}
                  </div>
                ) : inputMode === 'content' ? (
                  <div className="form-group"><label>Content</label><textarea placeholder="Paste text here..." rows={5} value={content} onChange={(e) => setContent(e.target.value)} /></div>
                ) : (
                  <div className="form-group">
                    <label>Upload Document (.pdf, .txt)</label>
                    <div style={{
                      border: '2px dashed var(--card-border)',
                      borderRadius: '1rem',
                      padding: '2rem',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }} onClick={() => document.getElementById('fileUpload').click()}>
                      <Upload size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {content ? "File uploaded and processed!" : "Click to select a file"}
                      </p>
                      <input
                        id="fileUpload"
                        type="file"
                        hidden
                        accept=".pdf,.txt"
                        onChange={handleFileUpload}
                      />
                    </div>
                    {content && (
                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ fontSize: '0.8rem' }}>Extracted Content Preview</label>
                        <textarea
                          rows={4}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group"><label>Language</label><select value={language} onChange={(e) => {
                    setLanguage(e.target.value);
                    setSpeakers(speakers.map(s => ({ ...s, language: e.target.value, voice: VOICES[e.target.value][0] })));
                  }}>
                    {Object.keys(VOICES).map(l => <option key={l} value={l}>{l}</option>)}
                  </select></div>
                  <div className="form-group"><label>Audio</label><div className="toggle-group">
                    <div className={`toggle-item ${channels === 'mono' ? 'active' : ''}`} onClick={() => setChannels('mono')}>Mono</div>
                    <div className={`toggle-item ${channels === 'stereo' ? 'active' : ''}`} onClick={() => setChannels('stereo')}>Stereo</div>
                  </div></div>
                </div>
                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                    style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-main)', padding: '0.8rem', borderRadius: '0.6rem', width: '100%' }}
                  />
                </div>
              </section>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <section className="glass-card">
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                  <h2><Speaker size={22} className="gradient-text" /> Voice Artists</h2>
                  <button className="primary" onClick={addSpeaker} disabled={speakers.length >= 4} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}><Plus size={14} /> Add</button>
                </div>
                {speakers.map((s, i) => (
                  <div key={i} className="speaker-card">
                    {speakers.length > 1 && <button className="remove-btn" onClick={() => setSpeakers(speakers.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}><label>Nickname</label><input value={s.name} onChange={(e) => updateSpeaker(i, 'name', e.target.value)} /></div>
                      <div className="form-group" style={{ margin: 0 }}><label>Voice</label><select value={s.voice} onChange={(e) => updateSpeaker(i, 'voice', e.target.value)}>{VOICES[s.language]?.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '2rem' }}>
                  <button className="primary" style={{ width: '100%', height: '3.5rem' }} onClick={generateScript} disabled={isGenerating}>
                    {isGenerating ? <><Loader2 className="loading-pulse" /> Generating Script...</> : <><Sparkles size={20} /> Generate Script</>}
                  </button>
                  {error && <p style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center', fontWeight: 600 }}>{error}</p>}
                </div>
              </section>
            </div>
          </div>
        </>
      )}

      {studioStep === 'script' && (
        <div className="script-editor">
          <div className="flex-between" style={{ marginBottom: '2rem' }}>
            <button className="secondary" onClick={() => setStudioStep('config')}><ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Config</button>
            <button className="primary" style={{ padding: '0.8rem 2rem' }} onClick={generateAudio} disabled={isGenerating}>
              {isGenerating ? <><Loader2 className="loading-pulse" /> Preparing Audio...</> : <><Play size={18} fill="currentColor" /> Finish & Generate Audio</>}
            </button>
          </div>

          <PricingCard script={generatedScript} />

          {generatedScript.map((line, idx) => {
            const speakerName = line.speaker || "Unknown";
            const isHost = speakerName.toLowerCase().includes('host') || idx % 2 === 0;
            return (
              <div key={idx} className={`script-line ${isHost ? 'host' : 'guest'}`}>
                <div className="script-speaker">
                  <div className="speaker-badge">{speakerName}</div>
                </div>
                <div className="script-content">
                  <textarea
                    value={line.text}
                    onChange={(e) => {
                      const newScript = [...generatedScript];
                      newScript[idx].text = e.target.value;
                      setGeneratedScript(newScript);
                    }}
                  />
                </div>
                <div className="script-actions">
                  <button className="action-btn" title="Regenerate this line" onClick={() => regeneratePart(idx)}>
                    <RotateCw size={22} strokeWidth={3} className={isGenerating ? 'spinning' : ''} />
                  </button>
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <button className="primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem' }} onClick={generateAudio} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="loading-pulse" /> : <><Play size={22} fill="currentColor" /> Generate Full Podcast</>}
            </button>
            {error && <p style={{ color: '#ef4444', marginTop: '1rem', fontWeight: 600 }}>{error}</p>}
          </div>
        </div>
      )}

      {studioStep === 'processing' && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div className="loading-container" style={{ marginBottom: '2rem' }}>
            <Loader2 size={64} className="loading-pulse" style={{ color: 'var(--primary)' }} />
          </div>
          <h2>Synthesizing Your Podcast</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>This usually takes 1-2 minutes depending on the duration.</p>
        </div>
      )}

      {(studioStep === 'done' || audioUrl) && (
        <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <div className="audio-section glass-card" style={{ border: '2px solid var(--primary)', marginBottom: '2rem' }}>
            <div className="flex-between">
              <h3><MessageSquare size={18} className="gradient-text" /> Final Production</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="secondary" onClick={() => setStudioStep('script')}>Edit Script Again</button>
                {audioUrl && <a href={audioUrl} download><button className="primary" style={{ padding: '0.4rem 1rem' }}><Download size={16} /> Export MP3</button></a>}
              </div>
            </div>
            {audioUrl ? (
              <audio controls src={audioUrl} style={{ marginTop: '1.2rem', width: '100%', borderRadius: '1rem' }} />
            ) : (
              <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '1rem', border: '1px solid #ef4444' }}>
                <p style={{ color: '#ef4444', fontWeight: 600 }}>Audio generated but the file URL is missing. Please try again or check logs.</p>
              </div>
            )}

            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--card-border)' }}>
              <h4 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Choose Publishing Platform</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div
                  className={`glass-card platform-card ${publishPlatform === 'youtube' ? 'active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: publishPlatform === 'youtube' ? '2px solid #ff0000' : '1px solid var(--card-border)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setPublishPlatform('youtube')}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📺</div>
                  <strong>YouTube</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate video with background</p>
                </div>
                <div
                  className={`glass-card platform-card ${publishPlatform === 'spotify' ? 'active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: publishPlatform === 'spotify' ? '2px solid #1DB954' : '1px solid var(--card-border)',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setPublishPlatform('spotify')}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎧</div>
                  <strong>Spotify</strong>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate RSS Feed for Spotify</p>
                </div>
              </div>

              {publishPlatform === 'youtube' && (
                <div style={{ marginTop: '2rem', animation: 'slideUp 0.4s ease' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Ready to generate your video with a beautiful waveform and podcast title!
                  </p>

                  <button
                    className="primary"
                    style={{ width: '100%', marginTop: '1rem', height: '3.5rem', background: '#ff0000' }}
                    onClick={generateVideo}
                    disabled={isVideoGenerating}
                  >
                    {isVideoGenerating ? <><Loader2 className="loading-pulse" /> Generating Video...</> : <><Sparkles size={18} /> Create YouTube Video</>}
                  </button>

                  {videoUrl && (
                    <div style={{ marginTop: '2rem', animation: 'fadeIn 0.5s ease' }}>
                      <h4 style={{ marginBottom: '1rem' }}>Generated Video</h4>
                      <video controls src={videoUrl} style={{ width: '100%', borderRadius: '1rem', border: '1px solid var(--primary)' }} />
                      <a href={videoUrl} download style={{ display: 'block', marginTop: '1rem' }}>
                        <button className="secondary" style={{ width: '100%' }}><Download size={16} /> Download MP4</button>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {publishPlatform === 'spotify' && (
                <div style={{ marginTop: '2rem', animation: 'slideUp 0.4s ease' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Generate a unique RSS feed tied to your email.
                  </p>

                  <div className="form-group" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                    <label>Your Email (for Spotify Verification)</label>
                    <input
                      type="email"
                      placeholder="e.g. you@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                    />
                  </div>

                  <button
                    className="primary"
                    style={{ width: '100%', marginTop: '1rem', height: '3.5rem', background: '#1DB954' }}
                    onClick={publishToSpotify}
                    disabled={isPublishing}
                  >
                    {isPublishing ? <><Loader2 className="loading-pulse" /> Generating Feed...</> : <><Sparkles size={18} /> Publish to My RSS Feed</>}
                  </button>

                  {rssUrl && (
                    <div style={{
                      marginTop: '2rem',
                      padding: '1.5rem',
                      background: 'rgba(29, 185, 84, 0.1)',
                      border: '1px solid #1DB954',
                      borderRadius: '1rem',
                      animation: 'fadeIn 0.5s ease'
                    }}>
                      <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <h4 style={{ color: '#1DB954', margin: 0 }}>RSS Feed Live!</h4>
                        <Check size={20} style={{ color: '#1DB954' }} />
                      </div>
                      <p style={{ fontSize: '0.85rem', marginBottom: '1.2rem' }}>Unique Feed URL generated. Submit this to Spotify for Podcasters once to link your shows.</p>

                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        background: 'var(--input-bg)',
                        padding: '0.8rem',
                        borderRadius: '0.6rem',
                        border: '1px solid var(--card-border)',
                        marginBottom: '1.5rem'
                      }}>
                        <code style={{ fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{rssUrl}</code>
                        <button
                          className="secondary"
                          style={{ padding: '0.2rem 0.6rem', height: 'auto', fontSize: '0.7rem' }}
                          onClick={() => {
                            navigator.clipboard.writeText(rssUrl);
                          }}
                        >
                          Copy
                        </button>
                      </div>

                      <button
                        className="primary"
                        style={{ width: '100%', background: '#fff', color: '#000', border: 'none', fontWeight: 600 }}
                        onClick={() => window.open('https://creators.spotify.com/dash/submit', '_blank')}
                      >
                        <ArrowRight size={16} /> Open Spotify for Creators
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '3rem' }}>
            <button className="primary" style={{ padding: '1rem 3rem' }} onClick={() => {
              setAudioUrl('');
              setStudioStep('config');
              setTopic('');
              setContent('');
              setGeneratedScript([]);
            }}>
              <Plus size={18} /> Generate Another Podcast
            </button>
            <button className="secondary" style={{ padding: '1rem 2rem' }} onClick={() => setView('home')}>
              <Home size={18} /> Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
