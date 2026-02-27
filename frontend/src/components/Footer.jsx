import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Linkedin, Twitter, Github } from 'lucide-react';

const Footer = () => {
    const userRole = (sessionStorage.getItem('userRole') || '').toUpperCase();
    const isLoggedIn = !!userRole;

    if (isLoggedIn && userRole === 'APPLICANT') {
        return (
            <footer style={{
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                padding: '3rem 0 1.5rem',
                position: 'relative',
                zIndex: 10
            }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Left: Brand */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/logo.png" alt="HireLens AI" style={{ height: '28px' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>HireLens <span style={{ color: 'var(--primary)' }}>AI</span></span>
                        </div>

                        {/* Center: Quick Links */}
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <Link to="/applicant/dashboard" className="portal-footer-link">Dashboard</Link>
                            <Link to="/applicant/interview-copilot" className="portal-footer-link">Copilot</Link>
                            <Link to="/applicant/jobs" className="portal-footer-link">Matches</Link>
                            <Link to="/settings" className="portal-footer-link">Settings</Link>
                            <Link to="/support" className="portal-footer-link">Support</Link>
                        </div>

                        {/* Right: Account */}
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link to="/privacy" className="portal-footer-link" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Privacy</Link>
                            <Link to="/security" className="portal-footer-link" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Security</Link>
                            <button className="portal-footer-link" style={{ fontSize: '0.85rem', opacity: 0.8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}>Delete Account</button>
                        </div>
                    </div>

                    <div style={{
                        paddingTop: '1.5rem',
                        borderTop: '1px solid var(--border-color)',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', opacity: 0.7 }}>
                            © 2026 HireLens AI — Applicant Portal
                        </p>
                    </div>
                </div>
                <style>{`
                    .portal-footer-link {
                        color: var(--text-secondary);
                        text-decoration: none;
                        font-size: 0.9rem;
                        font-weight: 500;
                        transition: color 0.2s ease;
                    }
                    .portal-footer-link:hover {
                        color: var(--primary);
                    }
                `}</style>
            </footer>
        );
    }

    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            padding: '5rem 0 2rem',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '4rem',
                    marginBottom: '4rem'
                }}>
                    {/* Brand Column */}
                    <div style={{ flex: '1.5' }}>
                        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '1.5rem' }}>
                            <img src="/logo.png" alt="HireLens AI" style={{ height: '32px' }} />
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>HireLens AI</span>
                        </Link>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '300px' }}>
                            Transforming recruitment with next-generation AI intelligence. Bridging the gap between global talent and enterprise opportunity.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <Mail size={16} color="var(--primary)" />
                                <span>support@hirelens.ai</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <MapPin size={16} color="var(--primary)" />
                                <span>Gujarat, India</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Column */}
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Product</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Platform Overview</Link></li>
                            <li><Link to="/enterprise">Enterprise Solutions</Link></li>
                            <li><Link to="/pricing">Pricing Plans</Link></li>
                            <li><Link to="/release-notes">Release Notes</Link></li>
                        </ul>
                    </div>

                    {/* Navigation Column */}
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Navigation</h4>
                        <ul className="footer-links">
                            <li><Link to="/blog">Blogs</Link></li>
                            <li><Link to="/applicant/jobs">Looking for a Job</Link></li>
                            <li><Link to="/login">Account Log In</Link></li>
                            <li><Link to="/signup">Get Started Free</Link></li>
                        </ul>
                    </div>

                    {/* Social Column */}
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Follow Us</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Stay updated with our latest AI advancements.</p>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <a href="#" className="social-link"><Linkedin size={20} /></a>
                            <a href="#" className="social-link"><Twitter size={20} /></a>
                            <a href="#" className="social-link"><Github size={20} /></a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        © {new Date().getFullYear()} HireLens AI. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <Link to="#" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link to="#" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</Link>
                    </div>
                </div>
            </div>

            <style>{`
                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                .footer-links li {
                    margin-bottom: 0.75rem;
                }
                .footer-links a {
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: 0.95rem;
                    transition: color 0.2s ease;
                }
                .footer-links a:hover {
                    color: var(--primary);
                }
                .social-link {
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }
                .social-link:hover {
                    color: var(--primary);
                    transform: translateY(-2px);
                }
            `}</style>
        </footer>
    );
};

export default Footer;
