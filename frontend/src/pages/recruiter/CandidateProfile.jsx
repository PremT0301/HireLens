import { API_BASE_URL } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail, Phone, Briefcase, Calendar, MapPin, Building,
    ArrowLeft, Download, FileText, CheckCircle, Clock, XCircle
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

    const derivedSkills = React.useMemo(() => {
        let skills = [];
        if (candidate?.skills && candidate.skills.length > 0) {
            skills = candidate.skills;
        } else if (gapAnalysis?.skillAnalysis) {
            skills = [
                ...(gapAnalysis.skillAnalysis.matchedSkills || []),
                ...(gapAnalysis.skillAnalysis.additionalSkills || [])
            ];
        }
        return [...new Set(skills)];
    }, [candidate, gapAnalysis]);

    if (loading) return <HireLensLoader text="Loading Profile..." />;
    if (!candidate) return null;

    return (
        <div style={{ paddingBottom: '4rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header / Back Button */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-ghost"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0, color: 'var(--text-secondary)' }}
                >
                    <ArrowLeft size={20} /> Back to Talent Pool
                </button>
            </div>

            {/* Main Profile Header Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>

                    {/* Profile Identity */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3rem', color: 'white', fontWeight: 'bold',
                            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                            border: '4px solid var(--bg-primary)',
                            overflow: 'hidden'
                        }}>
                            {candidate.profileImage ? (
                                <img
                                    src={candidate.profileImage.startsWith('http') ? candidate.profileImage : `${API_BASE_URL.replace('/api', '')}${candidate.profileImage}`}
                                    alt={candidate.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerText = candidate.name.charAt(0); }}
                                />
                            ) : (
                                candidate.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', lineHeight: 1 }}>{candidate.name}</h1>
                                <span style={{
                                    padding: '6px 16px',
                                    borderRadius: '50px',
                                    background: 'var(--primary-light)',
                                    color: 'var(--primary)',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    border: '1px solid var(--primary)'
                                }}>
                                    {candidate.status}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '1rem' }}>{candidate.role}</p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                    <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '50%' }}><Mail size={16} /></div>
                                    <span style={{ fontWeight: 500 }}>{candidate.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                    <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '50%' }}><Phone size={16} /></div>
                                    <span style={{ fontWeight: 500 }}>{candidate.phone || 'No Phone provided'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                    <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '50%' }}><MapPin size={16} /></div>
                                    <span style={{ fontWeight: 500 }}>{candidate.location || 'Location not specified'}</span>
                                </div>
                                {candidate.linkedInUrl && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        <div style={{ background: 'var(--bg-secondary)', padding: '8px', borderRadius: '50%' }}><Briefcase size={16} /></div>
                                        <a href={candidate.linkedInUrl.startsWith('http') ? candidate.linkedInUrl : `https://${candidate.linkedInUrl}`} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500, color: 'var(--primary)', textDecoration: 'none' }}>LinkedIn Profile</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <button
                            className="btn-ghost"
                            style={{ border: '1px solid var(--border-color)', height: '48px', padding: '0 20px' }}
                            onClick={() => setModalView('message')}
                        >
                            <Mail size={18} style={{ marginRight: '8px' }} /> Message
                        </button>
                        <button
                            className="btn-primary"
                            style={{ height: '48px', padding: '0 24px', fontSize: '1rem' }}
                            onClick={() => setModalView('schedule')}
                        >
                            <Calendar size={18} style={{ marginRight: '8px' }} /> Schedule Interview
                        </button>
                        {candidate.status === 'Interview Accepted' && (
                            <button
                                className="btn-primary"
                                style={{ background: 'var(--success)', borderColor: 'var(--success)', height: '48px', padding: '0 24px' }}
                                onClick={handleHire}
                            >
                                <CheckCircle size={18} style={{ marginRight: '8px' }} /> Hire Candidate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Layout Grid - Removed fixed height */}
            <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: '1.5rem', alignItems: 'start', minHeight: '600px' }}>

                {/* Left Column: PDF Viewer */}
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', height: '800px', position: 'sticky', top: '100px' }}>
                    {candidate.resumeId ? (
                        <iframe
                            src={`${API_BASE_URL}/resumes/download/${candidate.resumeId}?inline=true`}
                            title="Candidate Resume"
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                        />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            No Resume PDF Available
                        </div>
                    )}
                </div>

                {/* Right Column: AI Insights & Details - Removed overflow/height to allow scroll */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.5rem' }}>

                    {/* Match Score Card */}
                    <div className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                            <svg width="100" height="100" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--bg-secondary)" strokeWidth="12" />
                                <circle
                                    cx="80" cy="80" r="70"
                                    fill="none"
                                    stroke={Math.round(gapAnalysis?.matchSummary?.matchPercentage ?? candidate.score) >= 70 ? 'var(--success)' : Math.round(gapAnalysis?.matchSummary?.matchPercentage ?? candidate.score) >= 40 ? 'var(--primary)' : 'var(--error)'}
                                    strokeWidth="12"
                                    strokeDasharray={`${(Math.round(gapAnalysis?.matchSummary?.matchPercentage ?? candidate.score) / 100) * 439.8} 439.8`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 80 80)"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                    {Math.round(gapAnalysis?.matchSummary?.matchPercentage ?? candidate.score)}%
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 className="title-sm" style={{ marginBottom: '0.25rem' }}>AI Match Score</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                Based on skill overlap, experience, and job requirements.
                            </p>
                        </div>
                    </div>

                    {/* Education Summary */}
                    <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
                        <h3 className="title-sm" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Briefcase size={20} className="text-primary" /> Professional Summary
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Experience</span>
                                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{candidate.experience} Years</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Highest Education</span>
                                <span style={{ fontWeight: '600' }}>{candidate.education && candidate.education.length > 0 ? candidate.education[0].collegeName : (candidate.college || 'Not specified')}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Applied On</span>
                                <span style={{ fontWeight: '600' }}>{new Date(candidate.appliedAt).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Preferred Role</span>
                                <span style={{ fontWeight: '600', color: candidate.preferredRole === candidate.role ? 'var(--success)' : 'var(--text-primary)' }}>
                                    {candidate.preferredRole || 'Not specified'}
                                </span>
                            </div>
                            {/* Detailed Education List if available */}
                            {candidate.education && candidate.education.length > 0 && (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Education History</span>
                                    {candidate.education.map((edu, idx) => (
                                        <div key={idx} style={{ marginBottom: '8px' }}>
                                            <div style={{ fontWeight: '600' }}>{edu.degree} {edu.specialization ? `- ${edu.specialization}` : ''}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{edu.collegeName}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {edu.completionYear} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Work Experience List if available */}
                            {candidate.workExperience && candidate.workExperience.length > 0 && (
                                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                    <span style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Work History</span>
                                    {candidate.workExperience.map((work, idx) => (
                                        <div key={idx} style={{ marginBottom: '12px' }}>
                                            <div style={{ fontWeight: '600' }}>{work.role}</div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>{work.companyName}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {work.duration}
                                            </div>
                                            {work.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{work.description}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {candidate.resumeId && (
                                <div style={{ display: 'flex', alignItems: 'end', marginTop: '1rem' }}>
                                    <a
                                        href={`${API_BASE_URL}/resumes/download/${candidate.resumeId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}
                                    >
                                        <Download size={16} /> Download PDF
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills & Analysis */}
                    <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
                        <h2 className="title-md" style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Skills & Analysis</h2>

                        <div style={{ height: '220px', width: '100%', minWidth: '0', marginBottom: '1.5rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getChartData(derivedSkills)}>
                                    <PolarGrid stroke="var(--glass-border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Skills"
                                        dataKey="A"
                                        stroke="var(--primary)"
                                        strokeWidth={2}
                                        fill="var(--primary)"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                Detected Skills
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {derivedSkills.length > 0 ? derivedSkills.map((skill, index) => (
                                    <span key={index} style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem',
                                        border: '1px solid var(--border-color)',
                                        fontWeight: '500'
                                    }}>
                                        {skill}
                                    </span>
                                )) : <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No skills detected</span>}
                            </div>
                        </div>

                        {gapAnalysis && gapAnalysis.skillAnalysis?.missingSkills?.length > 0 && (
                            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--error)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <XCircle size={14} /> Missing Critical Skills
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                    {gapAnalysis.skillAnalysis.missingSkills.map((skill, index) => (
                                        <span key={index} style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontWeight: '600' }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
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

