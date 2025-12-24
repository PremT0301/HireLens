
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Sun, Moon, Briefcase, LayoutDashboard, FileText, MessageSquare, Users, PlusCircle, TrendingUp, Menu, X, User } from 'lucide-react';
import AuthService from '../api/authService';
// Assuming ThemeContext exists or use local state if not. 
// Actually, looking at previous code, useTheme wasn't imported but used? 
// Wait, the previous view showed `const [isDark, setIsDark] = useState(true); ` locally.
// So `useTheme` might not be needed if it was local. 
// But the previous REPLACE block used `const { isDark, toggleTheme } = useTheme(); `.
// Let's stick to what was in the file before or what works.
// The file has local state `isDark`.
// But my previous attempted edit introduced `useTheme`. 
// I should probably revert to local state or fix the import if I want `useTheme`.
// Given the file content in step 183 uses local state, I will stick to local state to minimize breakage, 
// OR I should use the `ProfileEditor` import.

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
        // window.location.replace takes care of navigation
    };

    const isLandingPage = location.pathname === '/';

    // Navigation Links Configuration
    const applicantLinks = [
        { label: 'Dashboard', path: '/applicant/dashboard' },
        { label: 'Analysis & Gap Report', path: '/applicant/gap-analysis' },
        { label: 'Interview Copilot', path: '/applicant/interview-copilot' },
        { label: 'Job Matches', path: '/applicant/jobs' },
    ];

    const recruiterLinks = [
        { label: 'Dashboard', path: '/recruiter/dashboard' },
        { label: 'Talent Pool', path: '/recruiter/talent-pool' },
        { label: 'Post a Job', path: '/recruiter/create-job' },
        { label: 'Job Postings', path: '/recruiter/jobs' },
        { label: 'Market Analytics', path: '/recruiter/analytics' },
    ];

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            width: '100%',
            padding: '0.8rem 2rem',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-primary)',
            background: 'linear-gradient(to bottom, var(--bg-primary), transparent)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            {/* Logo */}
            <Link to={userRole === 'applicant' ? '/applicant' : userRole === 'recruiter' ? '/recruiter' : '/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>AI</span>
                </div>
                <span style={{
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: 'var(--text-primary)'
                }}>ResumePro</span>
            </Link>

            {/* Center Navigation */}
            <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {userRole === 'applicant' && applicantLinks.map(link => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === '/applicant' || link.path === '/recruiter'}
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        style={({ isActive }) => ({
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontWeight: isActive ? '600' : '400',
                            transition: 'color 0.2s',
                            fontSize: '0.95rem'
                        })}
                    >
                        {link.label}
                    </NavLink>
                ))}

                {userRole === 'recruiter' && recruiterLinks.map(link => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === '/applicant' || link.path === '/recruiter'}
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        style={({ isActive }) => ({
                            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontWeight: isActive ? '600' : '400',
                            transition: 'color 0.2s',
                            fontSize: '0.95rem'
                        })}
                    >
                        {link.label}
                    </NavLink>
                ))}

                {/* Landing Page Links (only if not logged in) */}
                {!userRole && isLandingPage && (
                    <>
                        <Link to="/login" className="btn-ghost" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>Log In</Link>
                        <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px', borderRadius: '20px' }}>Sign Up</Link>
                    </>
                )}
            </div>

            {/* Right Side - Theme and Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={toggleTheme} className="icon-btn" style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex'
                }}>
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {userRole && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} // Use new state name
                            className="btn-ghost"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-primary)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem'
                            }}>
                                {userRole[0].toUpperCase()}
                            </div>
                        </button>

                        {isProfileMenuOpen && ( // Use new state name
                            <div className="glass-panel" style={{
                                position: 'absolute',
                                top: '120%',
                                right: 0,
                                width: '180px',
                                padding: '0.5rem',
                                flexDirection: 'column',
                                display: 'flex',
                                gap: '4px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                            }}>
                                {/* Profile Button */}
                                <button
                                    onClick={() => { setIsProfileMenuOpen(false); setIsProfileEditorOpen(true); }}
                                    style={{
                                        textAlign: 'left', padding: '10px', background: 'transparent',
                                        border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '4px',
                                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                                    }}
                                >
                                    <User size={16} /> Profile
                                </button>
                                <button onClick={handleLogout} style={{
                                    textAlign: 'left', padding: '10px', background: 'transparent',
                                    border: 'none', color: 'var(--error)', cursor: 'pointer', borderRadius: '4px',
                                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                                }}>
                                    Log Out
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Toggle */}
            <div className="mobile-toggle" style={{ display: 'none' }}>
                <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)' }}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            <style>{`
@media(max - width: 900px) {
                    .desktop - menu { display: none!important; }
                    .mobile - toggle { display: block!important; }
}
`}</style>

            {/* Profile Editor Modal */}
            <ProfileEditor
                isOpen={isProfileEditorOpen}
                onClose={() => setIsProfileEditorOpen(false)}
                userRole={userRole}
            />
        </nav>
    );
};

export default Navbar;
