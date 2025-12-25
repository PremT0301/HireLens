import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: -1,
            pointerEvents: 'none',
            background: 'var(--bg-primary)'
        }}>
            {/* Grid Overlay for Tech Feel */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(var(--border-color) 1px, transparent 1px), linear-gradient(90deg, var(--border-color) 1px, transparent 1px)',
                backgroundSize: '80px 80px',
                opacity: 0.03,
                zIndex: 0
            }} />

            {/* Floating Orbs */}

            {/* Orb 1: Primary Color - Top Left */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                    opacity: 0.1,
                    filter: 'blur(60px)',
                    zIndex: 0
                }}
            />

            {/* Orb 2: Secondary Color - Bottom Right */}
            <motion.div
                animate={{
                    x: [0, -150, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '700px',
                    height: '700px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
                    opacity: 0.1,
                    filter: 'blur(80px)',
                    zIndex: 0
                }}
            />

            {/* Orb 3: Success Color - Center/Random */}
            <motion.div
                animate={{
                    x: [0, 200, -200, 0],
                    y: [0, 150, -150, 0],
                    opacity: [0.05, 0.08, 0.05],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '30%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)',
                    opacity: 0.05,
                    filter: 'blur(50px)',
                    zIndex: 0
                }}
            />
        </div>
    );
};

export default AnimatedBackground;
