import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            marginTop: 'auto',
            padding: '0.5rem 0',
            background: 'transparent',
            position: 'relative',
            zIndex: 10,
            borderTop: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '2rem',
                    flexWrap: 'wrap'
                }}>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flex: 1,
                        minWidth: '300px'
                    }}>
                        <div style={{
                            width: '30px',
                            height: '30px',
                            flexShrink: 0
                        }}>
                            <img src="/logo.png" alt="HireLens AI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.7rem',
                                lineHeight: '1.3',
                                margin: 0,
                                fontWeight: '500'
                            }}>
                                AI-powered functionality for modern recruitment and career advancement.
                            </p>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.7rem',
                                lineHeight: '1.3',
                                margin: 0
                            }}>
                                Bridging the gap between talent and opportunity.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Copyright */}
                    <div style={{ flexShrink: 0 }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', margin: 0, textAlign: 'right' }}>
                            © {new Date().getFullYear()} HireLens AI. All rights reserved.
                        </p>
                    </div>
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
