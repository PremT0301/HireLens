
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Sun, Moon, Briefcase, LayoutDashboard, FileText, MessageSquare, Users, PlusCircle, TrendingUp, Menu, X, User, LogOut } from 'lucide-react';
import AuthService from '../api/authService';

import ProfileEditor from './profile/ProfileEditor';

const Navbar = () => {
    const [isDark, setIsDark] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [userRole, setUserRole] = useState(sessionStorage.getItem('userRole'));

    // Profile Editor State
    const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();

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
        const checkAuth = () => {
            const role = sessionStorage.getItem('userRole');
            setUserRole(role);
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
        AuthService.logout();
    };

    const isLandingPage = location.pathname === '/';

    // Navigation Links Configuration
    const applicantLinks = [
        { label: 'Dashboard', path: '/applicant/dashboard', icon: LayoutDashboard },
        { label: 'Analysis', path: '/applicant/gap-analysis', icon: TrendingUp },
        { label: 'Copilot', path: '/applicant/interview-copilot', icon: MessageSquare },
        { label: 'Matches', path: '/applicant/jobs', icon: Briefcase },
    ];

    const recruiterLinks = [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'Talent Pool', path: '/recruiter/talent-pool', icon: Users },
        { label: 'Post Job', path: '/recruiter/create-job', icon: PlusCircle },
        { label: 'Jobs', path: '/recruiter/jobs', icon: FileText },
    ];

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            zIndex: 1000,
            backgroundColor: 'var(--glass-bg)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            borderBottom: '1px solid var(--border-color)',
            transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
            <div className="container" style={{
                height: '70px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>

                {/* Logo Section */}
                <Link to={userRole === 'applicant' ? '/applicant/dashboard' : userRole === 'recruiter' ? '/recruiter/dashboard' : '/'}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                    }}>
                        <Briefcase size={20} color="white" strokeWidth={2.5} />
                    </div>
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

                    {/* Landing Page Links */}
                    {!userRole && isLandingPage && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link to="/login" className="btn-ghost">Log In</Link>
                            <Link to="/signup" className="btn-primary">Sign Up</Link>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

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
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    padding: '6px 12px',
                                    borderRadius: '30px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    {userRole[0].toUpperCase()}
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                    {userRole === 'applicant' ? 'Applicant' : 'Recruiter'}
                                </span>
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
