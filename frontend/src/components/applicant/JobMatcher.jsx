import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios'; // Or use a dedicated jobService if preferred

const JobMatcher = ({ resumeId, initialJobDescription = '' }) => {
    const [jobDescription, setJobDescription] = useState(initialJobDescription);
    const [matchResult, setMatchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleMatch = async () => {
        if (!jobDescription.trim()) return;
        if (!resumeId) {
            setError("Please upload a resume first.");
            return;
        }

        setLoading(true);
        setError(null);
        setMatchResult(null);

        try {
            const response = await api.post('/resumes/match', {
                resumeId: resumeId,
                jobDescription: jobDescription
            });
            setMatchResult(response.data);
        } catch (err) {
            console.error("Match failed", err);
            setError("Failed to analyze match. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (initialJobDescription && initialJobDescription.trim()) {
            handleMatch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getFitColor = (score) => {
        if (score === 'Excellent') return 'var(--success-color)';
        if (score === 'Good') return 'var(--primary-color)';
        return 'var(--warning-color)';
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Job Match Analysis</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Paste a job description below to see how well your resume matches.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
                <textarea
                    readOnly
                    value={jobDescription}
                    placeholder="Job description will appear here..."
                    style={{
                        width: '100%',
                        height: '150px',
                        padding: '1rem',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(0, 0, 0, 0.2)', // Darker background to indicate read-only
                        color: 'var(--text-secondary)',
                        fontSize: '0.95rem',
                        marginBottom: '1rem',
                        resize: 'none',
                        cursor: 'not-allowed'
                    }}
                />
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMatch}
                    disabled={loading || !jobDescription.trim()}
                    className="btn-primary"
                    style={{ width: '100%' }}
                >
                    {loading ? 'Analyzing...' : 'Analyze Match'}
                </motion.button>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="error-message"
                        style={{ color: 'var(--error-color)', marginBottom: '1rem' }}
                    >
                        {error}
                    </motion.div>
                )}

                {matchResult && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="match-results"
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 'var(--border-radius)'
                        }}>
                            <div>
                                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall Fit</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getFitColor(matchResult.fitScore) }}>
                                    {matchResult.fitScore}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Match Score</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    {matchResult.matchSummary.matchPercentage}%
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '0.5rem', color: 'var(--success-color)' }}>Matched Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {matchResult.skillAnalysis.matchedSkills.length > 0 ? (
                                        matchResult.skillAnalysis.matchedSkills.map(skill => (
                                            <span key={skill} className="skill-tag" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#81c784' }}>
                                                ✓ {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No exact skill matches found</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '0.5rem', color: 'var(--error-color)' }}>Missing Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {matchResult.skillAnalysis.missingSkills.length > 0 ? (
                                        matchResult.skillAnalysis.missingSkills.map(skill => (
                                            <span key={skill} className="skill-tag" style={{ background: 'rgba(244, 67, 54, 0.2)', color: '#e57373' }}>
                                                ✗ {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No missing skills detected!</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {matchResult.recommendations && matchResult.recommendations.length > 0 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>Recommendations</h4>
                                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                                    {matchResult.recommendations.map((rec, index) => (
                                        <li key={index} style={{ marginBottom: '0.3rem' }}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default JobMatcher;
