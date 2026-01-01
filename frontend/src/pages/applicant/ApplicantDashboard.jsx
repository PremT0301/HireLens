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
import ThreeDTiltCard from '../../components/ui/ThreeDTiltCard';
import ATSScoreDisplay from '../../components/applicant/ATSScoreDisplay';
import HireLensLoader from '../../components/ui/HireLensLoader';
import ApplicationService from '../../api/applicationService';

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
    const [applications, setApplications] = useState([]);
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

        const loadApplications = async () => {
            try {
                const data = await ApplicationService.getMyApplications();
                setApplications(data);
            } catch (error) {
                console.error("Failed to load applications", error);
            }
        };

        loadProfile();
        loadApplications();
    }, []);

    const handleAcceptInterview = async (applicationId) => {
        try {
            await ApplicationService.acceptInterview(applicationId);
            // Update local state
            setApplications(prev => prev.map(app =>
                app.applicationId === applicationId
                    ? { ...app, status: 'Interview Accepted' }
                    : app
            ));
            // alert("Interview Accepted!"); // Ideally use a Toast here if available
        } catch (error) {
            console.error("Failed to accept interview", error);
            alert("Failed to accept interview. Please try again.");
        }
    };

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

    // Derive stats from analysis result
    const profileStrength = result ? result.analysis.ats_score : 0;
    const interviewReadiness = result ? (result.analysis.classification.confidence * 100).toFixed(0) : 0;
    const readinessLabel = interviewReadiness >= 80 ? 'High' : interviewReadiness >= 50 ? 'Medium' : 'Low';

    const stats = [
        {
            label: 'Profile Strength (ATS)',
            value: result ? `${profileStrength}%` : '-',
            icon: <TrendingUp size={24} />,
            color: profileStrength >= 70 ? 'var(--success)' : 'var(--primary)'
        },
        {
            label: 'Role Fit Confidence',
            value: result ? `${interviewReadiness}%` : '-',
            icon: <CheckCircle size={24} />,
            color: interviewReadiness >= 80 ? 'var(--success)' : 'var(--warning)'
        },
        {
            label: 'Jobs Applied',
            value: applications.length || 0,
            icon: <FileText size={24} />,
            color: 'var(--text-secondary)'
        },
    ];

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
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
                    <ThreeDTiltCard key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel"
                            style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%' }}
                        >
                            <div style={{ padding: '15px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stat.value}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</div>
                            </div>
                        </motion.div>
                    </ThreeDTiltCard>
                ))}
            </div>



            {/* Upload Zone */}
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Resume Analysis</h3>
            <ThreeDTiltCard>
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
                        <UploadCloud size={64} />
                    </div>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {isDragActive ? 'Drop your resume here' : 'Upload your latest resume'}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {result ? `Analysis Complete: ${result.analysis.classification.predictedRole} (${(result.analysis.classification.confidence * 100).toFixed(1)}%)` : 'Drag & drop PDF or DOCX (Text only for now)'}
                    </p>
                </div>
            </ThreeDTiltCard>

            {/* Full Screen Loader */}
            {analyzing && (
                <HireLensLoader
                    text="Analyzing Resume..."
                    subtext="Extracting skills, experience, and calculating fit score."
                />
            )}

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

                    <ATSScoreDisplay
                        score={result.analysis.ats_score || 0}
                        level={result.analysis.ats_level || 'Low'}
                        feedback={result.analysis.feedback || []}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
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
                                {result?.analysis?.ner_results?.skills && result.analysis.ner_results.skills.length > 0 ? (
                                    result.analysis.ner_results.skills.slice(0, 15).map((skill, i) => (
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
            )
            }

            {/* Action Buttons */}
            {
                result && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRemoveResume}
                            className="btn-ghost"
                            style={{
                                color: 'var(--error)',
                                border: '1px solid var(--error)',
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
                )
            }

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
                            {applications.length > 0 ? (
                                applications.slice(0, 5).map((app, i) => (
                                    <tr key={i} style={{ borderBottom: i < applications.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{app.jobTitle}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{app.companyName}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{app.appliedDate}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                background: ['Interview Scheduled', 'Interview Accepted', 'Hired', 'Reapplied'].includes(app.status) ? 'rgba(76, 175, 80, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                color: ['Interview Scheduled', 'Interview Accepted', 'Hired', 'Reapplied'].includes(app.status) ? 'var(--success)' : 'var(--primary)',
                                                border: `1px solid ${['Interview Scheduled', 'Interview Accepted', 'Hired', 'Reapplied'].includes(app.status) ? 'rgba(76, 175, 80, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                                            }}>
                                                {app.status}
                                            </span>

                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No applications found. Upload your resume and start applying!
                                    </td>
                                </tr>
                            )}
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
        </div >
    );
};

export default ApplicantDashboard;
