import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Brain, Shield, Zap, CheckCircle2 } from 'lucide-react';

const ReleaseNotes = () => {
    const releases = [
        {
            version: 'v2.0.0',
            title: 'Admin Suite Release',
            date: 'February 2026',
            badge: 'Latest',
            description: 'Major infrastructure update focused on enterprise management and deep analytics.',
            updates: [
                'Full-featured Analytics Dashboard for recruiters',
                'System Logs for auditing and transparency',
                'Role-Based Access Control (RBAC) enhancements',
                'Bulk applicant processing optimizations',
                'Advanced SignalR real-time notification engine'
            ],
            icon: <Shield size={24} color="var(--primary)" />
        },
        {
            version: 'v1.5.0',
            title: 'Intelligence Upgrade',
            date: 'November 2025',
            badge: 'Stable',
            description: 'Core AI engine improvements for better matching accuracy and interviewee support.',
            updates: [
                'BERT-based resume classification engine',
                'Real-time Skill Gap Analysis visualization',
                'Interview Copilot beta launch',
                'NLP optimizations for multi-format parsing',
                'Mobile-responsive dashboard redesign'
            ],
            icon: <Brain size={24} color="var(--secondary)" />
        },
        {
            version: 'v1.0.0',
            title: 'Initial Launch',
            date: 'August 2025',
            badge: 'Legacy',
            description: 'The foundation of HireLens AI—bringing automated parsing to the masses.',
            updates: [
                'Foundational Auth & Verification system',
                'Basic PDF/DOCX Resume Parsing',
                'Job Posting & Application workflow',
                'Applicant matching algorithm v1',
                'Basic Email notification system'
            ],
            icon: <Rocket size={24} color="var(--success)" />
        }
    ];

    return (
        <div className="page-transition aurora-bg" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
            <div className="container" style={{ maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Product <span className="gradient-text">Updates</span>
                        </h1>
                        <p className="text-subtle" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                            Tracking our journey to build the world's most intelligent hiring platform.
                        </p>
                    </motion.div>
                </div>

                {/* Timeline */}
                <div style={{ position: 'relative' }}>
                    {/* Vertical Line */}
                    <div style={{
                        position: 'absolute', left: '40px', top: '0', bottom: '0', width: '2px',
                        background: 'linear-gradient(to bottom, var(--primary), var(--border-color))',
                        opacity: 0.3
                    }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {releases.map((release, idx) => (
                            <motion.div
                                key={release.version}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                style={{ display: 'flex', gap: '2rem' }}
                            >
                                {/* Marker */}
                                <div style={{
                                    width: '82px', height: '82px', flexShrink: 0, borderRadius: '24px',
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: 'var(--shadow-sm)', position: 'relative', zIndex: 1
                                }}>
                                    {release.icon}
                                </div>

                                <div className="glass-panel" style={{ flex: 1, padding: '2.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{release.title}</h3>
                                                <span className={`badge ${release.badge === 'Latest' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '2px 12px' }}>
                                                    {release.version}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{release.date}</div>
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                                        {release.description}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                        {release.updates.map((update, uIdx) => (
                                            <div key={uIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                <CheckCircle2 size={18} color="var(--success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', opacity: 0.9 }}>{update}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* RoadMap Preview */}
                <div className="glass-panel" style={{ marginTop: '6rem', padding: '3rem', borderStyle: 'dashed', borderColor: 'var(--primary)', textAlign: 'center' }}>
                    <Zap size={32} color="var(--warning)" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Coming Next: v2.5.0</h3>
                    <p className="text-subtle" style={{ fontSize: '1.1rem' }}>Voice-enabled copilot, Multi-lingual support, and AI Video Analysis integration.</p>
                </div>
            </div>
        </div>
    );
};

export default ReleaseNotes;
