import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const ATSScoreDisplay = ({ score, level, feedback }) => {
    // Determine color based on score
    const getColor = (s) => {
        if (s >= 80) return 'var(--success)'; // Green
        if (s >= 51) return 'var(--warning)'; // Yellow
        return 'var(--error)'; // Red
    };

    const color = getColor(score);
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="glass-panel" style={{ marginTop: '2rem', padding: '2rem' }}>
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>

                {/* Gauge Section */}
                <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                        <circle
                            cx="75"
                            cy="75"
                            r={radius}
                            stroke="var(--glass-border)"
                            strokeWidth="12"
                            fill="transparent"
                        />
                        <motion.circle
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            cx="75"
                            cy="75"
                            r={radius}
                            stroke={color}
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: color }}>
                            {score}
                        </div>

                    </div>
                </div>

                {/* Info Section */}
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>ATS Level:</span> <span style={{ color: color }}>{level}</span>
                    </h3>

                    <div style={{ marginTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>Analysis Feedback:</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.8rem' }}>
                            {feedback && feedback.map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'start',
                                        gap: '0.8rem',
                                        fontSize: '0.95rem',
                                        color: 'var(--text-secondary)',
                                        background: 'var(--glass-bg)',
                                        border: '1px solid var(--glass-border)',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        borderLeft: `3px solid ${item.includes("Missing") || item.includes("Low") || item.includes("short") ? 'var(--error)' : 'var(--success)'}`
                                    }}
                                >
                                    {item.includes("Missing") || item.includes("Low") || item.includes("short") ?
                                        <AlertCircle size={18} color="var(--error)" style={{ marginTop: '2px' }} /> :
                                        <CheckCircle size={18} color="var(--success)" style={{ marginTop: '2px' }} />
                                    }
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ATSScoreDisplay;
