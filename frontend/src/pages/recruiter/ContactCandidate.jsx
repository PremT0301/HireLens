import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, AlignLeft, User, Briefcase, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ApplicationService from '../../api/applicationService';
import HireLensLoader from '../../components/ui/HireLensLoader';
import { API_BASE_URL } from '../../api/config';

const ContactCandidate = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        subject: '',
        message: ''
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await ApplicationService.getApplicationDetails(applicationId);
                setApplication(data);
                // Pre-fill subject if needed
                setFormData(prev => ({ ...prev, subject: `Regarding your application for ${data.role}` }));
            } catch (error) {
                console.error("Failed to load application details", error);
                addToast("Failed to load candidate details", "error");
                navigate('/recruiter/talent-pool');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [applicationId, addToast, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.message.trim()) {
            addToast("Please provide both subject and message", "error");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                subject: formData.subject,
                message: formData.message
            };

            await ApplicationService.sendMessage(applicationId, payload);
            addToast('Message sent successfully!', 'success');

            // Navigate back after a short delay
            setTimeout(() => {
                navigate('/recruiter/talent-pool');
            }, 1000);

        } catch (error) {
            console.error("Sending message failed", error);
            addToast(error.response?.data?.message || 'Failed to send message', 'error');
            setSubmitting(false);
        }
    };

    if (loading) return <HireLensLoader text="Loading Candidate Details..." />;

    if (!application) return null;

    return (
        <div className="container page-transition" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '800px' }}>
            <button
                onClick={() => navigate(-1)}
                className="btn-ghost"
                style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}
            >
                <ArrowLeft size={18} /> Back to Talent Pool
            </button>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem' }}>
                    <h1 className="title-lg" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Contact Candidate</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Send a direct message to the candidate.</p>
                </div>

                {/* Candidate Summary */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    background: 'var(--bg-secondary)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        overflow: 'hidden'
                    }}>
                        {application.profileImage ? (
                            <img
                                src={application.profileImage.startsWith('http') ? application.profileImage : `${API_BASE_URL.replace('/api', '')}${application.profileImage}`}
                                alt={application.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = application.name?.charAt(0) || 'C'; }}
                            />
                        ) : (
                            application.name?.charAt(0) || 'C'
                        )}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>{application.name}</h3>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Briefcase size={14} /> {application.role}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={14} className={application.score >= 70 ? "text-success" : "text-warning"} />
                                {application.score}% Match
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={14} /> {application.email}
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Subject Row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Subject <span style={{ color: 'var(--error)' }}>*</span></label>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                            <Mail size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px' }} />
                            <input
                                type="text"
                                required
                                placeholder="Subject of your message"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem' }}
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Message Body */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Message <span style={{ color: 'var(--error)' }}>*</span></label>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'flex-start', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                            <AlignLeft size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px', marginTop: '4px' }} />
                            <textarea
                                rows="8"
                                required
                                placeholder="Type your message here..."
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem', resize: 'vertical' }}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                        <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => navigate('/recruiter/talent-pool')}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                            style={{ minWidth: '150px' }}
                        >
                            {submitting ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    Sending...
                                </span>
                            ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                    <Send size={18} /> Send Message
                                </span>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ContactCandidate;
