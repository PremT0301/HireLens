
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Sun, Moon, Briefcase, LayoutDashboard, FileText, MessageSquare, Users, PlusCircle, TrendingUp, Menu, X, User, LogOut, Bell } from 'lucide-react';
import AuthService from '../api/authService';
import ProfileService from '../api/profileService';

import ProfileEditor from './profile/ProfileEditor';

const Navbar = () => {
    const [isDark, setIsDark] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState(sessionStorage.getItem('userRole'));
    const [userProfile, setUserProfile] = useState(null);

    // Scroll State for Glass Effect
    const [isScrolled, setIsScrolled] = useState(false);

    // Profile Editor State
    const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

    // Scroll Effect (Glass State Only)
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            const role = sessionStorage.getItem('userRole');
            setUserRole(role);

            if (role) {
                try {
                    let profileData = null;
                    if (role === 'recruiter') {
                        profileData = await ProfileService.getRecruiterProfile();
                    } else if (role === 'applicant') {
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
        { label: 'Copilot', path: '/applicant/interview-copilot', icon: MessageSquare },
        { label: 'Matches', path: '/applicant/jobs', icon: Briefcase },
        { label: 'Inbox', path: '/applicant/inbox', icon: MessageSquare },
    ];

    const recruiterLinks = [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'Talent Pool', path: '/recruiter/talent-pool', icon: Users },
        { label: 'Post Job', path: '/recruiter/create-job', icon: PlusCircle },
        { label: 'Jobs', path: '/recruiter/jobs', icon: FileText },
        { label: 'Inbox', path: '/recruiter/inbox', icon: MessageSquare },
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
                if (userRole === 'recruiter') {
                    profileData = await ProfileService.getRecruiterProfile();
                } else if (userRole === 'applicant') {
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

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            width: '100%',
            height: '74px', // Explicit height
            zIndex: 1000,
            backgroundColor: isScrolled ? 'var(--glass-bg)' : 'var(--bg-primary)', // Always have background unless specified otherwise
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            borderBottom: isScrolled ? '1px solid var(--border-color)' : '1px solid transparent',
            boxShadow: isScrolled ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.3s ease'
        }}>
            <div className="container" style={{
                height: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>

                {/* Logo Section */}
                <Link to={userRole === 'applicant' ? '/applicant/dashboard' : userRole === 'recruiter' ? '/recruiter/dashboard' : '/'}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="HireLens Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em'
                    }}>HireLens AI</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    {userRole === 'applicant' && applicantLinks.map(link => (
                        <NavItem key={link.path} to={link.path} label={link.label} />
                    ))}

                    {userRole === 'recruiter' && recruiterLinks.map(link => (
                        <NavItem key={link.path} to={link.path} label={link.label} />
                    ))}


                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                    {/* Notifications */}
                    {userRole && (
                        <Link
                            to={userRole === 'applicant' ? '/applicant/notifications' : '/recruiter/notifications'}
                            className="btn-ghost"
                            style={{ padding: '8px', borderRadius: '50%', color: 'var(--text-secondary)' }}
                        >
                            <Bell size={20} />
                        </Link>
                    )}

                    {/* Landing Page Links */}
                    {!userRole && isLandingPage && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn-ghost">Log In</Link>
                            <Link to="/signup" className="btn-primary">Sign Up</Link>
                        </div>
                    )}

                    {/* Theme Toggle */}
                    <button onClick={toggleTheme} className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Profile Dropdown */}
                    {userRole && (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '4px 8px',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: isProfileMenuOpen ? '0 0 0 2px var(--primary-light)' : 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {userImage ? (
                                    <img
                                        src={getProfileImageUrl(userImage)}
                                        alt="Profile"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid var(--border-color)'
                                        }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        {userProfile ? userProfile.fullName?.charAt(0) : userRole[0].toUpperCase()}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {userProfile ? userProfile.fullName.split(' ')[0] : (userRole === 'applicant' ? 'Applicant' : 'Recruiter')}
                                    </span>
                                </div>
                                <User size={16} color="var(--text-secondary)" />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="glass-panel" style={{
                                    position: 'absolute',
                                    top: '120%',
                                    right: 0,
                                    width: '200px',
                                    padding: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    zIndex: 1100
                                }}>
                                    <button
                                        onClick={() => { setIsProfileMenuOpen(false); setIsProfileEditorOpen(true); }}
                                        className="btn-ghost"
                                        style={{ justifyContent: 'flex-start', width: '100%' }}
                                    >
                                        <User size={16} /> My Profile
                                    </button>
                                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                                    <button
                                        onClick={handleLogout}
                                        className="btn-ghost"
                                        style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--error)' }}
                                    >
                                        <LogOut size={16} /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <div className="mobile-toggle" style={{ display: 'none' }}>
                        <button onClick={() => setIsOpen(!isOpen)} className="btn-ghost">
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
        </nav>
    );
};

// Nav Item Component for consistent styling
const NavItem = ({ to, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
        style={({ isActive }) => ({
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
            textDecoration: 'none',
            fontWeight: isActive ? 600 : 500,
            fontSize: '0.95rem',
            position: 'relative',
            padding: '8px 0',
            transition: 'color 0.2s'
        })}
    >
        {({ isActive }) => (
            <>
                {label}
                {isActive && (
                    <span style={{
                        position: 'absolute',
                        bottom: '-24px', // Align with navbar border
                        left: 0,
                        width: '100%',
                        height: '3px',
                        background: 'var(--primary)',
                        borderTopLeftRadius: '3px',
                        borderTopRightRadius: '3px',

                    }} />
                )}
            </>
        )}
    </NavLink>
);

export default Navbar;
