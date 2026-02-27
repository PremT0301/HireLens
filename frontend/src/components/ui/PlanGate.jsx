import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../api/authService';

const PlanGate = ({ children, requiredPlan, featureName = "This feature" }) => {
    const user = AuthService.getCurrentUser();
    const currentPlan = user?.plan || 'FREE';
    const navigate = useNavigate();

    const planWeights = {
        'FREE': 1,
        'PRO': 2,
        'ELITE_PLUS': 3
    };

    const hasAccess = planWeights[currentPlan] >= planWeights[requiredPlan];

    if (hasAccess) {
        return <>{children}</>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="plan-gate-locked"
            style={{
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                borderRadius: 'var(--border-radius)',
                padding: '2.5rem',
                border: '1px solid var(--glass-border)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                pointerEvents: 'none',
                background: 'radial-gradient(circle at center, var(--primary-color) 0%, transparent 70%)'
            }} />

            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{featureName} Locked</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '300px' }}>
                Upgrade to <strong>{requiredPlan.replace('_', '+')}</strong> to unlock this premium AI feature.
            </p>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/pricing')}
                className="btn-primary"
                style={{
                    padding: '0.8rem 2rem',
                    background: 'linear-gradient(45deg, var(--primary-color), #8b5cf6)',
                    border: 'none',
                    borderRadius: '50px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
                }}
            >
                Upgrade Now
            </motion.button>
        </motion.div>
    );
};

export default PlanGate;
