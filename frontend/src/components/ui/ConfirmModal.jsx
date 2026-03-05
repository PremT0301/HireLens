import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    loading = false
}) => {

    // Accessibility: ESC key to close
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Focus Trap & Screen Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertCircle size={24} />;
            case 'success': return <CheckCircle size={24} />;
            case 'info':
            default: return <Info size={24} />;
        }
    };

    const getIconClass = () => {
        switch (type) {
            case 'danger': return 'modal-icon-danger';
            case 'success': return 'modal-icon-success';
            case 'info':
            default: return 'modal-icon-info';
        }
    };

    const getBtnClass = () => {
        switch (type) {
            case 'danger': return 'btn-danger';
            case 'success': return 'btn-success';
            case 'info':
            default: return 'btn-primary-modal';
        }
    };

    return createPortal(
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="modal-card"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={`modal-icon-container ${getIconClass()}`}>
                        {getIcon()}
                    </div>

                    <h2 className="modal-title">{title}</h2>
                    <p className="modal-message">{message}</p>

                    <div className="modal-actions">
                        <button
                            className={`btn-modal-confirm ${getBtnClass()}`}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : confirmText}
                        </button>
                        <button
                            className="btn-modal-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmModal;
