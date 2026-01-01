import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Video, Phone, AlignLeft, User, Briefcase, ArrowLeft, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ApplicationService from '../../api/applicationService';
import JobService from '../../api/jobService';
import HireLensLoader from '../../components/ui/HireLensLoader';
import { API_BASE_URL } from '../../api/config';

const ScheduleMeeting = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        mode: 'Video', // Video, Phone, In-person
        meetingLink: '',
        duration: '30',
        notes: '',
        roundId: ''
    });

    const [interviewRounds, setInterviewRounds] = useState([]);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await ApplicationService.getApplicationDetails(applicationId);
                setApplication(data);

                // Fetch Interview Rounds if jobId is available
                if (data.jobId) {
                    const rounds = await JobService.getInterviewRounds(data.jobId);
                    setInterviewRounds(rounds || []);
                }

                // Pre-fill some data if available or set defaults
                if (data.meetingLink) {
                    setFormData(prev => ({ ...prev, meetingLink: data.meetingLink }));
                }
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

    const handleRoundChange = (e) => {
        const roundName = e.target.value;
        // Since rounds are just strings, we use the name as the ID
        setFormData(prev => ({
            ...prev,
            roundId: roundName
            // Note: Cannot auto-fill mode/duration if rounds are just strings without metadata
            // Could potentially use job global defaults if we had them here
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.date || !formData.time) {
            addToast("Please select a date and time", "error");
            return;
        }

        if (formData.mode === 'Video' && !formData.meetingLink) {
            addToast("Please provide a meeting link for video calls", "warning");
            return;
        }

        setSubmitting(true);
        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);

            const payload = {
                date: dateTime.toISOString(),
                mode: formData.mode,
                link: formData.meetingLink,
                duration: parseInt(formData.duration, 10),
                notes: formData.notes,
                roundId: formData.roundId
            };

            await ApplicationService.scheduleInterview(applicationId, payload);
            addToast('Interview scheduled successfully!', 'success');

            // Navigate back after a short delay or immediately
            setTimeout(() => {
                navigate('/recruiter/talent-pool');
            }, 1000);

        } catch (error) {
            console.error("Scheduling failed", error);
            addToast(error.response?.data?.message || 'Failed to schedule interview', 'error');
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
                    <h1 className="title-lg" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Schedule Interview</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Set up a meeting with the candidate.</p>
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

                    {/* Interview Round */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Interview Round <span style={{ color: 'var(--error)' }}>*</span></label>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                            <Briefcase size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px' }} />
                            <select
                                required
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem', cursor: 'pointer' }}
                                value={formData.roundId}
                                onChange={handleRoundChange}
                                disabled={interviewRounds.length === 0}
                            >
                                <option value="" disabled>Select Interview Round</option>
                                {interviewRounds.length > 0 ? (
                                    interviewRounds.map((roundName, index) => (
                                        <option key={index} value={roundName} style={{ color: 'black' }}>
                                            {typeof roundName === 'string' ? roundName : roundName.name}
                                        </option>
                                    ))
                                ) : (
                                    <option value="" disabled>No interview rounds configured for this job</option>
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Date and Time Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Date <span style={{ color: 'var(--error)' }}>*</span></label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                                <Calendar size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px' }} />
                                <input
                                    type="date"
                                    required
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem' }}
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Time <span style={{ color: 'var(--error)' }}>*</span></label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                                <Clock size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px' }} />
                                <input
                                    type="time"
                                    required
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem' }}
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mode and Duration Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Interview Mode</label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                                {formData.mode === 'Video' ? <Video size={18} style={{ color: 'var(--text-secondary)' }} /> :
                                    formData.mode === 'Phone' ? <Phone size={18} style={{ color: 'var(--text-secondary)' }} /> :
                                        <User size={18} style={{ color: 'var(--text-secondary)' }} />}

                                <select
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', marginLeft: '10px', fontSize: '1rem', cursor: 'pointer' }}
                                    value={formData.mode}
                                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                >
                                    <option value="Video" style={{ color: 'black' }}>Video Call (Google Meet/Zoom)</option>
                                    <option value="Phone" style={{ color: 'black' }}>Phone Screening</option>
                                    <option value="In-person" style={{ color: 'black' }}>In-person Interview</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Duration</label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                                <Clock size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px' }} />
                                <select
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem', cursor: 'pointer' }}
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                >
                                    <option value="15" style={{ color: 'black' }}>15 Minutes</option>
                                    <option value="30" style={{ color: 'black' }}>30 Minutes</option>
                                    <option value="45" style={{ color: 'black' }}>45 Minutes</option>
                                    <option value="60" style={{ color: 'black' }}>1 Hour</option>
                                    <option value="90" style={{ color: 'black' }}>1.5 Hours</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Link (Conditional) */}
                    {formData.mode === 'Video' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Meeting Link <span style={{ color: 'var(--error)' }}>*</span></label>
                            <div className="input-group" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                                <LinkIcon size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px' }} />
                                <input
                                    type="url"
                                    placeholder="https://meet.google.com/..."
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem' }}
                                    value={formData.meetingLink}
                                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Notes/Agenda */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)' }}>Notes / Agenda (Optional)</label>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'flex-start', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                            <AlignLeft size={18} style={{ color: 'var(--text-secondary)', marginRight: '10px', marginTop: '4px' }} />
                            <textarea
                                rows="4"
                                placeholder="Topics to cover, instructions for candidate, etc."
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem', resize: 'vertical' }}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                                "Schedule Interview"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ScheduleMeeting;
