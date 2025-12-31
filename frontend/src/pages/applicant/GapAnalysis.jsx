import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, User, CheckCircle, XCircle, ChevronLeft, AlertCircle, Award, Briefcase, Code, FileText, Lightbulb, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JobMatcher from '../../components/applicant/JobMatcher';
import ThreeDTiltCard from '../../components/ui/ThreeDTiltCard';

const GapAnalysis = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resumeId: stateResumeId, jobDescription, jobId } = location.state || {}; // Extract jobId

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

    if (!resumeId) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}><AlertCircle size={48} /></div>
                    <h2 className="title-md" style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>No Resume Selected</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Please upload a resume in the dashboard first to enable gap analysis.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/applicant/dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!location.state?.jobDescription) {
        return (
            <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}><AlertCircle size={48} /></div>
                    <h2 className="title-md" style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 600 }}>Invalid Access</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        Gap Analysis is only available for specific jobs. Please select a job from the list.
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/applicant/jobs')}>
                        Browse Jobs
                    </button>
                </div>
            </div>
        );
    }

    const { matchSummary, skillAnalysis, recommendations, fitScore } = analysisResult || {};

    const matchPercentage = matchSummary ? Math.round(matchSummary.matchPercentage) : 0;
    const isLowScore = matchPercentage < 40;

    const getFitColor = (score) => {
        if (isLowScore) return 'var(--error)';
        if (score === 'Excellent') return 'var(--success)';
        if (score === 'Good') return 'var(--primary)';
        return 'var(--warning)';
    };

    const currentFitColor = getFitColor(fitScore);
    const fitLabel = isLowScore ? 'Low Score' : `${fitScore} Fit`;

    const getRecommendationIcon = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('project')) return <Code size={20} />;
        if (lower.includes('certificat')) return <Award size={20} />;
        if (lower.includes('section') || lower.includes('structure')) return <FileText size={20} />;
        if (lower.includes('experience') || lower.includes('internship')) return <Briefcase size={20} />;
        if (lower.includes('skill') || lower.includes('learn')) return <BookOpen size={20} />;
        return <Lightbulb size={20} />;
    };

    return (
        <div className="container page-transition" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            <button
                onClick={() => navigate('/applicant/dashboard')}
                className="btn-ghost"
                style={{ marginBottom: '2rem', paddingLeft: 0 }}
            >
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="title-lg" style={{ marginBottom: '0.5rem' }}>Gap Analysis & Prediction</h1>
                <p className="text-subtle" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    AI-driven insights comparing your profile against the job description.
                </p>
            </div>

            {!analysisResult ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <JobMatcher
                        resumeId={resumeId}
                        initialJobDescription={jobDescription}
                        onMatchComplete={(data) => setAnalysisResult(data)}
                        onSessionExpired={() => {
                            localStorage.removeItem('resumeResult');
                            navigate('/applicant/dashboard', { state: { error: 'Session expired. Please re-upload resume.' } });
                        }}
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                        {/* Score Gauge Section */}
                        <ThreeDTiltCard>
                            <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexDirection: 'column', height: '100%' }}>
                                <div style={{ position: 'relative', width: '220px', height: '220px' }}>
                                    <svg width="220" height="220" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle cx="50" cy="50" r="45" stroke="var(--border-color)" strokeWidth="8" fill="none" opacity="0.3" />
                                        <motion.circle
                                            cx="50" cy="50" r="45"
                                            stroke={currentFitColor}
                                            strokeWidth="8"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray="283"
                                            initial={{ strokeDashoffset: 283 }}
                                            animate={{ strokeDashoffset: 283 - (283 * matchSummary.matchPercentage / 100) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                                            {matchPercentage}%
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500, marginTop: '4px' }}>Match Score</span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '0.5rem 1.5rem',
                                        borderRadius: '50px',
                                        background: `color-mix(in srgb, ${currentFitColor} 15%, transparent)`,
                                        color: currentFitColor,
                                        fontWeight: '700',
                                        fontSize: '1.2rem',
                                        border: `1px solid color-mix(in srgb, ${currentFitColor} 30%, transparent)`
                                    }}>
                                        {fitLabel}
                                    </div>
                                    <p className="text-subtle" style={{ marginTop: '1.5rem', fontSize: '0.95rem' }}>
                                        {isLowScore
                                            ? "Your profile has a low match score against the job requirements."
                                            : `Your profile strongly aligns with the ${matchSummary.total_matched_skills} matched skills found in this job description.`}
                                    </p>
                                </div>
                            </div>
                        </ThreeDTiltCard>

                        {/* Skill Analysis Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

                            {isLowScore ? (
                                <div className="glass-panel" style={{ padding: '3rem', borderTop: '4px solid var(--error)', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <XCircle size={40} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                                        Not Eligible for the Role
                                    </h3>
                                    <p className="text-subtle" style={{ maxWidth: '300px', lineHeight: '1.6' }}>
                                        Based on our analysis, your profile does not meet the minimum requirements for this position at this time.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Strengths */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--success)' }}>
                                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 600 }}>
                                            <div style={{ padding: '6px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', color: 'var(--success)' }}>
                                                <CheckCircle size={18} />
                                            </div>
                                            Matched Skills (Strengths)
                                        </h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {skillAnalysis.matchedSkills.length > 0 ? skillAnalysis.matchedSkills.map(skill => (
                                                <span key={skill} style={{
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    color: 'var(--success)',
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    border: '1px solid rgba(34, 197, 94, 0.2)'
                                                }}>
                                                    {skill}
                                                </span>
                                            )) : <span className="text-subtle" style={{ fontStyle: 'italic' }}>No direct matches found.</span>}
                                        </div>
                                        <p className="text-subtle" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                                            These skills match the job requirements perfectly.
                                        </p>
                                    </div>

                                    {/* Gaps */}
                                    <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid var(--error)' }}>
                                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 600 }}>
                                            <div style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', color: 'var(--error)' }}>
                                                <XCircle size={18} />
                                            </div>
                                            Missing Skills (Gaps)
                                        </h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {skillAnalysis.missingSkills.length > 0 ? skillAnalysis.missingSkills.map(skill => (
                                                <span key={skill} style={{
                                                    background: 'rgba(239, 68, 68, 0.08)',
                                                    color: 'var(--error)',
                                                    padding: '8px 16px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                                }}>
                                                    {skill}
                                                </span>
                                            )) : <span className="text-subtle">No gaps detected! Great job.</span>}
                                        </div>
                                        <p className="text-subtle" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                                            Consider adding projects with these technologies to improve your score.
                                        </p>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>

                    {/* Recommendations */}
                    <ThreeDTiltCard>
                        <div className="glass-panel" style={{ padding: '2.5rem' }}>
                            <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 600 }}>
                                <BookOpen size={24} color="var(--primary)" /> Smart Recommendations
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {recommendations.map((rec, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        gap: '1.25rem',
                                        padding: '1.25rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div style={{
                                            fontWeight: 'bold',
                                            color: 'var(--primary)',
                                            minWidth: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'var(--primary-light)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: '-2px'
                                        }}>
                                            {getRecommendationIcon(rec)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.6, fontSize: '1rem' }}>{rec}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ThreeDTiltCard>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <button
                            className="btn-ghost"
                            style={{ border: '1px solid var(--border-color)' }}
                            onClick={() => navigate('/applicant/jobs')}
                        >
                            Back to Jobs
                        </button>
                    </div>

                </motion.div>
            )}
        </div>
    );
};

export default GapAnalysis;
