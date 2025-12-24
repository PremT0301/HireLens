import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto', // Pushes footer to bottom if flex spacing is used
            paddingTop: '3rem',
            background: 'var(--bg-primary)',
            borderTop: '1px solid var(--glass-border)',
            position: 'relative',
            zIndex: 10
        }}>
            <div className="container" style={{ paddingBottom: '2rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>
                    {/* Brand Section */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>AI</span>
                            </div>
                            <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>ResumePro</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            AI-powered functionality for modern recruitment and career advancement. Bridging the gap between talent and opportunity.
                        </p>
                    </div>



                    {/* Resources */}
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Resources</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }} className="hover-text">Blog</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }} className="hover-text">Documentation</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }} className="hover-text">Help Center</span>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Connect</h4>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover-icon"><Github size={20} /></a>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover-icon"><Twitter size={20} /></a>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover-icon"><Linkedin size={20} /></a>
                            <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} className="hover-icon"><Mail size={20} /></a>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid var(--glass-border)',
                    paddingTop: '1.5rem',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        © {new Date().getFullYear()} ResumePro AI. All rights reserved.
                    </p>
                </div>
            </div>

            <style>{`
                .hover-text:hover { color: var(--primary) !important; }
                .hover-icon:hover { color: var(--primary) !important; transform: translateY(-2px); }
            `}</style>
        </footer>
    );
};

export default Footer;
