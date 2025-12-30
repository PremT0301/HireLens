import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import HireLensLoader from '../components/ui/HireLensLoader';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired, already_verified
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const [resending, setResending] = useState(false);

    useEffect(() => {
        const verify = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');
            const userId = params.get('userId');

            // If userId is missing, it might be an old link. 
            // Our new backend requires userId. 
            // If token is missing, it's definitely invalid.
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }

            try {
                // Pass userId if it exists. 
                // Note: If userId is missing, backend will currently return Failure/Invalid.
                const url = userId
                    ? `/auth/verify-email?userId=${userId}&token=${token}`
                    : `/auth/verify-email?token=${token}`; // Fallback attempt (though backend demands userId now)

                const response = await axios.get(url);

                // Backend returns: { message, status }
                const apiStatus = response.data.status;

                if (apiStatus === 'already_verified') {
                    setStatus('already_verified');
                } else {
                    setStatus('success');
                }
                setMessage(response.data.message || 'Email verified successfully!');

                // Auto-redirect after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);

            } catch (error) {
                const apiStatus = error.response?.data?.status;
                const apiMessage = error.response?.data?.message || 'Verification failed.';

                if (apiStatus === 'expired') {
                    setStatus('expired');
                    setMessage('Verification link expired. Please request a new one.');
                } else if (apiStatus === 'already_verified') {
                    // Should be 200 OK mostly, but catching just in case
                    setStatus('already_verified');
                    setMessage(apiMessage);
                    // Auto-redirect
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(apiMessage);
                }
            }
        };

        verify();
    }, [location]);

    const handleResend = async () => {
        setResending(true);
        try {
            const params = new URLSearchParams(location.search);
            const userId = params.get('userId');

            if (userId) {
                // Smart Resend using userId
                await axios.post(`/auth/resend-verification?userId=${userId}`);
                alert("Verification email sent! Please check your inbox.");
            } else {
                // Fallback to email prompt if we don't have userId
                const email = prompt("Please enter your email address to receive a new verification link:");
                if (!email) {
                    setResending(false);
                    return;
                }
                await axios.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);
                alert("Verification email sent! Please check your inbox.");
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to resend email.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '3rem', textAlign: 'center' }}>
                {status === 'verifying' && (
                    <>
                        <HireLensLoader text="Verifying your email..." />
                        <h2 className="gradient-text">Verifying...</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Please wait while we activate your account.</p>
                    </>
                )}

                {(status === 'success' || status === 'already_verified') && (
                    <>
                        <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1.5rem' }} />
                        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                            {status === 'success' ? 'Success!' : 'Already Verified'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>
                        <button onClick={() => navigate('/login')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto' }}>
                            Go to Login <ArrowRight size={18} />
                        </button>
                    </>
                )}

                {(status === 'error' || status === 'expired') && (
                    <>
                        <XCircle size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
                        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                            {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button onClick={handleResend} className="btn-secondary" disabled={resending} style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                {resending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                            <button onClick={() => navigate('/signup')} className="btn-primary">Try Signing Up Again</button>
                            <Link to="/login" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Back to Login</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
