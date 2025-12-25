import React from 'react';
import { Users, FileText, TrendingUp, Search, PlusCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThreeDTiltCard from '../../components/ui/ThreeDTiltCard';

const RecruiterDashboard = () => {
    return (
        <div className="container page-transition" style={{ paddingTop: '50px', paddingBottom: '4rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="title-lg" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Recruiter Dashboard</h1>
                    <p className="text-subtle">Overview of your hiring pipeline and active roles.</p>
                </div>
                <Link to="/recruiter/create-job" className="btn-primary">
                    <PlusCircle size={18} /> Post New Job
                </Link>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <ThreeDTiltCard>
                    <StatCard
                        icon={<Users size={24} />}
                        title="Total Candidates"
                        subtitle="Total received candidates"
                        value="1,248"
                        trend="+12%"
                        color="var(--primary)"
                    />
                </ThreeDTiltCard>
                <ThreeDTiltCard>
                    <StatCard
                        icon={<FileText size={24} />}
                        title="Active Jobs"
                        subtitle="Currently open roles"
                        value="8"
                        trend="+2"
                        color="var(--secondary)"
                    />
                </ThreeDTiltCard>
                <ThreeDTiltCard>
                    <StatCard
                        icon={<TrendingUp size={24} />}
                        title="Placement Rate"
                        subtitle="Candidates hired this month"
                        value="64%"
                        trend="+5%"
                        color="var(--success)"
                    />
                </ThreeDTiltCard>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Recent Applications Column */}
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Applications</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <select className="btn-ghost" style={{ border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                                <option value="score_desc">Sort by Score (High to Low)</option>
                                <option value="score_asc">Sort by Score (Low to High)</option>
                                <option value="date_desc">Sort by Date</option>
                            </select>
                            <Link to="/recruiter/talent-pool" className="btn-ghost" style={{ fontSize: '0.9rem' }}>
                                View All <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: "John Doe", role: "Senior Python Developer", score: 92, label: "Highly Suitable", time: "2h ago" },
                            { name: "Jane Smith", role: "Data Scientist", score: 88, label: "Highly Suitable", time: "5h ago" },
                            { name: "Mike Johnson", role: "ML Engineer", score: 75, label: "Suitable", time: "1d ago" },
                            { name: "Sarah Williams", role: "Frontend Dev", score: 55, label: "Needs Improvement", time: "2d ago" },
                        ].map((candidate, i) => (
                            <CandidateRow key={i} candidate={candidate} />
                        ))}
                    </div>
                </div>

                {/* Sidebar / Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Quick Actions Card */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link to="/recruiter/create-job" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                Post New Job
                            </Link>
                            <button className="btn-ghost" style={{ width: '100%', border: '1px solid var(--border-color)', justifyContent: 'center' }}>
                                Search Database
                            </button>
                            <button className="btn-ghost" style={{ width: '100%', border: '1px solid var(--border-color)', justifyContent: 'center' }}>
                                Invite Candidate
                            </button>
                        </div>
                    </div>

                    {/* Funnel Preview (Mock) */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Pipeline Health</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span className="text-subtle" style={{ fontSize: '0.9rem' }}>Screening</span>
                            <span style={{ fontWeight: 600 }}>12</span>
                        </div>
                        <ProgressBar value={80} color="var(--primary)" />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <span className="text-subtle" style={{ fontSize: '0.9rem' }}>Interview</span>
                            <span style={{ fontWeight: 600 }}>5</span>
                        </div>
                        <ProgressBar value={40} color="var(--secondary)" />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <span className="text-subtle" style={{ fontSize: '0.9rem' }}>Offer</span>
                            <span style={{ fontWeight: 600 }}>2</span>
                        </div>
                        <ProgressBar value={20} color="var(--success)" />
                    </div>

                </div>

            </div>
        </div>
    );
};

/* ================= COMPONENTS ================= */

const StatCard = ({ icon, title, subtitle, value, trend, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: `color-mix(in srgb, ${color} 10%, transparent)`,
                color: color
            }}>{icon}</div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--success)',
                fontSize: '0.85rem',
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '4px 8px',
                borderRadius: '20px',
                height: 'fit-content'
            }}>
                <TrendingUp size={14} /> {trend}
            </div>
        </div>
        <div style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.2rem', lineHeight: 1 }}>{value}</div>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{subtitle}</div>
    </div>
);

const CandidateRow = ({ candidate }) => {
    const getBadgeColor = (label) => {
        if (label === 'Highly Suitable') return 'badge-success';
        if (label === 'Suitable') return 'badge-primary'; // Adjust if badge-primary is not defined as blue/yellow equivalent, assuming badge-warning or similar
        return 'badge-warning'; // Fallback
    };

    // Custom style for badges if class not available
    const getBadgeStyle = (label) => {
        if (label === 'Highly Suitable') return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: 'var(--success)' };
        if (label === 'Suitable') return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: 'var(--primary)' };
        return { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--warning)', border: 'var(--warning)' };
    };

    const badgeStyle = getBadgeStyle(candidate.label);

    return (
        <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'none',
            background: 'var(--bg-secondary)' // Inner card background
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                }}>
                    {candidate.name.charAt(0)}
                </div>
                <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2px' }}>{candidate.name}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{candidate.role}</span>
                </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <div style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                    fontSize: '0.8rem',
                    fontWeight: '600'
                }}>
                    {candidate.score}% Match
                </div>
                <div style={{ fontSize: '0.75rem', color: badgeStyle.color, fontWeight: 500 }}>
                    {candidate.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Applied {candidate.time}</div>
            </div>
        </div>
    );
};

const ProgressBar = ({ value, color }) => (
    <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '3px' }}></div>
    </div>
);

export default RecruiterDashboard;
