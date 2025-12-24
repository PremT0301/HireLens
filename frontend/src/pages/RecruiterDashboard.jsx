import React from 'react';
import { Users, FileText, TrendingUp, Search } from 'lucide-react';

const RecruiterDashboard = () => {
    return (
        <div className="container page-transition" style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Recruiter Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage job postings and screen candidates</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard icon={<Users size={24} />} title="Total Candidates" value="1,248" trend="+12%" />
                <StatCard icon={<FileText size={24} />} title="Active Jobs" value="8" trend="+2" />
                <StatCard icon={<TrendingUp size={24} />} title="Placement Rate" value="64%" trend="+5%" />
            </div>

            {/* Main Content Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Recent Applications */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Recent Applications</h3>
                        <button className="btn-ghost" style={{ fontSize: '0.9rem' }}>View All</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                borderBottom: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)' }}></div>
                                    <div>
                                        <h4 style={{ fontSize: '1rem' }}>Candidate #{2040 + i}</h4>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Senior Python Developer</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: i % 2 === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                        color: i % 2 === 0 ? '#34d399' : '#fbbf24',
                                        fontSize: '0.8rem',
                                        marginBottom: '4px'
                                    }}>
                                        {i % 2 === 0 ? 'High Match' : 'Potential'}
                                    </span>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>8{9 - i}% Match</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button className="btn-primary" style={{ width: '100%' }}>Post New Job</button>
                        <button className="btn-ghost" style={{ width: '100%', border: '1px solid var(--glass-border)' }}>Search Database</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, trend }) => (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
                padding: '10px',
                borderRadius: '10px',
                background: 'var(--bg-secondary)',
                color: 'var(--accent-primary)'
            }}>{icon}</div>
            <span style={{ color: '#34d399', fontSize: '0.9rem' }}>{trend}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>{value}</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{title}</div>
    </div>
);

export default RecruiterDashboard;
