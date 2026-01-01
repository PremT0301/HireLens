import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';
import { useToast } from '../context/ToastContext';
import { MessageSquare, Bell, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';
import HireLensLoader from '../components/ui/HireLensLoader';

const Notifications = () => {
    const token = sessionStorage.getItem('token');
    const { addToast } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [token]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/inbox/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            addToast("Failed to load notifications", "error");
        } finally {
            setLoading(false);
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

    return (
        <div className="container page-transition" style={{ paddingTop: '2rem', paddingBottom: '2rem', minHeight: 'calc(100vh - 80px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title-lg">Notifications</h1>
                {notifications.some(n => !n.isRead) && (
                    <button onClick={handleMarkAllRead} className="btn-ghost" style={{ fontSize: '0.9rem' }}>
                        <CheckCircle size={16} /> Mark all as read
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
                {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        <Bell size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.notificationId}
                            onClick={() => !notif.isRead && handleMarkNotificationRead(notif.notificationId)}
                            className="glass-card"
                            style={{
                                display: 'flex',
                                gap: '1.5rem',
                                padding: '1.5rem',
                                borderLeft: notif.isRead ? '1px solid var(--glass-border)' : '4px solid var(--primary)',
                                background: notif.isRead ? 'rgba(255,255,255,0.01)' : 'rgba(var(--primary-rgb), 0.05)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                if (!notif.isRead) e.currentTarget.style.transform = 'translateY(-2px)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                            }}
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                {notif.type === 'InterviewScheduled' ? <Calendar size={24} /> :
                                    notif.type === 'MessageReceived' ? <MessageSquare size={24} /> :
                                        <Bell size={24} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <h4 style={{ fontWeight: !notif.isRead ? 700 : 500, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{notif.title}</h4>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>{notif.message}</p>
                            </div>
                            {!notif.isRead && (
                                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
