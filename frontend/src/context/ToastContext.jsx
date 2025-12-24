import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Toast from '../components/ui/Toast';
import { AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const success = (msg) => addToast(msg, 'success');
    const error = (msg) => addToast(msg, 'error');
    const info = (msg) => addToast(msg, 'info');

    return (
        <ToastContext.Provider value={{ addToast, success, error, info, removeToast }}>
            {children}
            {createPortal(
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                }}>
                    <AnimatePresence mode='popLayout'>
                        {toasts.map((toast) => (
                            <Toast key={toast.id} {...toast} onClose={removeToast} />
                        ))}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};
