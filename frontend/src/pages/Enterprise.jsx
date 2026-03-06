import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Server, BarChart3, Lock, Users, ArrowRight, Zap, Database, Globe, Cpu } from 'lucide-react';
import { ScheduleDemoModal, ContactSalesModal } from '../components/enterprise/EnterpriseModals';

const Enterprise = () => {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);

    return (
        <div className="page-transition aurora-bg" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
            <div className="container">
                {/* Hero Section */}
                <section style={{ textAlign: 'center', marginBottom: '8rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="badge badge-success" style={{ marginBottom: '1.5rem', padding: '6px 16px' }}>Enterprise Grade</span>
                        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.1, letterSpacing: '-0.04em' }}>
                            AI Recruitment <span className="gradient-text">Infrastructure</span>
                        </h1>
                        <p className="text-subtle" style={{ fontSize: '1.4rem', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                            Scalable, secure, and compliant AI intelligence for the world's most demanding hiring environments.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                            <button
                                className="btn-primary"
                                style={{ padding: '16px 40px', fontSize: '1.1rem' }}
                                onClick={() => setIsDemoModalOpen(true)}
                            >
                                Schedule a Demo <ArrowRight size={22} />
                            </button>
                            <button
                                className="btn-nav-outline"
                                style={{ padding: '16px 40px', fontSize: '1.1rem' }}
                                onClick={() => setIsSalesModalOpen(true)}
                            >
                                Contact Sales
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Problem Section */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center', marginBottom: '10rem' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem', lineHeight: 1.2 }}>
                            Eliminate Hiring <br />
                            <span style={{ color: 'var(--primary)' }}>Inefficiencies at Scale</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <p className="text-subtle" style={{ fontSize: '1.15rem', lineHeight: 1.8 }}>
                                Large enterprises face unique challenges in recruitment: high applicant volumes, fragmentation across teams, and the critical need for compliance.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {[
                                    'Reduce time-to-hire by up to 70% with AI filtering',
                                    'Standardize skill assessment across global teams',
                                    'Ensure 100% compliance with data privacy regulations',
                                    'Integrated analytics for total pipeline visibility'
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Zap size={20} color="var(--primary)" />
                                        <span style={{ fontWeight: 600 }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-panel"
                        style={{ height: '450px', background: 'linear-gradient(135deg, var(--bg-secondary), var(--primary-light))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>
                            <Server size={80} style={{ marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 700 }}>Interactive Dashboard Mockup</p>
                        </div>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section style={{ marginBottom: '10rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Built for <span className="gradient-text">Complexity</span></h2>
                        <p className="text-subtle">Advanced capabilities tailored for high-growth enterprises.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                        {[
                            { icon: <Cpu />, title: 'Dedicated AI Models', desc: 'Custom trained models specifically for your industry and company language.' },
                            { icon: <Lock />, title: 'Private Deployment', desc: 'On-premise or private cloud deployment options for maximum data sovereignty.' },
                            { icon: <BarChart3 />, title: 'Advanced Analytics', desc: 'Deep insights into hiring patterns, source quality, and team performance.' },
                            { icon: <Shield />, title: 'SLA & Security', desc: 'Enterprise-grade SLA, SOC2 compliance, and 24/7 dedicated support.' }
                        ].map((feat, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="glass-panel"
                                style={{ padding: '3rem 2rem' }}
                            >
                                <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>{feat.icon}</div>
                                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>{feat.title}</h4>
                                <p className="text-subtle" style={{ lineHeight: 1.6 }}>{feat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Architecture Section */}
                <section style={{ marginBottom: '10rem' }}>
                    <div className="glass-panel" style={{ padding: '5rem 3rem', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '4rem' }}>Technical <span className="gradient-text">Architecture</span></h2>

                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            maxWidth: '900px', margin: '0 auto', gap: '20px', flexWrap: 'wrap'
                        }}>
                            <ArchBox icon={<Globe />} label="Frontend" />
                            <div style={{ height: '2px', width: '50px', background: 'var(--border-color)', flex: 1, minWidth: '20px' }}></div>
                            <ArchBox icon={<Server />} label="Backend API" />
                            <div style={{ height: '2px', width: '50px', background: 'var(--border-color)', flex: 1, minWidth: '20px' }}></div>
                            <ArchBox icon={<Cpu />} label="AI Service" highlight />
                            <div style={{ height: '2px', width: '50px', background: 'var(--border-color)', flex: 1, minWidth: '20px' }}></div>
                            <ArchBox icon={<Database />} label="Database" />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    style={{ position: 'relative' }}
                >
                    <div className="glass-panel" style={{
                        padding: '6rem 4rem', textAlign: 'center', background: 'var(--primary)',
                        color: 'white', overflow: 'hidden', position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'white', opacity: 0.1, borderRadius: '50%', filter: 'blur(60px)' }}></div>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Ready to Transform Enterprise Hiring?</h2>
                            <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem' }}>
                                Join leading global companies that have revolutionized their recruitment infrastructure with HireLens AI.
                            </p>
                            <button
                                className="btn-primary"
                                style={{ background: 'white', color: 'var(--primary)', padding: '18px 48px', fontSize: '1.2rem', fontWeight: 800 }}
                                onClick={() => setIsDemoModalOpen(true)}
                            >
                                Schedule Strategy Call
                            </button>
                        </div>
                    </div>
                </motion.section>

                {/* Modals */}
                <ScheduleDemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
                <ContactSalesModal isOpen={isSalesModalOpen} onClose={() => setIsSalesModalOpen(false)} />
            </div>
        </div>
    );
};

const ArchBox = ({ icon, label, highlight }) => (
    <div style={{
        padding: '2rem', borderRadius: '24px', background: highlight ? 'var(--primary-light)' : 'var(--bg-primary)',
        border: highlight ? '2px solid var(--primary)' : '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', minWidth: '160px', flex: 1
    }}>
        <div style={{ color: highlight ? 'var(--primary)' : 'var(--text-secondary)' }}>
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: highlight ? 'var(--primary)' : 'var(--text-primary)' }}>{label}</span>
    </div>
);

export default Enterprise;
