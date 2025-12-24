import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, User, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JobMatcher from '../../components/applicant/JobMatcher';

const GapAnalysis = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resumeId: stateResumeId } = location.state || {}; // Expect resumeId passed from Dashboard

    // Fallback to locally stored result if valid
    const resumeId = stateResumeId || (() => {
        try {
            const saved = localStorage.getItem('resumeResult');
            return saved ? JSON.parse(saved).resumeId : null;
        } catch (e) {
            return null;
        }
    })();

    const [analysisResult, setAnalysisResult] = useState(null);

    // If no resumeId, we should probably redirect back to Dashboard
    // But for better UX, let's show a button to go back.

    if (!resumeId) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%' }}>
                    <h2 className="title-md" style={{ marginBottom: '1rem' }}>No Resume Selected</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Please upload a resume in the dashboard first to enable gap analysis.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/applicant/dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const { matchSummary, skillAnalysis, recommendations, fitScore } = analysisResult || {};

    const getFitColor = (score) => {
        if (score === 'Excellent') return 'var(--success)';
        if (score === 'Good') return 'var(--primary)';
        return 'var(--warning)';
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <button
                onClick={() => navigate('/applicant/dashboard')}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}>
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="title-lg">Gap Analysis & Prediction</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    AI-driven insights to optimize your job application strategy.
                </p>
            </div>

            {!analysisResult ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <JobMatcher
                        resumeId={resumeId}
                        onMatchComplete={(data) => setAnalysisResult(data)}
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                        {/* Score Gauge Section */}
                        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexDirection: 'column' }}>
                            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                                <svg width="200" height="200" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="50" cy="50" r="45" stroke="var(--bg-secondary)" strokeWidth="8" fill="none" />
                                    <motion.circle
                                        cx="50" cy="50" r="45"
                                        stroke={getFitColor(fitScore)}
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray="283"
                                        initial={{ strokeDashoffset: 283 }}
                                        animate={{ strokeDashoffset: 283 - (283 * matchSummary.matchPercentage / 100) }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                        {Math.round(matchSummary.matchPercentage)}%
                                    </span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Match Score</span>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '50px',
                                    background: `${getFitColor(fitScore)}20`,
                                    color: getFitColor(fitScore),
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    border: `1px solid ${getFitColor(fitScore)}50`
                                }}>
                                    {fitScore} Fit
                                </div>
                                <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                    Based on your resume and the job description provided.
                                </p>
                            </div>
                        </div>

                        {/* Skill Analysis Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

                            {/* Strengths */}
                            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
                                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                                    <CheckCircle size={20} /> Your Strengths
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {skillAnalysis.matchedSkills.length > 0 ? skillAnalysis.matchedSkills.map(skill => (
                                        <span key={skill} style={{
                                            background: 'rgba(76, 175, 80, 0.15)',
                                            color: 'var(--success)',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            border: '1px solid isset(var(--success), 0.2)'
                                        }}>
                                            {skill}
                                        </span>
                                    )) : <span style={{ color: 'var(--text-secondary)' }}>No direct matches found.</span>}
                                </div>
                            </div>

                            {/* Gaps */}
                            <div className="glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--error-color)' }}>
                                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--error-color)' }}>
                                    <XCircle size={20} /> Missing Skills (Gaps)
                                </h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {skillAnalysis.missingSkills.length > 0 ? skillAnalysis.missingSkills.map(skill => (
                                        <span key={skill} style={{
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            color: '#f87171',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            fontSize: '0.9rem',
                                            border: '1px solid rgba(239, 68, 68, 0.3)'
                                        }}>
                                            {skill}
                                        </span>
                                    )) : <span style={{ color: 'var(--text-secondary)' }}>No gaps detected!</span>}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BookOpen size={20} color="var(--primary)" /> Smart Recommendations
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recommendations.map((rec, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '8px',
                                    borderLeft: '2px solid var(--primary)'
                                }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: 'var(--primary)',
                                        minWidth: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem'
                                    }}>{i + 1}</span>
                                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <button
                            className="btn-outline"
                            onClick={() => setAnalysisResult(null)}
                        >
                            Analyze Another Job
                        </button>
                    </div>

                </motion.div>
            )}
        </div>
    );
};

export default GapAnalysis;
