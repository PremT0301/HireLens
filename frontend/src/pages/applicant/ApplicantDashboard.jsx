import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';

import { TrendingUp, FileText, CheckCircle, UploadCloud, Loader2, User as UserIcon, MapPin, Briefcase, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { endpoints } from '../../api/config';
import ProfileService from '../../api/profileService';
import ResumeService from '../../api/resumeService';
import JobMatcher from '../../components/applicant/JobMatcher';
import NewsSection from '../../components/NewsSection';

const ApplicantDashboard = () => {
    const navigate = useNavigate();
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(() => {
        // Load from local storage on init
        const saved = localStorage.getItem('resumeResult');
        return saved ? JSON.parse(saved) : null;
    });

    const handleUploadSuccess = (data) => {
        setResult(data);
        localStorage.setItem('resumeResult', JSON.stringify(data));
    };

    const handleRemoveResume = () => {
        setResult(null);
        localStorage.removeItem('resumeResult');
    };

    const navigateToGapAnalysis = () => {
        // Navigate with state
        // assuming navigate is imported from somewhere, wait, need to add useNavigate
    };

    // ... inside useDropzone onDrop ...
    // replace setResult(data) with handleUploadSuccess(data)
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await ProfileService.getMyProfile();
                setProfile(data);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setAnalyzing(true);
        setResult(null);

        try {
            // Use real ResumeService
            const data = await ResumeService.uploadResume(file);
            // Save and Update State
            setResult(data);
            localStorage.setItem('resumeResult', JSON.stringify(data));

            console.log("Analysis Result:", data);
        } catch (error) {
            console.error("Analysis Failed:", error);
            // Optionally set error state to show in UI
        } finally {
            setAnalyzing(false);
        }
    }, []);



    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const stats = [
        { label: 'Profile Strength', value: '82%', icon: <TrendingUp size={24} />, color: 'var(--primary)' },
        { label: 'Jobs Applied', value: '14', icon: <FileText size={24} />, color: 'var(--success)' },
        { label: 'Interview Readiness', value: 'High', icon: <CheckCircle size={24} />, color: 'var(--warning)' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="title-lg" style={{ marginBottom: '0.5rem' }}>
                        {loading ? 'Welcome back' : `Welcome back, ${profile?.fullName || 'Candidate'}`}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Track your progress and optimize your profile</p>
                </div>
                {profile && (
                    <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={16} color="var(--primary)" />
                            <span style={{ fontSize: '0.9rem' }}>{profile.currentRole || 'Open to Work'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={16} color="var(--text-secondary)" />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{profile.location || 'Remote'}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel"
                        style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
                    >
                        <div style={{ padding: '15px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stat.value}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Upload Zone */}
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Resume Analysis</h3>
            <div
                {...getRootProps()}
                className="glass-panel"
                style={{
                    padding: '4rem',
                    textAlign: 'center',
                    border: `2px dashed ${isDragActive ? 'var(--primary)' : 'var(--glass-border)'}`,
                    background: isDragActive ? 'var(--primary-light)' : 'var(--glass-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <input {...getInputProps()} />
                <div style={{ color: isDragActive ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    {analyzing ? <Loader2 size={64} className="spin" /> : <UploadCloud size={64} />}
                </div>
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    {analyzing ? 'Analyzing Resume...' : (isDragActive ? 'Drop your resume here' : 'Upload your latest resume')}
                </h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                    {result ? `Analysis Complete: ${result.analysis.classification.predictedRole} (${(result.analysis.classification.confidence * 100).toFixed(1)}%)` : 'Drag & drop PDF or DOCX (Text only for now)'}
                </p>
            </div>

            {/* Analysis Results */}
            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel"
                    style={{ marginTop: '2rem', padding: '2rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--success)' }}>
                        <CheckCircle size={32} />
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Resume Analyzed & Saved</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>Your resume has been indexed for job matching.</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                        <div>
                            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Predicted Role</h4>
                            <div className="badge-primary" style={{ fontSize: '1.2rem', display: 'inline-block' }}>
                                {result.analysis.classification.predictedRole}
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                Confidence: {(result.analysis.classification.confidence * 100).toFixed(1)}%
                            </div>
                        </div>

                        <div>
                            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Top Skills Detected</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {result?.analysis?.nerResults?.skills && result.analysis.nerResults.skills.length > 0 ? (
                                    result.analysis.nerResults.skills.slice(0, 15).map((skill, i) => (
                                        <span key={i} style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem'
                                        }}>
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span style={{ color: 'var(--text-secondary)' }}>No specific skills detected</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            {result && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary"
                        onClick={() => navigate('/applicant/gap-analysis', { state: { resumeId: result.resumeId } })}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2rem', fontSize: '1.1rem' }}
                    >
                        <TrendingUp size={20} />
                        Go to Gap Analysis & Prediction
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRemoveResume}
                        className="btn-outline"
                        style={{
                            color: 'var(--error-color)',
                            borderColor: 'var(--error-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.8rem 1.5rem',
                            fontSize: '1rem'
                        }}
                    >
                        <Trash2 size={18} />
                        Remove Resume
                    </motion.button>
                </div>
            )}

            {/* Recently Applied Jobs Mock */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={24} /> Recently Applied
                </h3>
                <div className="glass-panel" style={{ padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem' }}>Job Title</th>
                                <th style={{ padding: '1rem' }}>Company</th>
                                <th style={{ padding: '1rem' }}>Date Applied</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { title: 'Senior React Developer', company: 'TechNova', date: '2025-12-20', status: 'Under Review' },
                                { title: 'Full Stack Engineer', company: 'InnovateX', date: '2025-12-18', status: 'Interview Scheduled' },
                                { title: 'Frontend Specialist', company: 'WebFlows', date: '2025-12-15', status: 'Applied' },
                            ].map((job, i) => (
                                <tr key={i} style={{ borderBottom: i < 2 ? '1px solid var(--glass-border)' : 'none' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{job.title}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{job.company}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{job.date}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            background: job.status === 'Interview Scheduled' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                            color: job.status === 'Interview Scheduled' ? 'var(--success)' : 'var(--primary)',
                                            border: `1px solid ${job.status === 'Interview Scheduled' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                                        }}>
                                            {job.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* News Feed */}
            <NewsSection query="technology career advice" title="Insights & Career News" />

            <div style={{ height: '2rem' }}></div>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .badge-primary {
                    background: var(--primary);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};

export default ApplicantDashboard;
