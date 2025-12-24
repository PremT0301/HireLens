import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader } from 'lucide-react';
import AuthService from '../api/authService';

const Login = () => {
    // Role is determined by backend
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        <div className="page-transition" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
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
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}



                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        {loading ? (
                            <>
                                <Loader className="spin" size={18} /> Signing In...
                            </>
                        ) : (
                            <>
                                Sign In <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
