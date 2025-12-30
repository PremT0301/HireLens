
import React, { useState, useEffect } from 'react';
import HireLensLoader from '../components/ui/HireLensLoader';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader, Sun, Moon, ArrowLeft } from 'lucide-react';
import AuthService from '../api/authService';

const Login = () => {
    // Role is determined by backend
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Sync theme state on mount
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') setIsDark(true);
        else if (currentTheme === 'light') setIsDark(false);
        else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(prefersDark);
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        const newTheme = !isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Role is actually determined by backend/token, but we pass it if needed or verify it
            const data = await AuthService.login(email, password);

            // Redirect based on the actual role returned/decoded, not just the UI toggle
            // Ideally, backend should enforce role, but for now we trust the stored role
            const storedRole = sessionStorage.getItem('userRole');

            if (storedRole === 'applicant') navigate('/applicant/dashboard');
            else if (storedRole === 'recruiter') navigate('/recruiter/dashboard');
            else navigate('/'); // Fallback

        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper page-transition">
            {/* Top Navigation Controls */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 50 }}>
                <button
                    onClick={() => navigate('/')}
                    className="btn-ghost"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <ArrowLeft size={18} /> <span className="hide-mobile">Back to Home</span>
                    <style>{`@media(max - width: 600px) { .hide - mobile { display: none; } } `}</style>
                </button>
            </div>

            <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 50 }}>
                <button
                    onClick={toggleTheme}
                    className="btn-ghost"
                    style={{
                        padding: '10px',
                        borderRadius: '50%',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Brand Panel */}
            <div className="auth-brand-panel">
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>HireLens AI</h1>
                    </div>

                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Hiring <br />
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Reimagined.</span>
                    </h2>

                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6 }}>
                        Experience the future of recruitment with our AI-powered platform.
                        Smart matching, instant insights, and seamless connections.
                    </p>

                    <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                        {/* <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>98%</span>
                            <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Match Accuracy</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                            <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>10k+</span>
                            <span style={{ fontSize: '0.875rem', opacity: 0.8 }}>Talent Pool</span>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Content Panel */}
            <div className="auth-content-panel">
                <div className="auth-card">
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.9rem',
                            animation: 'fadeInScale 0.3s ease-out'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
                                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{
                                marginTop: '0.5rem',
                                padding: '14px',
                                width: '100%',
                                fontSize: '1rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <Loader className="spin" size={20} /> Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
                    </p>
                </div>
            </div>
            {loading && <HireLensLoader text="Signing In..." subtext="Verifying your credentials..." />}
        </div>
    );
};

export default Login;
