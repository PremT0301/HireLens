import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, size = 'md', hideHeader = false }) => {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const maxWidth = size === 'sm' ? '400px' : size === 'lg' ? '800px' : '600px';

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="glass-panel"
                style={{
                    width: '90%',
                    maxWidth: maxWidth,
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '0',
                    position: 'relative',
                    // background removed to use CSS class
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Header */}
                {!hideHeader && (
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'sticky',
                        top: 0,
                        background: 'inherit',
                        backdropFilter: 'inherit',
                        zIndex: 10,
                        borderRadius: '16px 16px 0 0'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{title}</h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                padding: '4px',
                                borderRadius: '4px'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>
                )}

                {/* Close button for headless mode */}
                {hideHeader && (
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            zIndex: 20
                        }}
                    >
                        <X size={20} />
                    </button>
                )}

                {/* Content */}
                <div style={{ padding: '1.5rem' }}>
                    {children}
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default Modal;
