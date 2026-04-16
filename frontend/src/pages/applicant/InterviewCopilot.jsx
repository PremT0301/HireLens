import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Send, Loader2, Plus, MessageSquare, Trash2,
    RotateCcw, Volume2, VolumeX, AlertTriangle, Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jwtDecode } from 'jwt-decode';

import Skeleton from '../../components/ui/Skeleton';
import { NoSessionsState } from '../../components/ui/EmptyState';
import ConfirmModal from '../../components/ui/ConfirmModal';
import MicButton from '../../components/ui/MicButton';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis';

const API_BASE = 'http://localhost:8000';

// ── Markdown renderer components (shared) ──────────────────────────────────
const mdComponents = {
    p: ({ node, ...props }) => <p style={{ marginBottom: '0.7rem', color: 'inherit' }} {...props} />,
    ul: ({ node, ...props }) => <ul style={{ marginLeft: '1.2rem', marginBottom: '0.7rem', color: 'inherit' }} {...props} />,
    ol: ({ node, ...props }) => <ol style={{ marginLeft: '1.2rem', marginBottom: '0.7rem', color: 'inherit' }} {...props} />,
    li: ({ node, ...props }) => <li style={{ marginBottom: '0.3rem', color: 'inherit' }} {...props} />,
    strong: ({ node, ...props }) => <strong style={{ fontWeight: '700', color: 'var(--success)' }} {...props} />,
    h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.7rem' }} {...props} />,
    h2: ({ node, ...props }) => <h2 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem' }} {...props} />,
    h3: ({ node, ...props }) => <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.5rem' }} {...props} />,
    code: ({ node, inline, children, ...props }) =>
        inline ? (
            <code style={{ background: 'rgba(255,255,255,0.12)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.88em', fontFamily: 'monospace' }} {...props}>{children}</code>
        ) : (
            <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '0.88em', fontFamily: 'monospace', overflowX: 'auto', marginBottom: '0.7rem' }} {...props}>{children}</code>
        ),
};

// ── Typing indicator  ───────────────────────────────────────────────────────
const TypingIndicator = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
        <div style={{ padding: '14px 20px', borderRadius: '16px', borderTopLeftRadius: '4px', background: 'var(--bg-secondary)' }}>
            <div className="typing-indicator">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════
const InterviewCopilot = () => {
    // ── Core state ──────────────────────────────────────────────────────────
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [streamingText, setStreamingText] = useState('');   // current SSE chunk buffer

    // ── Session state ────────────────────────────────────────────────────────
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    // ── Modal state ──────────────────────────────────────────────────────────
    const [deleteModal, setDeleteModal] = useState({ show: false, sessionId: null });

    // ── Refs ─────────────────────────────────────────────────────────────────
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const currentSessionIdRef = useRef(null); // always in sync for async callbacks

    useEffect(() => { currentSessionIdRef.current = currentSessionId; }, [currentSessionId]);

    // ── TTS hook ─────────────────────────────────────────────────────────────
    const { speak, stop: stopTts, isSpeaking } = useSpeechSynthesis();
    const [speakingMsgId, setSpeakingMsgId] = useState(null);

    const handleTts = useCallback((msg) => {
        if (speakingMsgId === msg.id) {
            stopTts();
            setSpeakingMsgId(null);
        } else {
            setSpeakingMsgId(msg.id);
            speak(msg.text);
        }
    }, [speakingMsgId, speak, stopTts]);

    // Keep speakingMsgId in sync with TTS state
    useEffect(() => {
        if (!isSpeaking) setSpeakingMsgId(null);
    }, [isSpeaking]);

    // ── Voice recognition hook ────────────────────────────────────────────────
    const handleFinalTranscript = useCallback((text) => {
        setInput(text);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, []);

    const handleInterimTranscript = useCallback((text) => {
        setInput(text);
    }, []);

    const {
        isListening,
        error: voiceError,
        isSupported: voiceSupported,
        startListening,
        stopListening,
    } = useSpeechRecognition({
        lang: 'en-US',
        silenceTimeoutMs: 5000,
        onFinalTranscript: handleFinalTranscript,
        onInterimTranscript: handleInterimTranscript,
    });

    const toggleMic = useCallback(() => {
        if (isListening) stopListening();
        else startListening();
    }, [isListening, startListening, stopListening]);

    // ── Auth ─────────────────────────────────────────────────────────────────
    const getUserId = useCallback(() => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) return null;
            const decoded = jwtDecode(token);
            return (
                decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
                decoded.nameid || decoded.sub || decoded.userId || null
            );
        } catch {
            return null;
        }
    }, []);

    // ── Auto-scroll ───────────────────────────────────────────────────────────
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingText, isLoading]);

    // ── Session Management ────────────────────────────────────────────────────
    useEffect(() => { fetchSessions(); }, []);

    const fetchSessions = async () => {
        const userId = getUserId();
        if (!userId) { setSessionsLoading(false); return; }
        try {
            setSessionsLoading(true);
            const res = await axios.get(`${API_BASE}/chat/sessions`, { params: { applicant_id: userId } });
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setSessionsLoading(false);
        }
    };

    const startNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setInput('');
        stopTts();
    };

    const loadSession = async (sessionId) => {
        const userId = getUserId();
        if (!userId) return;
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_BASE}/chat/sessions/${sessionId}`, { params: { applicant_id: userId } });
            setCurrentSessionId(sessionId);
            const uiMessages = res.data.messages.map(m => ({ id: m.id, sender: m.sender, text: m.content }));
            setMessages(uiMessages.length === 0
                ? [{ id: Date.now(), sender: 'ai', text: 'History loaded. Resume your practice!' }]
                : uiMessages
            );
        } catch (err) {
            console.error('Failed to load session', err);
            if (err.response?.status === 403) setCurrentSessionId(null);
        } finally {
            setIsLoading(false);
        }
    };

    const promptDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        setDeleteModal({ show: true, sessionId });
    };

    const confirmDeleteSession = async () => {
        const sessionId = deleteModal.sessionId;
        if (!sessionId) return;
        const userId = getUserId();
        if (!userId) return;
        try {
            await axios.delete(`${API_BASE}/chat/sessions/${sessionId}`, { params: { applicant_id: userId } });
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) startNewChat();
            setDeleteModal({ show: false, sessionId: null });
        } catch (err) {
            console.error('Failed to delete session', err);
            if (err.response?.status === 403) alert('Access denied: This session belongs to another applicant');
        }
    };

    // ── Send / Streaming ──────────────────────────────────────────────────────
    const ensureSession = async (userId) => {
        if (currentSessionIdRef.current) return currentSessionIdRef.current;
        const res = await axios.post(`${API_BASE}/chat/sessions`, null, {
            params: { title: 'New Interview Session', applicant_id: userId }
        });
        setSessions(prev => [res.data, ...prev]);
        setCurrentSessionId(res.data.id);
        return res.data.id;
    };

    const sendMessage = useCallback(async (textOverride) => {
        const text = (textOverride ?? input).trim();
        if (!text || isLoading) return;

        const userId = getUserId();
        if (!userId) { alert('Please login to use the Interview Copilot'); return; }

        // Clear input immediately so the bar feels responsive
        setInput('');

        // Stop any ongoing TTS / mic
        stopTts();
        if (isListening) stopListening();

        let activeSessionId;
        try {
            activeSessionId = await ensureSession(userId);
        } catch (err) {
            console.error('Auto-create session failed', err);
            return;
        }

        const userMsg = { id: Date.now(), sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setStreamingText('');

        const history = messages.map(m => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            content: m.text
        }));

        const payload = {
            history,
            message: text,
            context: 'Candidate is preparing for a technical interview.'
        };

        try {
            const response = await fetch(
                `${API_BASE}/interview-chat/stream?session_id=${activeSessionId}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiText = '';
            const aiMsgId = Date.now() + 1;

            // Add placeholder AI message that we'll update in-place
            setMessages(prev => [...prev, { id: aiMsgId, sender: 'ai', text: '' }]);
            setIsLoading(false);

            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // keep incomplete line

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    const raw = line.slice(5).trim();
                    if (!raw) continue;
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed.error) {
                            setMessages(prev => prev.map(m =>
                                m.id === aiMsgId
                                    ? { ...m, text: 'Sorry, I encountered an error. Please try again.' }
                                    : m
                            ));
                            break;
                        }
                        if (parsed.delta) {
                            aiText += parsed.delta;
                            setMessages(prev => prev.map(m =>
                                m.id === aiMsgId ? { ...m, text: aiText } : m
                            ));
                        }
                        if (parsed.done && parsed.session_title) {
                            setSessions(prev => prev.map(s =>
                                s.id === activeSessionId ? { ...s, title: parsed.session_title } : s
                            ));
                        }
                    } catch {
                        // malformed line — skip
                    }
                }
            }
        } catch (err) {
            console.error('Streaming error:', err);
            setIsLoading(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 2,
                sender: 'ai',
                text: 'Sorry, I\'m having trouble connecting. Please ensure the backend is running.'
            }]);
        } finally {
            setStreamingText('');
        }
    }, [input, isLoading, messages, getUserId, isListening, stopListening, stopTts]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Retry: resend the last user message
    const retryLastMessage = useCallback(() => {
        const lastUser = [...messages].reverse().find(m => m.sender === 'user');
        if (!lastUser) return;
        // Remove last AI response (if any) so we don't duplicate history
        setMessages(prev => {
            const lastAiIdx = [...prev].reverse().findIndex(m => m.sender === 'ai');
            if (lastAiIdx === -1) return prev;
            const idx = prev.length - 1 - lastAiIdx;
            return prev.slice(0, idx);
        });
        sendMessage(lastUser.text);
    }, [messages, sendMessage]);

    // ── Voice error label ─────────────────────────────────────────────────────
    const voiceErrorLabel = voiceError === 'denied'
        ? '🎙 Microphone access denied — check your browser settings'
        : voiceError === 'no-speech'
        ? '🔇 No speech detected — please try again'
        : voiceError === 'network'
        ? '🌐 Network error in voice recognition'
        : null;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', gap: '20px', paddingTop: '24px', paddingBottom: '20px', boxSizing: 'border-box' }}>

            {/* ── Left Sidebar ── */}
            <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden', alignSelf: 'stretch' }}>
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>History</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {sessionsLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[1, 2, 3].map(i => <Skeleton key={i} variant="list" height="70px" />)}
                        </div>
                    ) : sessions.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px 16px', textAlign: 'center', gap: '12px' }}>
                            <NoSessionsState onAction={startNewChat} variant="sidebar" />
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => loadSession(session.id)}
                                className="hover-lift"
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: currentSessionId === session.id ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: currentSessionId === session.id ? '1px solid var(--primary)' : '1px solid transparent',
                                    position: 'relative',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                <MessageSquare size={18} style={{ color: 'var(--primary)', opacity: 0.8, flexShrink: 0 }} />
                                <div style={{ overflow: 'hidden', flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(session.created_at || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => promptDeleteSession(e, session.id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.6, cursor: 'pointer', padding: '4px', flexShrink: 0, transition: 'color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    title="Delete History"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
                    <button
                        onClick={startNewChat}
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0' }}
                    >
                        <Plus size={18} />
                        <span>+ New Interview</span>
                    </button>
                </div>
            </div>

            {/* ── Main Chat Area ── */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', alignSelf: 'stretch' }}>

                {/* Header */}
                <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                        {currentSessionId ? 'Current Session' : 'Select or Start a Session'}
                    </h2>
                    {/* Retry button — visible when there are messages */}
                    {messages.length > 0 && (
                        <button
                            onClick={retryLastMessage}
                            disabled={isLoading}
                            title="Retry last message"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                                color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: '500',
                                transition: 'all 0.15s ease', opacity: isLoading ? 0.4 : 1
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                            <RotateCcw size={13} />
                            Retry
                        </button>
                    )}
                </div>

                {/* Unsupported browser banner */}
                {!voiceSupported && (
                    <div className="voice-banner" style={{ margin: '12px 24px 0' }}>
                        <AlertTriangle size={15} />
                        Voice input requires Chrome or Edge. Text input still works normally.
                    </div>
                )}

                {/* Messages Area */}
                <div
                    id="copilot-messages"
                    style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                    {/* Welcome screen */}
                    {messages.length === 0 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px' }}
                        >
                            {/* Feature card */}
                            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '28px 32px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                                    What Your Copilot Can Do
                                </div>
                                {[
                                    { icon: '🎙', text: 'Speak your answer — voice input with live transcription' },
                                    { icon: '🎯', text: 'Practice role-specific interview questions' },
                                    { icon: '🧠', text: 'Get instant AI feedback on your answers' },
                                    { icon: '🔊', text: 'Hear AI responses read aloud via Text-to-Speech' },
                                    { icon: '🔁', text: 'Retry questions to sharpen your answers' },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--glass-border)' : 'none' }}>
                                        <span style={{ fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Suggestion chips */}
                            <div style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}>
                                <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '0.02em' }}>
                                    Try asking...
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {[
                                        'Help me prepare for a React developer interview',
                                        'Give me a system design question',
                                        "How do I answer 'Tell me about yourself'?",
                                        'Practice a data structures question with me',
                                    ].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '7px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.15)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Message bubbles */}
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}
                            >
                                {msg.sender === 'ai' ? (
                                    /* AI bubble with TTS button */
                                    <div className="ai-bubble">
                                        <div style={{ padding: '14px 18px', borderRadius: '16px', borderTopLeftRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', lineHeight: '1.65', fontSize: '0.93rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flex: 1 }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                                                {msg.text || ''}
                                            </ReactMarkdown>
                                            {/* Blinking cursor while streaming this message */}
                                            {msg.text === '' && <span className="stream-cursor" />}
                                        </div>
                                        {/* TTS toggle */}
                                        <button
                                            className={`tts-btn${speakingMsgId === msg.id ? ' speaking' : ''}`}
                                            onClick={() => handleTts(msg)}
                                            title={speakingMsgId === msg.id ? 'Stop reading' : 'Read aloud'}
                                            aria-label={speakingMsgId === msg.id ? 'Stop reading' : 'Read response aloud'}
                                            style={{ marginTop: '4px' }}
                                        >
                                            {speakingMsgId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                        </button>
                                    </div>
                                ) : (
                                    /* User bubble */
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <div style={{ padding: '14px 18px', borderRadius: '16px', borderTopRightRadius: '4px', background: 'var(--primary)', color: 'white', lineHeight: '1.6', fontSize: '0.93rem', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator — only while waiting for first byte */}
                    {isLoading && <TypingIndicator />}

                    {/* Scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>

                {/* ── Input Bar ── */}
                <div style={{ padding: '12px 20px 20px', background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
                    {/* Voice error chip */}
                    {voiceErrorLabel && (
                        <div className="mic-error-chip" style={{ marginBottom: '8px' }}>
                            <Wifi size={12} />
                            {voiceErrorLabel}
                        </div>
                    )}

                    {/* Recording hint */}
                    {isListening && (
                        <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: '500', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'mic-pulse 1s infinite' }} />
                            Listening… speak your answer
                        </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: `1px solid ${isListening ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)'}`, padding: '4px 4px 4px 14px', transition: 'border-color 0.2s ease' }}>
                        <input
                            ref={inputRef}
                            id="copilot-input"
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={isListening ? 'Listening…' : 'Type your answer or click 🎤 to speak…'}
                            disabled={isLoading}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.97rem', opacity: isLoading ? 0.7 : 1, padding: '8px 0' }}
                        />
                        {/* Mic button */}
                        <MicButton
                            isListening={isListening}
                            isSupported={voiceSupported}
                            disabled={isLoading}
                            onClick={toggleMic}
                        />
                        {/* Send button */}
                        <button
                            id="copilot-send-btn"
                            onClick={() => sendMessage()}
                            className="btn-primary"
                            disabled={isLoading || !input.trim()}
                            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', borderRadius: '10px', opacity: (isLoading || !input.trim()) ? 0.5 : 1, cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                        >
                            {isLoading
                                ? <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                : <Send size={18} />
                            }
                        </button>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '4px', opacity: 0.7 }}>
                        Press Enter to send · Shift+Enter for new line · 🎤 for voice input
                    </div>
                </div>
            </div>

            {/* ── Delete Modal ── */}
            <ConfirmModal
                isOpen={deleteModal.show}
                onClose={() => setDeleteModal({ show: false, sessionId: null })}
                onConfirm={confirmDeleteSession}
                type="danger"
                title="Delete Session?"
                message="Are you sure you want to delete this interview session? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                loading={isLoading}
            />
        </div>
    );
};

export default InterviewCopilot;
