import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'default', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    const isDestructive = type === 'destructive';

    // Theme colors
    const colors = {
        default: {
            icon: 'var(--primary)',
            bg: 'var(--primary-light)',
            btn: 'btn-primary'
        },
        destructive: {
            icon: 'var(--error)',
            bg: 'rgba(239, 68, 68, 0.1)',
            btn: 'var(--error)'
        },
        success: {
            icon: 'var(--success)',
            bg: 'rgba(34, 197, 94, 0.1)',
            btn: 'var(--success)'
        }
    };

    const theme = colors[type] || colors.default;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    onClick={e => e.stopPropagation()}
                    className="glass-panel"
                    style={{
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '100%',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--glass-border)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '12px',
                            background: theme.bg,
                            color: theme.icon,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                padding: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                        {message}
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={onClose}
                            className="btn-ghost"
                            style={{ border: '1px solid var(--border-color)' }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={!isDestructive ? 'btn-primary' : ''}
                            style={isDestructive ? {
                                background: 'var(--error)',
                                color: 'white',
                                border: 'none',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                fontWeight: 500,
                                cursor: 'pointer'
                            } : {}}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
