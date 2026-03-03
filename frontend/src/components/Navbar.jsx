import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Sun, Moon, Briefcase, LayoutDashboard, FileText, MessageSquare, Users, PlusCircle, TrendingUp, Menu, X, User, LogOut, Bell, ChevronDown, ExternalLink, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthService from '../api/authService';
import ProfileService from '../api/profileService';

import ProfileEditor from './profile/ProfileEditor';

const Navbar = () => {
    const [isDark, setIsDark] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState((sessionStorage.getItem('userRole') || '').toUpperCase());
    const [userProfile, setUserProfile] = useState(null);
    const [userPlan, setUserPlan] = useState('FREE');


    // Scroll & Visibility State
    const [isScrolled, setIsScrolled] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Product Dropdown State
    const [isProductOpen, setIsProductOpen] = useState(false);
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

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const role = (sessionStorage.getItem('userRole') || '').toUpperCase();
            setUserRole(role);

            const user = AuthService.getCurrentUser();
            setUserPlan(user?.plan || 'FREE');


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
        window.addEventListener('storage', checkAuth);
        checkAuth();
        return () => window.removeEventListener('storage', checkAuth);
    }, [location]);

    const toggleTheme = () => {
        setIsDark(!isDark);
        const newTheme = !isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogout = () => {
        setIsProfileMenuOpen(false);
        setUserProfile(null);
        AuthService.logout();
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
        // API_BASE_URL is "http://localhost:5033/api"
        // We need "http://localhost:5033"
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
        // Prioritize Personal Profile Image (camelCase or PascalCase)
        const profileImg = userProfile.profileImage || userProfile.ProfileImage;
        if (profileImg) return profileImg;

        // Fallback to Company Logo for Recruiter
        const companyLogo = userProfile.companyLogo || userProfile.CompanyLogo;
        if (companyLogo) return companyLogo;

        return null;
    };

    const userImage = getUserImage();

    const productLinks = [
        { label: 'AI Resume Analysis', desc: 'Enterprise parsing intelligence', path: '#' },
        { label: 'Interview Copilot', desc: 'Real-time AI voice coaching', path: '#' },
        { label: 'Skill Gap Engine', desc: 'Predictive career mapping', path: '#' },
    ];

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
                                <div
                                    style={{ position: 'relative' }}
                                    onMouseEnter={() => setIsProductOpen(true)}
                                    onMouseLeave={() => setIsProductOpen(false)}
                                >
                                    <button className="nav-item-enterprise" style={{ background: 'none', border: 'none', cursor: 'pointer', gap: '6px' }}>
                                        Product <ChevronDown size={14} />
                                    </button>

                                    <AnimatePresence>
                                        {isProductOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="glass-panel"
                                                style={{ position: 'absolute', top: '100%', left: 0, width: '300px', padding: '1.25rem', marginTop: '0.75rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                                            >
                                                {productLinks.map((link, idx) => (
                                                    <Link key={idx} to={link.path} className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', padding: '14px', textAlign: 'left', marginBottom: '6px', borderRadius: '12px', border: 'none' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '2px' }}>{link.label}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8 }}>{link.desc}</div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent',
                                            border: 'none', padding: '4px 6px', borderRadius: '30px', cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: isProfileMenuOpen ? '0 0 0 2px var(--primary-light)' : 'none'
                                        }}
                                    >
                                        {userImage ? (
                                            <img src={getProfileImageUrl(userImage)} alt="Profile" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                                        ) : (
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: '700' }}>
                                                {userProfile ? userProfile.fullName?.charAt(0) : userRole[0].toUpperCase()}
                                            </div>
                                        )}

                                        {userPlan !== 'FREE' && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: '800',
                                                padding: '2px 6px',
                                                borderRadius: '6px',
                                                background: userPlan === 'ELITE_PLUS' ? 'linear-gradient(45deg, #f59e0b, #ef4444)' : 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
                                                color: 'white',
                                                textTransform: 'uppercase',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}>
                                                {userPlan.replace('_', '+')}
                                            </span>
                                        )}

                                        <ChevronDown size={14} color="var(--text-secondary)" />

                                    </button>

                                    <AnimatePresence>
                                        {isProfileMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="glass-panel"
                                                style={{ position: 'absolute', top: '120%', right: 0, width: '220px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1100, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                            >
                                                <button onClick={() => { setIsProfileMenuOpen(false); setIsProfileEditorOpen(true); }} className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', padding: '12px', borderRadius: '8px', border: 'none' }}>
                                                    <User size={16} /> <span style={{ marginLeft: '8px' }}>My Profile</span>
                                                </button>
                                                <Link to="/billing" onClick={() => setIsProfileMenuOpen(false)} className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', padding: '12px', borderRadius: '8px', border: 'none' }}>
                                                    <CreditCard size={16} /> <span style={{ marginLeft: '8px' }}>Manage Plan</span>
                                                </Link>
                                                {userPlan !== 'ELITE_PLUS' && (
                                                    <Link to={`/pricing?source=${userRole}`} onClick={() => setIsProfileMenuOpen(false)} className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'var(--primary)', fontWeight: '700' }}>
                                                        <TrendingUp size={16} /> <span style={{ marginLeft: '8px' }}>Upgrade Plan</span>
                                                    </Link>
                                                )}
                                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '6px 0' }}></div>
                                                <button onClick={handleLogout} className="btn-ghost" style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--error)', padding: '12px', borderRadius: '8px', border: 'none' }}>
                                                    <LogOut size={16} /> <span style={{ marginLeft: '8px' }}>Log Out</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
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
