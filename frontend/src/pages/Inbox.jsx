import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Send, MoreVertical, Briefcase, User, Phone } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';
import { useToast } from '../context/ToastContext';
import HireLensLoader from '../components/ui/HireLensLoader';
import './Inbox.css';

const Inbox = () => {
    const token = sessionStorage.getItem('token');
    const { addToast } = useToast();

    // State
    const [threads, setThreads] = useState([]);
    const [filteredThreads, setFilteredThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Loading States
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Message Input
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                await fetchThreads();
            } catch (error) {
                console.error("Error loading inbox:", error);
                addToast("Failed to load inbox", "error");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchInitialData();
    }, [token, addToast]);

    // Polling
    useEffect(() => {
        const interval = setInterval(() => {
            fetchThreads();
            if (selectedThread) {
                fetchMessages(selectedThread.threadId, false);
            }
        }, 30000); // 30s poll
        return () => clearInterval(interval);
    }, [selectedThread, token]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Search Filtering
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredThreads(threads);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = threads.filter(thread =>
                thread.subject?.toLowerCase().includes(lowerTerm) ||
                thread.otherPartyName?.toLowerCase().includes(lowerTerm)
            );
            setFilteredThreads(filtered);
        }
    }, [searchTerm, threads]);

    // API Actions
    const fetchThreads = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/inbox/threads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThreads(response.data);
            if (!searchTerm) setFilteredThreads(response.data);
        } catch (error) {
            console.error("Error fetching threads:", error);
        }
    };

    const fetchMessages = async (threadId, showLoader = true) => {
        if (showLoader) setLoadingMessages(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/inbox/threads/${threadId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);

            // Optimistic Local Mark as Read
            setThreads(prev => prev.map(t =>
                t.threadId === threadId ? { ...t, hasUnread: false } : t
            ));
        } catch (error) {
            console.error("Error fetching messages:", error);
            addToast("Failed to load conversation", "error");
        } finally {
            if (showLoader) setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedThread) return;

        try {
            await axios.post(`${API_BASE_URL}/inbox/threads/${selectedThread.threadId}/message`,
                { content: newMessage },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewMessage('');
            fetchMessages(selectedThread.threadId, false);
            fetchThreads(); // Refresh list to show latest snippet
        } catch (error) {
            console.error("Error sending message:", error);
            addToast("Failed to send message", "error");
        }
    };

    const handleSelectThread = (thread) => {
        setSelectedThread(thread);
        // keep search term
        fetchMessages(thread.threadId);
    };

    if (loading) return <HireLensLoader />;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inbox-container page-transition"
        >
            <div className="inbox-wrapper glass-panel">

                {/* LEFT PANEL: CONVERSATION LIST */}
                <div className="inbox-sidebar">
                    <div className="sidebar-header">
                        <div className="search-container">
                            <Search size={18} className="text-subtle" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search candidates or jobs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="thread-list">
                        {filteredThreads.length === 0 ? (
                            <div className="empty-state">
                                <p className="text-subtle">No conversations found.</p>
                            </div>
                        ) : (
                            filteredThreads.map(thread => (
                                <motion.div
                                    key={thread.threadId}
                                    layoutId={thread.threadId}
                                    onClick={() => handleSelectThread(thread)}
                                    className={`thread-item ${selectedThread?.threadId === thread.threadId ? 'active' : ''} ${thread.hasUnread ? 'unread' : ''}`}
                                >
                                    {/* Avatar */}
                                    {thread.otherPartyImage ? (
                                        <img
                                            src={thread.otherPartyImage.startsWith('http') ? thread.otherPartyImage : `${API_BASE_URL.replace('/api', '')}${thread.otherPartyImage}`}
                                            alt={thread.otherPartyName}
                                            className="thread-avatar"
                                        />
                                    ) : (
                                        <div className="thread-avatar-placeholder">
                                            {thread.otherPartyName?.charAt(0) || 'U'}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="thread-content">
                                        <div className="thread-header">
                                            <span className="thread-name">{thread.subject}</span>
                                            <span className="thread-time">
                                                {new Date(thread.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="thread-company">
                                            {thread.otherPartyName}
                                        </div>
                                        {thread.lastMessagePreview && (
                                            <div className="thread-preview">
                                                {thread.lastMessagePreview}
                                            </div>
                                        )}
                                        {thread.hasUnread && <div className="unread-dot" />}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: MESSAGE VIEW */}
                <div className="inbox-main">
                    {selectedThread ? (
                        <>
                            {/* Header */}
                            <div className="chat-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                                        {selectedThread.subject}
                                    </h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        with {selectedThread.otherPartyName}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-ghost" title="Call Candidate">
                                        <Phone size={18} />
                                    </button>
                                    <button className="btn-ghost" title="View Profile">
                                        <User size={18} />
                                    </button>
                                    <button className="btn-ghost" title="Action">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="chat-messages-area">
                                {loadingMessages ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', margin: 'auto' }}>
                                        <div className="loading-spinner" />
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <motion.div
                                            key={msg.messageId || index}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className={msg.senderRole === "System" ? "system-message" : `message-group ${msg.isMine ? 'mine' : 'theirs'}`}
                                        >
                                            {msg.senderRole === "System" ? (
                                                <span>{msg.content}</span>
                                            ) : (
                                                <>
                                                    <div className={`message-bubble ${msg.isMine ? 'mine' : 'theirs'}`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="message-time">
                                                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="chat-input-area">
                                <button className="btn-ghost" style={{ padding: '8px' }}>
                                    <Briefcase size={20} />
                                </button>
                                <form onSubmit={handleSendMessage} className="chat-input-wrapper">
                                    <input
                                        type="text"
                                        className="chat-input"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="send-btn"
                                        disabled={!newMessage.trim()}
                                        style={{ position: 'absolute', right: '6px' }}
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="empty-state-icon"
                            >
                                <MessageSquare size={40} />
                            </motion.div>
                            <h2 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Welcome to your Inbox</h2>
                            <p>Select a conversation from the left to view details and respond to candidates.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Inbox;
