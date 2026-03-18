import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, KeyRound, Lock, Eye, EyeOff,
    CheckCircle2, ShieldCheck, ArrowLeft, Loader,
    AlertCircle, RefreshCw
} from 'lucide-react';
import AuthService from '../api/authService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' };
    if (score === 2) return { label: 'Fair', color: '#f59e0b', width: '50%' };
    if (score === 3) return { label: 'Strong', color: '#22c55e', width: '75%' };
    return { label: 'Very Strong', color: '#3b82f6', width: '100%' };
};

// ─── Animation variants ──────────────────────────────────────────────────────
const cardVariants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.25 } })
};

const shakeVariants = {
    shake: {
        x: [0, -10, 10, -10, 10, -6, 6, 0],
        transition: { duration: 0.5 }
    }
};

// ─── Step Indicator ─────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', justifyContent: 'center' }}>
        {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
                <div style={{
                    width: step === current ? '32px' : '28px',
                    height: step === current ? '32px' : '28px',
                    borderRadius: '50%',
                    background: step < current ? 'var(--success)' :
                                step === current ? 'var(--primary)' :
                                'var(--border-color)',
                    color: step <= current ? 'white' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700,
                    transition: 'all 0.3s ease',
                    border: step === current ? '2px solid var(--primary)' : '2px solid transparent',
                    boxShadow: step === current ? '0 0 0 3px var(--primary-light)' : 'none'
                }}>
                    {step < current ? <CheckCircle2 size={14} /> : step}
                </div>
                {step < 3 && (
                    <div style={{
                        width: '40px', height: '2px',
                        background: step < current ? 'var(--success)' : 'var(--border-color)',
                        transition: 'background 0.4s ease'
                    }} />
                )}
            </React.Fragment>
        ))}
    </div>
);

// ─── Step 1: Email ──────────────────────────────────────────────────────────
const StepEmail = ({ onNext }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await AuthService.forgotPassword(email);
            onNext({ email });
        } catch (err) {
            // Still advance — server always returns 200
            onNext({ email });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '18px',
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                }}>
                    <ShieldCheck size={28} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Account Recovery
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Enter your email to receive a 6-digit reset code
                </p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', padding: '10px 14px', borderRadius: '10px',
                        marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem'
                    }}>
                    <AlertCircle size={16} />{error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                        Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-label="Email Address"
                            required
                            style={{
                                width: '100%', padding: '13px 14px 13px 42px',
                                borderRadius: '12px', border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                outline: 'none', fontSize: '0.95rem'
                            }}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary" disabled={loading}
                    style={{ padding: '13px', width: '100%', borderRadius: '12px', fontSize: '1rem', marginTop: '0.25rem' }}>
                    {loading ? <><Loader className="spin" size={18} /> Sending Code...</> : <>Send Reset Code</>}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    Sign In
                </Link>
            </p>
        </div>
    );
};

// ─── Step 2: OTP ─────────────────────────────────────────────────────────────
const StepOtp = ({ email, onNext, onBack }) => {
    const [digits, setDigits] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [locked, setLocked] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 min
    const [resendEnabled, setResendEnabled] = useState(false);
    const [shake, setShake] = useState(false);
    const refs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) { setResendEnabled(true); return; }
        const t = setTimeout(() => setTimeLeft((p) => p - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleDigitChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        if (value && index < 5) refs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            refs.current[5]?.focus();
        }
    };

    const handleResend = async () => {
        setError(''); setDigits(Array(6).fill('')); setResendEnabled(false);
        setTimeLeft(300); setLocked(false);
        await AuthService.forgotPassword(email);
        refs.current[0]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otp = digits.join('');
        if (otp.length < 6) { setError('Please enter all 6 digits.'); return; }
        setError(''); setLoading(true);
        try {
            const result = await AuthService.verifyResetOtp(email, otp);
            onNext({ resetToken: result.resetToken });
        } catch (err) {
            if (err.status === 429) {
                setLocked(true);
                setError(err.message || 'Too many attempts. Please wait 10 minutes.');
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 600);
                setDigits(Array(6).fill(''));
                refs.current[0]?.focus();
                setError(err.message || 'Invalid code. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const timerColor = timeLeft <= 60 ? '#ef4444' : timeLeft <= 120 ? '#f59e0b' : 'var(--text-secondary)';

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '18px',
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                }}>
                    <KeyRound size={28} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Enter Reset Code
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    We sent a 6-digit code to<br />
                    <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                </p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: locked ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444',
                        padding: '10px 14px', borderRadius: '10px', marginBottom: '1.25rem',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem'
                    }}>
                    <AlertCircle size={16} />{error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <motion.div
                    animate={shake ? 'shake' : 'idle'}
                    variants={shakeVariants}
                    style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {digits.map((digit, i) => (
                        <motion.input
                            key={i}
                            ref={(el) => refs.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            onPaste={i === 0 ? handlePaste : undefined}
                            aria-label={`OTP digit ${i + 1}`}
                            disabled={locked}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            style={{
                                width: '48px', height: '60px', textAlign: 'center',
                                fontSize: '1.5rem', fontWeight: 700,
                                borderRadius: '12px', border: `2px solid ${digit ? 'var(--primary)' : 'var(--border-color)'}`,
                                background: digit ? 'var(--primary-light)' : 'var(--bg-secondary)',
                                color: 'var(--text-primary)', outline: 'none',
                                transition: 'all 0.2s ease', caretColor: 'var(--primary)'
                            }}
                        />
                    ))}
                </motion.div>

                {/* Timer */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <span style={{ color: timerColor, fontSize: '0.875rem', fontWeight: 600, transition: 'color 0.3s' }}>
                        {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
                    </span>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || locked}
                    style={{ padding: '13px', width: '100%', borderRadius: '12px', fontSize: '1rem', marginBottom: '0.75rem' }}>
                    {loading ? <><Loader className="spin" size={18} /> Verifying...</> : 'Verify Code'}
                </button>

                <button
                    type="button"
                    onClick={handleResend}
                    disabled={!resendEnabled}
                    style={{
                        width: '100%', padding: '11px', borderRadius: '12px', fontSize: '0.9rem',
                        background: 'transparent', border: '1px solid var(--border-color)',
                        color: resendEnabled ? 'var(--primary)' : 'var(--text-secondary)',
                        cursor: resendEnabled ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        fontWeight: 500, transition: 'all 0.2s'
                    }}>
                    <RefreshCw size={14} />
                    {resendEnabled ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <button onClick={onBack}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    ← Change email
                </button>
            </p>
        </div>
    );
};

// ─── Step 3: New Password ────────────────────────────────────────────────────
const StepPassword = ({ resetToken, onSuccess }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const strength = getPasswordStrength(newPassword);
    const passwordsMatch = confirmPassword && newPassword === confirmPassword;
    const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
        if (!/[A-Z]/.test(newPassword)) { setError('Password must contain at least one uppercase letter.'); return; }
        if (!/[0-9]/.test(newPassword)) { setError('Password must contain at least one number.'); return; }

        setError(''); setLoading(true);
        try {
            await AuthService.resetPassword(resetToken, newPassword, confirmPassword);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '1rem 0' }}>
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 14, delay: 0.1 }}
                    style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: 'rgba(34,197,94,0.12)', border: '2px solid #22c55e',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
                    }}>
                    <CheckCircle2 size={40} color="#22c55e" />
                </motion.div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Password Updated!
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Your password has been reset successfully. Redirecting to login...
                </p>
                <motion.div
                    initial={{ width: '0%' }} animate={{ width: '100%' }}
                    transition={{ duration: 2.5, ease: 'linear' }}
                    style={{ height: '3px', background: 'var(--success)', borderRadius: '2px' }}
                />
            </motion.div>
        );
    }

    return (
        <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '18px',
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                }}>
                    <Lock size={28} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Set New Password
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Choose a strong password for your account
                </p>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', padding: '10px 14px', borderRadius: '10px', marginBottom: '1.25rem',
                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem'
                    }}>
                    <AlertCircle size={16} />{error}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* New Password */}
                <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                        New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type={showNew ? 'text' : 'password'}
                            placeholder="Min. 8 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            aria-label="New Password"
                            style={{
                                width: '100%', padding: '13px 44px 13px 42px',
                                borderRadius: '12px', border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                outline: 'none', fontSize: '0.95rem'
                            }}
                        />
                        <button type="button" onClick={() => setShowNew(!showNew)}
                            aria-label="Toggle password visibility"
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {newPassword && (
                        <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Strength</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: strength.color }}>{strength.label}</span>
                            </div>
                            <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div
                                    animate={{ width: strength.width }}
                                    transition={{ duration: 0.3 }}
                                    style={{ height: '100%', background: strength.color, borderRadius: '2px' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                        Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            aria-label="Confirm Password"
                            style={{
                                width: '100%', padding: '13px 44px 13px 42px',
                                borderRadius: '12px',
                                border: `1px solid ${passwordsMismatch ? '#ef4444' : passwordsMatch ? '#22c55e' : 'var(--border-color)'}`,
                                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                                outline: 'none', fontSize: '0.95rem'
                            }}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            aria-label="Toggle confirm password visibility"
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {confirmPassword && (
                        <p style={{ marginTop: '4px', fontSize: '0.75rem', color: passwordsMatch ? '#22c55e' : '#ef4444' }}>
                            {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || passwordsMismatch}
                    style={{ padding: '13px', width: '100%', borderRadius: '12px', fontSize: '1rem', marginTop: '0.25rem' }}>
                    {loading ? <><Loader className="spin" size={18} /> Updating Password...</> : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [data, setData] = useState({ email: '', resetToken: '' });

    const goNext = useCallback((newData) => {
        setDirection(1);
        setData((prev) => ({ ...prev, ...newData }));
        setStep((s) => s + 1);
    }, []);

    const goBack = useCallback(() => {
        setDirection(-1);
        setStep((s) => s - 1);
    }, []);

    return (
        <div className="auth-wrapper page-transition">
            {/* Top Left Back Button */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 50 }}>
                <button onClick={() => navigate('/')} className="btn-ghost"
                    style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <ArrowLeft size={18} /> <span className="hide-mobile">Back to Home</span>
                </button>
            </div>

            {/* Brand Panel */}
            <div className="auth-brand-panel">
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/auth_logo.png" alt="HireLens" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>HireLens AI</h1>
                    </div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Account<br />
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Recovery.</span>
                    </h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.85, maxWidth: '380px', lineHeight: 1.7 }}>
                        Forgot your password? No worries — we'll send a secure 6-digit code to your registered email address.
                    </p>
                    <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {['End-to-end encrypted reset', 'Code expires in 5 minutes', 'Rate-limited for your safety'].map((txt, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.85 }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.95rem' }}>{txt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Panel */}
            <div className="auth-content-panel">
                <div className="auth-card" style={{ overflow: 'hidden' }}>
                    <StepIndicator current={step} />

                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={cardVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                        >
                            {step === 1 && <StepEmail onNext={goNext} />}
                            {step === 2 && <StepOtp email={data.email} onNext={goNext} onBack={goBack} />}
                            {step === 3 && <StepPassword resetToken={data.resetToken} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
