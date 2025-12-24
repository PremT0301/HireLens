import React, { useState } from 'react';
import { Send, Tag } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const MessageForm = ({ onSubmit, onCancel, candidateName }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    const templates = [
        { label: 'Interview Request', subject: 'Interview Availability - SmartHireAI', body: `Hi ${candidateName},\n\nWe've reviewed your application and would like to schedule an interview to discuss your experience properly.\n\nPlease let us know your availability for next week.\n\nBest regards,\nThe Hiring Team` },
        { label: 'Follow Up', subject: 'Application Status Update', body: `Hi ${candidateName},\n\nJust wanted to keep you in the loop regarding your application status.\n\nWe are currently finalizing our reviews and will get back to you shortly.\n\nBest,\nRecruiting Team` },
        { label: 'Rejection', subject: 'Update on your application', body: `Dear ${candidateName},\n\nThank you for your interest. Unfortunately, we have decided to proceed with other candidates at this time.\n\nWe sort of wish you the best in your search.\n\nRegards,\nHR` }
    ];

    const loadTemplate = (template) => {
        setFormData({
            subject: template.subject,
            message: template.body
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTimeout(() => {
            addToast('Message sent successfully', 'success');
            onSubmit(formData);
        }, 800);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Quick Templates */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                {templates.map((t, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => loadTemplate(t)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <Tag size={14} /> {t.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Subject</label>
                <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
                    <input
                        type="text"
                        required
                        placeholder="Enter subject..."
                        style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Message</label>
                <div className="glass-panel" style={{ padding: '1rem' }}>
                    <textarea
                        required
                        rows="8"
                        placeholder="Type your message here..."
                        style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none', resize: 'none' }}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={16} /> Send Message
                </button>
            </div>
        </form>
    );
};

export default MessageForm;
