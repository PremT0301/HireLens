import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Cpu, Scan, Sparkles } from 'lucide-react';

const HireLensLoader = ({ text = "Analyzing Profile...", subtext = "HireLens AI is processing your data" }) => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(10, 10, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 9999,
        }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                {/* 1. Outer Rotating Rings (Neural Network) */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px dashed rgba(79, 70, 229, 0.3)',
                    }}
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        width: '85%',
                        height: '85%',
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderTop: '2px solid var(--primary)',
                        borderBottom: '2px solid var(--secondary)',
                    }}
                />

                {/* 2. The Lens (Glass Core) */}
                <div style={{
                    position: 'absolute',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <FileText size={32} color="rgba(255,255,255,0.8)" />

                    {/* 3. Scanning Beam */}
                    <motion.div
                        animate={{ top: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: '50%',
                            background: 'linear-gradient(to bottom, transparent, var(--primary), transparent)',
                            opacity: 0.5,
                            top: '-100%'
                        }}
                    />
                </div>

                {/* 4. Orbiting Particles (Skills) */}
                <OrbitingDot delay={0} radius={70} color="var(--success)" />
                <OrbitingDot delay={1} radius={70} color="var(--primary)" />
                <OrbitingDot delay={2} radius={70} color="var(--secondary)" />
            </div>

            {/* 5. Text Content */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginTop: '2.5rem', textAlign: 'center' }}
            >
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(to right, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'center'
                }}>
                    <Scan size={20} color="var(--primary)" /> {text}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    {subtext}
                </p>
            </motion.div>
        </div>
    );
};

const OrbitingDot = ({ delay, radius, color }) => (
    <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: delay }}
        style={{
            position: 'absolute',
            width: radius * 2,
            height: radius * 2,
            borderRadius: '50%',
            pointerEvents: 'none'
        }}
    >
        <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: color,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px ${color}`
        }} />
    </motion.div>
);

export default HireLensLoader;
