import React, { useState } from 'react';
import { Send, Loader2, Plus, MessageSquare, Trash2, X, AlertTriangle } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import { NoSessionsState } from '../../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { createPortal } from 'react-dom';
import { jwtDecode } from 'jwt-decode';
import ConfirmModal from '../../components/ui/ConfirmModal';

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
    const [sessionsLoading, setSessionsLoading] = useState(true);

    // Create Modal State


    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ show: false, sessionId: null });

    // Extract userId from JWT token for session isolation
    const getUserId = () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('No authentication token found');
                return null;
            }
            const decoded = jwtDecode(token);
            console.log('Decoded JWT:', decoded); // Debug log
            // Extract userId from ClaimTypes.NameIdentifier (ASP.NET Core format)
            const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
                || decoded.nameid
                || decoded.sub
                || decoded.userId;
            console.log('Extracted userId:', userId); // Debug logy
            return userId;
        } catch (err) {
            console.error('Failed to decode JWT token:', err);
            return null;
        }
    };

    // Initial load
    React.useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        const userId = getUserId();
        if (!userId) {
            console.error('Cannot fetch sessions: User not authenticated');
            setSessionsLoading(false);
            return;
        }

        try {
            setSessionsLoading(true);
            const res = await axios.get('http://localhost:8000/chat/sessions', {
                params: { applicant_id: userId }
            });
            setSessions(res.data);

            // If we have sessions but no current one selected, select the most recent
            if (res.data.length > 0 && !currentSessionId) {
                // Optional: Auto-load first session
                // loadSession(res.data[0].id);
            }
        } catch (err) {
            console.error("Failed to fetch sessions", err);
            if (err.response?.status === 403) {
                console.error('Access denied: Session belongs to another applicant');
            }
        } finally {
            setSessionsLoading(false);
        }
    };

    const startNewChat = () => {
        setCurrentSessionId(null);
        setMessages([
            { id: Date.now(), sender: 'ai', text: "Hello! I'm your Interview Copilot. I can help you practice technical questions or refine your answers. What role are you preparing for?" }
        ]);
    };



    const promptDeleteSession = (e, sessionId) => {
        e.stopPropagation();
        setDeleteModal({ show: true, sessionId });
    };

    const confirmDeleteSession = async () => {
        const sessionId = deleteModal.sessionId;
        if (!sessionId) return;

        const userId = getUserId();
        if (!userId) {
            console.error('Cannot delete session: User not authenticated');
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/chat/sessions/${sessionId}`, {
                params: { applicant_id: userId }
            });
            setSessions(prev => prev.filter(s => s.id !== sessionId));

            // If deleted session was active, reset view
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([{ id: Date.now(), sender: 'ai', text: "Session deleted. Start a new one!" }]);
            }
            setDeleteModal({ show: false, sessionId: null });
        } catch (err) {
            console.error("Failed to delete session", err);
            if (err.response?.status === 403) {
                alert('Access denied: This session belongs to another applicant');
            }
        }
    };

    const loadSession = async (sessionId) => {
        const userId = getUserId();
        if (!userId) {
            console.error('Cannot load session: User not authenticated');
            return;
        }

        try {
            setIsLoading(true);
            const res = await axios.get(`http://localhost:8000/chat/sessions/${sessionId}`, {
                params: { applicant_id: userId }
            });
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
            if (err.response?.status === 403) {
                alert('Access denied: This session belongs to another applicant');
                setCurrentSessionId(null);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userId = getUserId();
        if (!userId) {
            console.error('Cannot send message: User not authenticated');
            alert('Please login to use the Interview Copilot');
            return;
        }

        // Ensure we have a session
        let activeSessionId = currentSessionId;
        if (!activeSessionId) {
            // Create session implicitly if none exists
            try {
                const res = await axios.post('http://localhost:8000/chat/sessions', null, {
                    params: {
                        title: "New Interview Session",
                        applicant_id: userId
                    }
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

                if (response.data.session_title) {
                    // Update session title in the list
                    setSessions(prev => prev.map(s =>
                        s.id === activeSessionId ? { ...s, title: response.data.session_title } : s
                    ));
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
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', gap: '20px', paddingBottom: '20px', boxSizing: 'border-box' }}>

            {/* Left Sidebar: Previous Chats */}
            {/* Left Sidebar */}
            <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column', overflow: 'hidden', alignSelf: 'stretch' }}>
                <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--glass-border)' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>History</h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {sessionsLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} variant="list" height="70px" />
                            ))}
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
                                    background: currentSessionId === session.id ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255,255,255,0.05)',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: currentSessionId === session.id ? '1px solid var(--primary)' : '1px solid transparent',
                                    position: 'relative'
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
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        opacity: 0.6,
                                        cursor: 'pointer',
                                        padding: '4px',
                                        flexShrink: 0
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                                    title="Delete History"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* New Interview button — full-width, anchored to bottom */}
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

            {/* Main Chat Area */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', alignSelf: 'stretch' }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '600', margin: 0 }}>
                        {currentSessionId ? 'Current Session' : 'Select or Start a Session'}
                    </h2>
                </div>

                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
                    {messages.map((msg, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={msg.id}
                            style={{
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                width: msg.sender === 'ai' ? 'auto' : undefined,
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

                    {/* Feature highlights — only shown on fresh/greeting state */}
                    {!currentSessionId && messages.length === 1 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '8px' }}
                        >
                            <div style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '16px',
                                padding: '24px 28px',
                                maxWidth: '560px',
                                width: '100%',
                                alignSelf: 'center'
                            }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                                    What your Copilot can do
                                </div>
                                {[
                                    { icon: '🎯', text: 'Practice role-specific interview questions' },
                                    { icon: '🧠', text: 'Get instant AI feedback on your answers' },
                                    { icon: '📄', text: 'Refine responses based on your resume' },
                                    { icon: '🔁', text: 'Retry questions to improve your score' },
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '10px 0',
                                        borderBottom: i < 3 ? '1px solid var(--glass-border)' : 'none'
                                    }}>
                                        <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

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

                {/* Input Bar */}
                <div style={{
                    padding: '8px 24px 24px',
                    background: 'var(--glass-bg)',
                    borderTop: '1px solid var(--glass-border)',
                    flexShrink: 0
                }}>
                    {/* Suggestion chips — only on fresh state */}
                    {!currentSessionId && messages.length === 1 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}
                        >
                            {[
                                'Help me prepare for a React developer interview',
                                'Give me a system design question',
                                "How do I answer 'Tell me about yourself'?",
                                'Practice a data structures question with me',
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(suggestion)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '20px',
                                        padding: '6px 14px',
                                        fontSize: '0.82rem',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(79,70,229,0.15)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </motion.div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid var(--glass-border)', padding: '4px 4px 4px 16px' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Type your answer..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                opacity: isLoading ? 0.7 : 1,
                                padding: '8px 0'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            className="btn-primary"
                            disabled={isLoading}
                            style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', borderRadius: '10px', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>



            {/* DELETE MODAL */}
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
