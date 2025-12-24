import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ id, message, type = 'info', onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} className="text-emerald-400" />,
        error: <XCircle size={20} className="text-rose-400" />,
        info: <Info size={20} className="text-blue-400" />
    };

    const colors = {
        success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
        error: 'border-rose-500/20 bg-rose-500/10 text-rose-200',
        info: 'border-blue-500/20 bg-blue-500/10 text-blue-200'
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`glass-panel`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                backdropFilter: 'blur(12px)',
                minWidth: '300px',
                pointerEvents: 'auto'
            }}
        >
            <div style={{ color: type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--error)' : 'var(--primary)' }}>
                {type === 'success' && <CheckCircle size={20} />}
                {type === 'error' && <XCircle size={20} />}
                {type === 'info' && <Info size={20} />}
            </div>

            <p style={{ flex: 1, fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>{message}</p>

            <button
                onClick={() => onClose(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

export default Toast;
