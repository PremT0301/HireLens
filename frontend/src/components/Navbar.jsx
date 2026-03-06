import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Sun, Moon, Briefcase, LayoutDashboard, FileText, MessageSquare, Users, PlusCircle, TrendingUp, Menu, X, User, LogOut, Bell, ChevronDown, ExternalLink, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthService from '../api/authService';
import ProfileService from '../api/profileService';
import { useAuth } from '../context/AuthContext';
import ProfileDropdown from './profile/ProfileDropdown';

import ProfileEditor from './profile/ProfileEditor';

const Navbar = () => {
    const [isDark, setIsDark] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState((sessionStorage.getItem('userRole') || '').toUpperCase());
    const [userProfile, setUserProfile] = useState(null);
    const { user, logout } = useAuth();
    const userPlan = user?.plan || 'FREE';


    // Scroll & Visibility State
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Product Dropdown State (NOT NEEDED ANYMORE)
    const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

    // Profile States
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Scroll Effect (Smart Hide)
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Determine if scrolled (for glass effect)
            setIsScrolled(currentScrollY > 10);

            // Determine visibility (Hide on down, Show on up)
            if (currentScrollY > lastScrollY && currentScrollY > 70) {
                setIsVisible(false); // Scrolling Down
            } else {
                setIsVisible(true);  // Scrolling Up
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Initialize theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
            setIsDark(false);
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            setIsDark(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    // Auth check & Profile Refresh
    useEffect(() => {
        const role = (sessionStorage.getItem('userRole') || '').toUpperCase();
        setUserRole(role);

        const fetchProfile = async () => {
            if (role) {
                try {
                    let profileData = null;
                    if (role === 'RECRUITER') {
                        profileData = await ProfileService.getRecruiterProfile();
                    } else if (role === 'APPLICANT') {
                        profileData = await ProfileService.getMyProfile();
                    }
                    if (profileData) {
                        setUserProfile(profileData);
                    }
                } catch (error) {
                    console.error("Failed to fetch navbar profile", error);
                }
            }
        };

        fetchProfile();
    }, [location, user]); // Refresh when location or user (plan) changes

    const toggleTheme = () => {
        setIsDark(!isDark);
        const newTheme = !isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const isLandingPage = location.pathname === '/';

    // Navigation Links Configuration
    const applicantLinks = [
        { label: 'Dashboard', path: '/applicant/dashboard', icon: LayoutDashboard },
        { label: 'Copilot', path: '/applicant/interview-copilot', icon: MessageSquare, requiredPlan: 'PRO' },
        { label: 'Matches', path: '/applicant/jobs', icon: Briefcase },
        { label: 'Inbox', path: '/applicant/inbox', icon: MessageSquare, requiredPlan: 'ELITE_PLUS' },
    ];

    const recruiterLinks = [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'Talent Pool', path: '/recruiter/talent-pool', icon: Users, requiredPlan: 'PRO' },
        { label: 'Post Job', path: '/recruiter/create-job', icon: PlusCircle },
        { label: 'Jobs', path: '/recruiter/jobs', icon: FileText },
        { label: 'Inbox', path: '/recruiter/inbox', icon: MessageSquare, requiredPlan: 'ELITE_PLUS' },
    ];

    // Helper to constructing full image URL
    const getProfileImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const baseUrl = "http://localhost:5033";
        return `${baseUrl}${path}`;
    };

    const refreshProfile = async () => {
        if (userRole) {
            try {
                let profileData = null;
                if (userRole === 'RECRUITER') {
                    profileData = await ProfileService.getRecruiterProfile();
                } else if (userRole === 'APPLICANT') {
                    profileData = await ProfileService.getMyProfile();
                }
                if (profileData) {
                    setUserProfile(profileData);
                }
            } catch (error) {
                console.error("Failed to fetch navbar profile", error);
            }
        }
    };

    const getUserImage = () => {
        if (!userProfile) return null;
        const profileImg = userProfile.profileImage || userProfile.ProfileImage;
        if (profileImg) return profileImg;
        const companyLogo = userProfile.companyLogo || userProfile.CompanyLogo;
        if (companyLogo) return companyLogo;
        return null;
    };

    const userImage = getUserImage();

    const handleProductClick = (e) => {
        e.preventDefault();
        if (location.pathname !== '/') {
            navigate('/#products');
            // The scroll is handled by useEffect in Landing.jsx or logic here
            // But usually, a hash link works if handled correctly.
            // Let's ensure it scrolls.
        } else {
            const element = document.getElementById('products');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <>
            {/* Announcement Bar */}
            <AnimatePresence>
                {isAnnouncementVisible && isLandingPage && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="announcement-bar"
                    >
                        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            <span>Introducing AI Resume Copilot — Now Live 🚀</span>
                            <Link to="#" className="announcement-link">Know More →</Link>
                            <button
                                onClick={() => setIsAnnouncementVisible(false)}
                                style={{ position: 'absolute', right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav style={{
                position: 'sticky',
                top: 0,
                width: '100%',
                zIndex: 1000,
                backgroundColor: isScrolled ? 'var(--glass-bg)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(var(--glass-blur))' : 'none',
                WebkitBackdropFilter: isScrolled ? 'blur(var(--glass-blur))' : 'none',
                borderBottom: '1px solid var(--glass-border)',
                boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.08)' : '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div className="container" style={{
                    height: '80px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 2rem'
                }}>

                    {/* Left: Logo & Nav Links */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
                        <Link to={userRole === 'APPLICANT' ? '/applicant/dashboard' : userRole === 'RECRUITER' ? '/recruiter/dashboard' : userRole === 'ADMIN' ? '/admin/dashboard' : '/'}
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/logo.png" alt="HireLens Logo" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
                            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                                HireLens<span style={{ color: 'var(--primary)' }}>AI</span>
                            </span>
                        </Link>

                        {/* Enterprise Links (Public Pages) */}
                        {!userRole && (
                            <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                <button
                                    onClick={handleProductClick}
                                    className="nav-item-enterprise"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Product
                                </button>
                                <NavLink to="/enterprise" className="nav-item-enterprise">Enterprise</NavLink>
                                <NavLink to="/blog" className="nav-item-enterprise">Blogs</NavLink>
                                <NavLink to="/pricing" className="nav-item-enterprise">Pricing</NavLink>
                                <NavLink to="/applicant/jobs" className="nav-item-enterprise" style={{ gap: '6px' }}>
                                    Looking for a Job <ExternalLink size={14} />
                                </NavLink>
                            </div>
                        )}

                        {/* App Specific Links */}
                        {userRole && userRole !== 'ADMIN' && (
                            <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                {(userRole === 'APPLICANT' ? applicantLinks : recruiterLinks).map(link => (
                                    <NavItem
                                        key={link.path}
                                        to={link.path}
                                        label={link.label}
                                        requiredPlan={link.requiredPlan}
                                        currentPlan={userPlan}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {!userRole ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <Link to="/login" className="btn-nav-text">Log In</Link>
                                <Link to="/signup" className="btn-nav-primary">Sign Up</Link>
                            </div>
                        ) : userRole && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                {userRole !== 'ADMIN' && (
                                    <Link
                                        to={userRole === 'APPLICANT' ? '/applicant/notifications' : '/recruiter/notifications'}
                                        className="btn-ghost"
                                        style={{ padding: '10px', borderRadius: '50%', color: 'var(--text-secondary)' }}
                                    >
                                        <Bell size={20} />
                                    </Link>
                                )}

                                {/* Profile Dropdown */}
                                <ProfileDropdown
                                    isOpen={isProfileMenuOpen}
                                    onToggle={setIsProfileMenuOpen}
                                    userProfile={userProfile}
                                    userImage={userImage}
                                    getProfileImageUrl={getProfileImageUrl}
                                    refreshProfile={refreshProfile}
                                />
                            </div>
                        )}

                        <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '10px', borderRadius: '50%', border: 'none' }}>
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <div className="mobile-toggle" style={{ display: 'none' }}>
                            <button onClick={() => setIsOpen(!isOpen)} className="btn-ghost" style={{ border: 'none' }}>
                                {isOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Styles Injection */}
                <style>{`
                    @media(max-width: 900px) {
                        .desktop-menu { display: none !important; }
                        .mobile-toggle { display: block !important; }
                    }
                `}</style>

                {/* Profile Modal */}
                <ProfileEditor
                    isOpen={isProfileEditorOpen}
                    onClose={() => setIsProfileEditorOpen(false)}
                    userRole={userRole}
                    onProfileUpdate={refreshProfile}
                />
            </nav >
        </>
    );
};

// Nav Item Component for consistent premium styling
const NavItem = ({ to, label, requiredPlan, currentPlan }) => {
    const isLocked = requiredPlan && (
        (requiredPlan === 'PRO' && currentPlan === 'FREE') ||
        (requiredPlan === 'ELITE_PLUS' && (currentPlan === 'FREE' || currentPlan === 'PRO'))
    );

    return (
        <NavLink
            to={to}
            className={({ isActive }) => `nav-item-enterprise ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
            {label}
            {isLocked && (
                <span title={`Requires ${requiredPlan.replace('_', '+')} Plan`} style={{ opacity: 0.6 }}>
                    <TrendingUp size={12} />
                </span>
            )}
        </NavLink>
    );
};

export default Navbar;
