import React, { useState } from 'react';
import { Send, Mic, Volume2, Loader2, Plus, MessageSquare, Trash2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createPortal } from 'react-dom';

const InterviewCopilot = () => {
    // ... existing state ...
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: "Hello! I'm your Interview Copilot. I can help you practice technical questions or refine your answers. What role are you preparing for?" }
    ]);
    const [input, setInput] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // State for sessions
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ show: false, sessionId: null });

    // Initial load
    React.useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('http://localhost:8000/chat/sessions');
            setSessions(res.data);

            // If we have sessions but no current one selected, select the most recent
            if (res.data.length > 0 && !currentSessionId) {
                // Optional: Auto-load first session
                // loadSession(res.data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    };

    const createNewSession = async () => {
        try {
            const res = await axios.post('http://localhost:8000/chat/sessions', null, {
                params: { title: `Interview Practice ${new Date().toLocaleDateString()}` }
            });
            setSessions(prev => [res.data, ...prev]);
            setCurrentSessionId(res.data.id);
            setMessages([{ id: Date.now(), sender: 'ai', text: "Ready for a new session! What topic shall we cover?" }]);
        } catch (err) {
            console.error("Failed to create session", err);
        }
    };

    const promptDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        setDeleteModal({ show: true, sessionId });
    };

    const confirmDeleteSession = async () => {
        const sessionId = deleteModal.sessionId;
        if (!sessionId) return;

        try {
            await axios.delete(`http://localhost:8000/chat/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s.id !== sessionId));

            // If deleted session was active, reset view
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([{ id: Date.now(), sender: 'ai', text: "Session deleted. Start a new one!" }]);
            }
            setDeleteModal({ show: false, sessionId: null });
        } catch (err) {
            console.error("Failed to delete session", err);
        }
    };

    const loadSession = async (sessionId) => {
        try {
            setIsLoading(true);
            const res = await axios.get(`http://localhost:8000/chat/sessions/${sessionId}`);
            setCurrentSessionId(sessionId);

            // Convert DB messages to UI format
            const uiMessages = res.data.messages.map(m => ({
                id: m.id,
                sender: m.sender,
                text: m.content
            }));

            if (uiMessages.length === 0) {
                setMessages([{ id: Date.now(), sender: 'ai', text: "History loaded. Resume your practice!" }]);
            } else {
                setMessages(uiMessages);
            }
        } catch (err) {
            console.error("Failed to load session", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Ensure we have a session
        let activeSessionId = currentSessionId;
        if (!activeSessionId) {
            // Create session implicitly if none exists
            try {
                const res = await axios.post('http://localhost:8000/chat/sessions', null, {
                    params: { title: `Session created ${new Date().toLocaleTimeString()}` }
                });
                setSessions(prev => [res.data, ...prev]);
                activeSessionId = res.data.id;
                setCurrentSessionId(activeSessionId);
            } catch (err) {
                console.error("Auto-create session failed", err);
                return;
            }
        }

        const userMessage = { id: Date.now(), sender: 'user', text: input };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages.map(msg => ({
                role: msg.sender === 'ai' ? 'model' : 'user',
                content: msg.text
            }));

            const payload = {
                history: history,
                message: userMessage.text,
                context: "Candidate is preparing for a technical interview."
            };

            // Pass session_id
            const response = await axios.post(`http://localhost:8000/interview-chat?session_id=${activeSessionId}`, payload);

            if (response.data && response.data.response) {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: response.data.response
                }]);

                if (response.data.confidence) {
                    setConfidence(Math.round(response.data.confidence * 100));
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Sorry, I'm having trouble connecting to the interview server. Please ensure the backend is running."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', gap: '20px' }}>

            {/* Left Sidebar: Previous Chats */}
            <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>History</h2>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>

                    {sessions.map(session => (
                        <div
                            key={session.id}
                            onClick={() => loadSession(session.id)}
                            className="hover-lift"
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: currentSessionId === session.id ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255,255,255,0.05)',
                                marginBottom: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: currentSessionId === session.id ? '1px solid var(--primary)' : '1px solid transparent',
                                position: 'relative' // For absolute positioning of trash if needed, or flex
                            }}
                        >
                            <MessageSquare size={18} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {new Date(session.created_at || Date.now()).toLocaleDateString()}
                                </div>
                            </div>
                            <button
                                onClick={(e) => promptDeleteSession(e, session.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    opacity: 0.6,
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                title="Delete History"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {sessions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            No history yet. Start a chat!
                        </div>
                    )}

                </div>
                <div style={{ padding: '15px', borderTop: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={createNewSession}
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Plus size={18} />
                        <span>New Interview</span>
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                        {currentSessionId ? 'Current Session' : 'Select or Start a Session'}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)' }}>
                        <Volume2 size={18} />
                        <span style={{ fontSize: '0.9rem' }}>Voice Active</span>
                    </div>
                </div>

                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {messages.map((msg, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                            }}
                        >
                            <div style={{
                                padding: '15px 20px',
                                borderRadius: '16px',
                                background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                borderTopLeftRadius: msg.sender === 'ai' ? '4px' : '16px',
                                lineHeight: '1.6',
                                fontSize: '0.95rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                {msg.sender === 'ai' ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({ node, ...props }) => <p style={{ marginBottom: '0.8rem', color: 'inherit' }} {...props} />,
                                            ul: ({ node, ...props }) => <ul style={{ marginLeft: '1.2rem', marginBottom: '0.8rem', listStyleType: 'disc', color: 'inherit' }} {...props} />,
                                            ol: ({ node, ...props }) => <ol style={{ marginLeft: '1.2rem', marginBottom: '0.8rem', listStyleType: 'decimal', color: 'inherit' }} {...props} />,
                                            li: ({ node, ...props }) => <li style={{ marginBottom: '0.4rem', color: 'inherit' }} {...props} />,
                                            strong: ({ node, ...props }) => <strong style={{ fontWeight: '700', color: 'var(--success)' }} {...props} />,
                                            h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.8rem', color: 'white' }} {...props} />,
                                            h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.8rem', color: 'white' }} {...props} />,
                                            h3: ({ node, ...props }) => <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.6rem', color: 'white' }} {...props} />,
                                            code: ({ node, inline, className, children, ...props }) => {
                                                return inline ? (
                                                    <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em', fontFamily: 'monospace' }} {...props}>
                                                        {children}
                                                    </code>
                                                ) : (
                                                    <code style={{ display: 'block', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', fontSize: '0.9em', fontFamily: 'monospace', overflowX: 'auto', marginBottom: '0.8rem' }} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                ) : (
                                    msg.text
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ alignSelf: 'flex-start', maxWidth: '80%' }}
                        >
                            <div style={{
                                padding: '15px 20px',
                                borderRadius: '16px',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                borderTopLeftRadius: '4px',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center'
                            }}>
                                <Loader2 className="animate-spin" size={16} />
                                <span>Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div style={{ padding: '20px', background: 'var(--glass-bg)', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-ghost" style={{ padding: '12px', borderRadius: '50%', border: '1px solid var(--glass-border)' }}>
                            <Mic size={20} />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Type or speak your answer..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        />
                        <button
                            onClick={handleSend}
                            className="btn-primary"
                            disabled={isLoading}
                            style={{ padding: '10px 15px', display: 'flex', alignItems: 'center', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* DELETE MODAL */}
            {deleteModal.show && createPortal(
                <AnimatePresence>
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel"
                            style={{ width: '400px', padding: '24px', position: 'relative', border: '1px solid var(--glass-border)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                        >
                            <button
                                onClick={() => setDeleteModal({ show: false, sessionId: null })}
                                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>Delete Session?</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        Are you sure you want to delete this interview session? This action cannot be undone.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                                    <button
                                        onClick={() => setDeleteModal({ show: false, sessionId: null })}
                                        className="btn-ghost"
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteSession}
                                        className="btn-primary"
                                        style={{ flex: 1, justifyContent: 'center', background: 'var(--error)', borderColor: 'var(--error)' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}

        </div>
    );
};

export default InterviewCopilot;
