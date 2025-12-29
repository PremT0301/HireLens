import { API_BASE_URL } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail, Phone, Briefcase, Calendar, MapPin, Building,
    ArrowLeft, Download, FileText, CheckCircle, Clock
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import HireLensLoader from '../../components/ui/HireLensLoader';
import ApplicationService from '../../api/applicationService';
import { useToast } from '../../context/ToastContext';
import ScheduleForm from '../../components/forms/ScheduleForm';
import MessageForm from '../../components/forms/MessageForm';
import Modal from '../../components/ui/Modal';
import api from '../../api/axios';

const CandidateProfile = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [candidate, setCandidate] = useState(null);
    const [gapAnalysis, setGapAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalView, setModalView] = useState(null); // 'schedule', 'message'

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const data = await ApplicationService.getApplicationDetails(applicationId);
                setCandidate(data);
            } catch (error) {
                console.error("Failed to load candidate details", error);
                addToast("Failed to load candidate details", "error");
                navigate('/recruiter/talent-pool');
            } finally {
                setLoading(false);
            }
        };

        if (applicationId) {
            fetchCandidate();
        }
    }, [applicationId, navigate, addToast]);

    useEffect(() => {
        if (candidate?.resumeId && candidate?.jobDescriptionText) {
            const fetchGap = async () => {
                try {
                    const res = await api.post('/resumes/match', {
                        resumeId: candidate.resumeId,
                        jobDescription: candidate.jobDescriptionText
                    });
                    setGapAnalysis(res.data);
                } catch (e) {
                    console.error("Gap analysis failed", e);
                }
            };
            fetchGap();
        }
    }, [candidate]);

    const handleScheduleSubmit = async (formData) => {
        try {
            await ApplicationService.scheduleInterview(candidate.applicationId, formData);
            addToast('Interview scheduled successfully', 'success');
            setCandidate(prev => ({ ...prev, status: 'Interview Scheduled' }));
            setModalView(null);
        } catch (error) {
            console.error("Failed to schedule", error);
            addToast('Failed to schedule interview', 'error');
        }
    };

    const handleMessageSubmit = async (formData) => {
        try {
            await ApplicationService.sendMessage(candidate.applicationId, formData);
            addToast('Message sent successfully', 'success');
            setModalView(null);
        } catch (error) {
            console.error("Failed to send message", error);
            addToast('Failed to send message', 'error');
        }
    };


    const handleHire = async () => {
        if (!window.confirm(`Are you sure you want to HIRE ${candidate.name}?`)) return;
        try {
            await ApplicationService.hireCandidate(candidate.applicationId);
            addToast(`Successfully hired ${candidate.name}!`, 'success');
            setCandidate(prev => ({ ...prev, status: 'Hired' }));
        } catch (error) {
            console.error("Failed to hire", error);
            addToast('Failed to hire candidate.', 'error');
        }
    };

    const getChartData = (skills) => {
        if (!skills || !Array.isArray(skills)) return [];
        // Take top 6 skills for the chart to avoid overcrowding
        return skills.slice(0, 6).map(skill => ({
            subject: skill,
            A: 90, // Default high score for present skills
            fullMark: 100
        }));
    };

    if (loading) return <HireLensLoader text="Loading Profile..." />;
    if (!candidate) return null;

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* Header / Back Button */}
            <div style={{ marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0, color: 'var(--text-secondary)' }}
                >
                    <ArrowLeft size={20} /> Back to Talent Pool
                </button>
            </div>

            {/* Main Profile Header */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', color: 'white', fontWeight: 'bold',
                        overflow: 'hidden'
                    }}>
                        {candidate.profileImage ? (
                            <img src={candidate.profileImage} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            candidate.name.charAt(0)
                        )}
                    </div>
                    <div>
                        <h1 className="title-md" style={{ marginBottom: '0.5rem' }}>{candidate.name}</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{candidate.role}</p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <Mail size={16} /> {candidate.email}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <Phone size={16} /> {candidate.phone || 'N/A'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <MapPin size={16} /> {candidate.location || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                    <div style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        {candidate.status}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-ghost" onClick={() => setModalView('message')}>Message</button>
                        {candidate.status === 'Interview Accepted' && (
                            <button
                                className="btn-primary"
                                style={{ background: 'var(--success)', borderColor: 'var(--success)' }}
                                onClick={handleHire}
                            >
                                Hire Candidate
                            </button>
                        )}
                        <button className="btn-primary" onClick={() => setModalView('schedule')}>Schedule Interview</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                    {/* Left Column: Details & Resume */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Resume Section */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 className="title-sm" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileText size={24} className="text-primary" /> Resume
                                </h2>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {candidate.resumeId && (
                                        <a
                                            href={`${API_BASE_URL}/resumes/download/${candidate.resumeId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}
                                        >
                                            <Download size={18} /> Download Original
                                        </a>
                                    )}
                                    <button className="btn-ghost" title="Download Text" onClick={() => {
                                        const blob = new Blob([candidate.resumeText], { type: 'text/plain' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${candidate.name.replace(/\s+/g, '_')}_Resume.txt`;
                                        a.click();
                                    }}>
                                        <FileText size={18} /> Download Text
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: '2rem',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                lineHeight: '1.6',
                                maxHeight: '600px',
                                overflowY: 'auto',
                                color: 'var(--text-primary)'
                            }}>
                                {candidate.resumeText}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Stats & Meta */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Match Score */}
                        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1rem' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-color)" strokeWidth="10" />
                                    <circle
                                        cx="60" cy="60" r="54"
                                        fill="none"
                                        stroke={Math.round(gapAnalysis?.matchSummary?.matchPercentage ?? candidate.score) > 90 ? 'var(--success)' : 'var(--primary)'}
                                        strokeWidth="10"
                                        strokeDasharray={`${(Math.round(gapAnalysis?.matchSummary?.matchPercentage ?? candidate.score) / 100) * 339.292} 339.292`}
                                        strokeDashoffset="0"
                                        transform="rotate(-90 60 60)"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Math.round(gapAnalysis?.matchSummary?.matchPercentage ?? candidate.score)}%</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Match</span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>AI Matching Score</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Based on skills and experience relevance.</p>
                        </div>

                        {/* Skills Chart */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <h3 className="title-sm" style={{ marginBottom: '1.5rem' }}>Skill Analysis</h3>
                            {candidate.skills && candidate.skills.length > 0 && (
                                <>
                                    <div style={{ height: '250px', width: '100%' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getChartData(candidate.skills)}>
                                                <PolarGrid stroke="var(--glass-border)" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                <Radar
                                                    name="Skills"
                                                    dataKey="A"
                                                    stroke="var(--primary)"
                                                    strokeWidth={3}
                                                    fill="var(--primary)"
                                                    fillOpacity={0.3}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', justifyContent: 'center' }}>
                                        {candidate.skills.map((skill, index) => (
                                            <span key={index} style={{
                                                fontSize: '0.8rem',
                                                padding: '4px 10px',
                                                background: 'var(--bg-secondary)',
                                                borderRadius: '12px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}

                            {gapAnalysis && gapAnalysis.skillAnalysis && (
                                <>
                                    {gapAnalysis.skillAnalysis.matchedSkills && gapAnalysis.skillAnalysis.matchedSkills.length > 0 && (
                                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)' }}>✓</span>
                                                Matched Skills (Gap Analysis)
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {gapAnalysis.skillAnalysis.matchedSkills.map((skill, index) => (
                                                    <span key={index} className="badge badge-success">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {gapAnalysis.skillAnalysis.missingSkills && gapAnalysis.skillAnalysis.missingSkills.length > 0 && (
                                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--error)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)' }}>!</span>
                                                Missing Skills (Gap Analysis)
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {gapAnalysis.skillAnalysis.missingSkills.map((skill, index) => (
                                                    <span key={index} className="badge badge-error">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.8rem', fontStyle: 'italic' }}>
                                                These skills are required for the role but were not detected in the resume.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Additional Info */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 className="title-sm" style={{ marginBottom: '1rem' }}>Application Info</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Calendar size={18} className="text-gray-400" />
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Applied On</div>
                                        <div style={{ fontWeight: '500' }}>{new Date(candidate.appliedAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <MapPin size={18} className="text-gray-400" />
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Location</div>
                                        <div style={{ fontWeight: '500' }}>{candidate.location || 'Unknown'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* End of Header/Glass Panel */}

            {/* Modals */}
            <Modal
                isOpen={!!modalView}
                onClose={() => setModalView(null)}
                title={modalView === 'schedule' ? "Schedule Interview" : "Send Message"}
            >
                {modalView === 'schedule' && (
                    <ScheduleForm
                        onSubmit={handleScheduleSubmit}
                        onCancel={() => setModalView(null)}
                    />
                )}

                {modalView === 'message' && (
                    <MessageForm
                        candidateName={candidate.name}
                        onSubmit={handleMessageSubmit}
                        onCancel={() => setModalView(null)}
                    />
                )}
            </Modal>
        </div>
    );
};

export default CandidateProfile;

