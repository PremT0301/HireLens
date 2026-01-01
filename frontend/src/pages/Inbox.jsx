import React, { useState, useEffect, useRef } from 'react';

import { API_BASE_URL } from '../api/config';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Bell, Search, Send, FileText, Calendar, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import HireLensLoader from '../components/ui/HireLensLoader';

const Inbox = () => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('messages'); // messages, notifications
    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([fetchThreads(), fetchNotifications()]);
            } catch (error) {
                console.error("Error fetching inbox data:", error);
                addToast("Failed to load inbox", "error");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token, addToast]);

    // Poll for new messages/notifications every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            if (activeTab === 'messages') fetchThreads();
            if (activeTab === 'notifications') fetchNotifications();
            if (selectedThread) fetchMessages(selectedThread.threadId, false);
        }, 30000);
        return () => clearInterval(interval);
    }, [activeTab, selectedThread, token]);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchThreads = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/inbox/threads`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThreads(response.data);
        } catch (error) {
            console.error("Error fetching threads:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/inbox/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const fetchMessages = async (threadId, showLoader = true) => {
        if (showLoader) setLoadingMessages(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/inbox/threads/${threadId}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data);

            // Update thread read status locally
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
            fetchThreads(); // Update last message time/snippet
        } catch (error) {
            console.error("Error sending message:", error);
            addToast("Failed to send message", "error");
        }
    };

    const handleMarkNotificationRead = async (id) => {
        try {
            await axios.patch(`${API_BASE_URL}/inbox/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n =>
                n.notificationId === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error("Error updating notification:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.patch(`${API_BASE_URL}/inbox/notifications/read-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            addToast("All notifications marked as read", "success");
        } catch (error) {
            console.error("Error updating notifications:", error);
        }
    };

    if (loading) return <HireLensLoader />;

    // Pure Message Selection
    const handleSelectThread = (thread) => {
        setSelectedThread(thread);
        fetchMessages(thread.threadId);
    };

    if (loading) return <HireLensLoader />;

    return (
        <div className="container page-transition" style={{ paddingTop: '2rem', paddingBottom: '2rem', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="title-lg">Inbox</h1>
            </div>

            {/* Content Area */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>

                {/* Sidebar List - Threads Only */}
                <div style={{ width: '350px', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                        <div className="input-group" style={{ padding: '8px 12px' }}>
                            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
                            <input type="text" placeholder="Search conversations..." style={{ border: 'none', background: 'transparent', outline: 'none', marginLeft: '8px', width: '100%', color: 'var(--text-primary)' }} />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {threads.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <MessageSquare size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>No conversations yet.</p>
                            </div>
                        ) : (
                            threads.map(thread => (
                                <div
                                    key={thread.threadId}
                                    onClick={() => handleSelectThread(thread)}
                                    style={{
                                        padding: '1rem',
                                        cursor: 'pointer',
                                        background: selectedThread?.threadId === thread.threadId ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                        borderLeft: selectedThread?.threadId === thread.threadId ? '3px solid var(--primary)' : '3px solid transparent',
                                        transition: 'all 0.2s ease',
                                        borderBottom: '1px solid var(--glass-border)'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = selectedThread?.threadId === thread.threadId ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.03)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedThread?.threadId === thread.threadId ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h4 style={{ fontWeight: thread.hasUnread ? 700 : 500, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{thread.subject}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(thread.lastMessageAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {thread.otherPartyImage ? (
                                            <img src={thread.otherPartyImage.startsWith('http') ? thread.otherPartyImage : `${API_BASE_URL.replace('/api', '')}${thread.otherPartyImage}`} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                {thread.otherPartyName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            With: {thread.otherPartyName}
                                        </p>
                                    </div>
                                    {thread.hasUnread && (
                                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                                            <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>New</span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main View Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
                    {selectedThread ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedThread.subject}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>With {selectedThread.otherPartyName}</p>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {loadingMessages ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                        <div className="loading-spinner"></div>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg.messageId}
                                            style={{
                                                alignSelf: msg.senderRole === "System" ? 'center' : (msg.isMine ? 'flex-end' : 'flex-start'),
                                                maxWidth: msg.senderRole === "System" ? '90%' : '70%',
                                                textAlign: msg.senderRole === "System" ? 'center' : 'left'
                                            }}
                                        >
                                            {msg.senderRole === "System" ? (
                                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', border: '1px dashed var(--glass-border)' }}>
                                                    {msg.content}
                                                </div>
                                            ) : (
                                                <div style={{
                                                    background: msg.isMine ? 'var(--primary)' : 'var(--bg-secondary)',
                                                    color: msg.isMine ? 'white' : 'var(--text-primary)',
                                                    padding: '12px 16px',
                                                    borderRadius: msg.isMine ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                                }}>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>{msg.content}</p>
                                                    <div style={{ textAlign: 'right', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                                            {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--glass-border)' }}>
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        style={{ flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--glass-border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <MessageSquare size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Select a conversation</h3>
                            <p>Choose a thread from the left to start messaging.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inbox;
