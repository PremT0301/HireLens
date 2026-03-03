import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield, Zap, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';

const ManageSubscription = () => {
    const { user, updatePlan } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await api.get('/subscription/current');
                setSubscriptionData(response.data);
            } catch (error) {
                console.error("Failed to fetch subscription", error);
            }
        };
        fetchSubscription();
    }, []);

    const handleDowngrade = async () => {
        if (!window.confirm("Are you sure you want to downgrade to the Free plan? You will lose access to premium features.")) return;

        setLoading(true);
        try {
            const response = await api.post('/subscription/downgrade', { plan: 'FREE' });
            updatePlan('FREE');
            addToast("Downgraded to Free plan successfully", "success");
            setSubscriptionData({ ...subscriptionData, plan: 'FREE' });
        } catch (error) {
            addToast("Failed to downgrade plan", "error");
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = user?.plan || 'FREE';
    const renewalDate = subscriptionData?.expiry ? new Date(subscriptionData.expiry).toLocaleDateString() : 'N/A';

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '140px auto 100px', padding: '0 2rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel"
                style={{ padding: '3rem', borderRadius: '24px', border: '1px solid var(--glass-border)' }}
            >
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem' }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, var(--text-primary), var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Manage Subscription
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    View your current billing details and manage your plan preferences.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {/* Plan Card */}
                    <div style={{
                        padding: '2rem',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Plan</span>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '30px',
                                    backgroundColor: currentPlan === 'FREE' ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: '800'
                                }}>
                                    {currentPlan === 'FREE' ? 'FREE' : currentPlan.replace('_', '+')}
                                </span>
                            </div>
                            <div style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                                {currentPlan === 'FREE' ? '₹0' : currentPlan === 'PRO' ? '₹999' : '₹2,499'}
                                <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)' }}>/month</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                {currentPlan === 'FREE' ? 'Basic tools for job seekers and occasional recruiters.' : 'Advanced AI features and unlimited access for professionals.'}
                            </p>
                        </div>

                        {currentPlan !== 'FREE' && (
                            <div style={{ padding: '15px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <RefreshCw size={18} color="#f59e0b" style={{ marginTop: '2px' }} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f59e0b' }}>Next Billing Date</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(245, 158, 11, 0.8)' }}>Your plan will automatically renew on {renewalDate}.</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions Card */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                                <Shield size={20} color="var(--primary)" />
                                <span style={{ fontWeight: '700' }}>Billing Security</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                All transactions are encrypted and secure. We do not store your full card details on our servers.
                            </p>
                        </div>

                        {currentPlan === 'FREE' ? (
                            <button
                                onClick={() => navigate('/pricing')}
                                className="btn-nav-primary"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                            >
                                <Zap size={18} /> Upgrade Now
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentPlan === 'PRO' && (
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: '#8b5cf6', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        Upgrade to Elite+
                                    </button>
                                )}
                                <button
                                    onClick={handleDowngrade}
                                    disabled={loading}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', backgroundColor: 'transparent', border: '1px solid #ff4444', color: '#ff4444', fontWeight: '700', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
                                >
                                    {loading ? 'Processing...' : 'Downgrade to Free'}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    Downgrading will take effect at the end of your current billing cycle.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ManageSubscription;
