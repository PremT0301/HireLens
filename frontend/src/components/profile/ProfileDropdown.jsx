import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, TrendingUp, CreditCard, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const ProfileDropdown = ({ isOpen, onToggle, userProfile, userImage, getProfileImageUrl, refreshProfile }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const plan = user.plan || 'FREE';
    const role = (user.role || '').toUpperCase();

    const handleLogout = () => {
        onToggle(false);
        logout();
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                onClick={() => onToggle(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent',
                    border: 'none', padding: '4px 8px', borderRadius: '30px', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    boxShadow: isOpen ? '0 0 0 1px rgba(255, 255, 255, 0.1)' : 'none'
                }}
            >
                {userImage ? (
                    <img src={getProfileImageUrl(userImage)} alt="Profile" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: '700', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        {user.fullName?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{user.fullName || 'User'}</span>
                    {plan !== 'FREE' && (
                        <span style={{
                            fontSize: '0.6rem',
                            fontWeight: '800',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: plan === 'ELITE_PLUS' ? 'linear-gradient(45deg, #f59e0b, #ef4444)' : 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
                            color: 'white',
                            textTransform: 'uppercase',
                        }}>
                            {plan.replace('_', '+')}
                        </span>
                    )}
                </div>

                <ChevronDown size={14} color="var(--text-secondary)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="glass-panel"
                        style={{
                            position: 'absolute',
                            top: '125%',
                            right: 0,
                            width: '260px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            zIndex: 1100,
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(16px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '16px'
                        }}
                    >
                        {/* Profile Header */}
                        <div style={{ padding: '12px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>{user.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{user.email}</div>
                        </div>

                        <button onClick={() => { onToggle(false); navigate(role === 'RECRUITER' ? '/recruiter/dashboard' : '/applicant/dashboard'); }} className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', transition: 'all 0.2s' }}>
                            <User size={18} /> <span style={{ marginLeft: '12px', fontWeight: '500' }}>My Profile</span>
                        </button>

                        {/* Subscription Conditional Items */}
                        {role !== 'ADMIN' && (
                            <>
                                {plan === 'FREE' ? (
                                    <button
                                        onClick={() => { onToggle(false); navigate('/pricing'); }}
                                        className="btn-ghost"
                                        style={{
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            color: 'var(--primary)',
                                            fontWeight: '700',
                                            backgroundColor: 'rgba(var(--primary-rgb), 0.1)'
                                        }}
                                    >
                                        <TrendingUp size={18} /> <span style={{ marginLeft: '12px' }}>Upgrade Plan</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { onToggle(false); navigate('/manage-subscription'); }}
                                        className="btn-ghost"
                                        style={{
                                            justifyContent: 'flex-start',
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '10px',
                                            border: 'none',
                                            color: '#8b5cf6'
                                        }}
                                    >
                                        <CreditCard size={18} /> <span style={{ marginLeft: '12px', fontWeight: '500' }}>Manage Subscription</span>
                                    </button>
                                )}
                            </>
                        )}

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>

                        <button
                            onClick={handleLogout}
                            className="btn-ghost logout-hover"
                            style={{
                                justifyContent: 'flex-start',
                                width: '100%',
                                color: '#ff4444',
                                padding: '12px',
                                borderRadius: '10px',
                                border: 'none'
                            }}
                        >
                            <LogOut size={18} /> <span style={{ marginLeft: '12px', fontWeight: '500' }}>Log Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .logout-hover:hover {
                    background-color: rgba(255, 68, 68, 0.1) !important;
                }
                @media (max-width: 600px) {
                    .desktop-only { display: none; }
                }
            `}</style>
        </div>
    );
};

export default ProfileDropdown;
