import React, { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, Search, PlusCircle, ArrowUpRight, MoreHorizontal, Calendar, Mail, FileText as FileIcon, X, Phone, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThreeDTiltCard from '../../components/ui/ThreeDTiltCard';
import ApplicationService from '../../api/applicationService';
import Modal from '../../components/ui/Modal';

const RecruiterDashboard = () => {
    const [stats, setStats] = useState({
        totalCandidates: 0,
        activeJobs: 0,
        placementRate: '0%',
        trend: '+0%'
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [sortOrder, setSortOrder] = useState('score_desc');

    const [pipeline, setPipeline] = useState({ Screening: 0, Interview: 0, Offer: 0 });
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleStatusUpdate = async (appId, status) => {
        try {
            await ApplicationService.updateStatus(appId, status);
            // innovative: optimistic update or reload
            const updated = recentApplications.map(app =>
                app.applicationId === appId ? { ...app, status } : app
            );
            setRecentApplications(updated);
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleScheduleClick = (candidate) => {
        setSelectedCandidate(candidate);
        setIsInterviewModalOpen(true);
    };

    const handleViewProfile = (candidate) => {
        setSelectedCandidate(candidate);
        setIsProfileModalOpen(true);
    };

    const handleInterviewScheduled = async (interviewData) => {
        try {
            await ApplicationService.scheduleInterview(selectedCandidate.applicationId, interviewData);
            setIsInterviewModalOpen(false);
            // Refresh list or optimistic update
            const updated = recentApplications.map(app =>
                app.applicationId === selectedCandidate.applicationId ? { ...app, status: 'Interview Scheduled' } : app
            );
            setRecentApplications(updated);
            alert("Interview Scheduled Successfully!");
        } catch (error) {
            console.error("Failed to schedule interview", error);
            alert("Failed to schedule interview.");
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const statsData = await ApplicationService.getRecruiterStats();
                setStats(statsData);

                const recentData = await ApplicationService.getRecentApplications();
                setRecentApplications(recentData);

                const pipelineData = await ApplicationService.getPipelineHealth();
                setPipeline(pipelineData);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };
        loadDashboardData();
    }, []);
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
                        value={stats.totalCandidates}
                        trend="+12%"
                        color="var(--primary)"
                    />
                </ThreeDTiltCard>
                <ThreeDTiltCard>
                    <StatCard
                        icon={<FileText size={24} />}
                        title="Active Jobs"
                        subtitle="Currently open roles"
                        value={stats.activeJobs}
                        trend="+2"
                        color="var(--secondary)"
                    />
                </ThreeDTiltCard>
                <ThreeDTiltCard>
                    <StatCard
                        icon={<TrendingUp size={24} />}
                        title="Placement Rate"
                        subtitle="Candidates hired this month"
                        value={stats.placementRate}
                        trend={stats.trend}
                        color="var(--success)"
                    />
                </ThreeDTiltCard>
            </div>

            {/* Main Content Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Recent Applications Column */}
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Recent Applications</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <select
                                className="btn-ghost"
                                style={{
                                    border: '1px solid var(--border-color)',
                                    fontSize: '0.85rem',
                                    padding: '6px 12px',
                                    height: '32px',
                                    cursor: 'pointer',
                                    backgroundPosition: 'right 8px center'
                                }}
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="score_desc">Score: High to Low</option>
                                <option value="score_asc">Score: Low to High</option>
                                <option value="date_desc">Date: Newest</option>
                                <option value="date_asc">Date: Oldest</option>
                            </select>
                            <Link to="/recruiter/talent-pool" className="btn-ghost" style={{ fontSize: '0.85rem', height: '32px', padding: '0 12px', whiteSpace: 'nowrap' }}>
                                View All <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[...recentApplications]
                            .sort((a, b) => {
                                if (sortOrder === 'score_desc') return b.score - a.score;
                                if (sortOrder === 'score_asc') return a.score - b.score;

                                // Parse time strings like "0h ago", "2d ago"
                                const parseTime = (str) => {
                                    if (!str) return 0;
                                    const match = str.match(/(\d+)([hd])/);
                                    if (!match) return 9999;
                                    const val = parseInt(match[1]);
                                    const unit = match[2];
                                    // Convert to hours for comparison
                                    return unit === 'd' ? val * 24 : val;
                                };

                                const timeA = parseTime(a.time);
                                const timeB = parseTime(b.time);

                                // date_desc means smallest time ago first (0h < 5h)
                                if (sortOrder === 'date_desc') return timeA - timeB;
                                if (sortOrder === 'date_asc') return timeB - timeA;
                                return 0;
                            })
                            .map((candidate, i) => (
                                <CandidateRow
                                    key={i}
                                    candidate={candidate}
                                    onSchedule={handleScheduleClick}
                                    onStatusUpdate={handleStatusUpdate}
                                    onViewProfile={handleViewProfile}
                                />
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

                    {/* Pipeline Health (Dynamic) */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem' }}>Pipeline Health</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span className="text-subtle" style={{ fontSize: '0.9rem' }}>Screening</span>
                            <span style={{ fontWeight: 600 }}>{pipeline.Screening}</span>
                        </div>
                        <ProgressBar value={pipeline.Screening > 0 ? (pipeline.Screening / (pipeline.Screening + pipeline.Interview + pipeline.Offer) * 100) : 0} color="var(--primary)" />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <span className="text-subtle" style={{ fontSize: '0.9rem' }}>Interview</span>
                            <span style={{ fontWeight: 600 }}>{pipeline.Interview}</span>
                        </div>
                        <ProgressBar value={pipeline.Interview > 0 ? (pipeline.Interview / (pipeline.Screening + pipeline.Interview + pipeline.Offer) * 100) : 0} color="var(--secondary)" />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                            <span className="text-subtle" style={{ fontSize: '0.9rem' }}>Offer</span>
                            <span style={{ fontWeight: 600 }}>{pipeline.Offer}</span>
                        </div>
                        <ProgressBar value={pipeline.Offer > 0 ? (pipeline.Offer / (pipeline.Screening + pipeline.Interview + pipeline.Offer) * 100) : 0} color="var(--success)" />
                    </div>

                </div>

            </div>

            {isInterviewModalOpen && (
                <ScheduleInterviewModal
                    candidate={selectedCandidate}
                    onClose={() => setIsInterviewModalOpen(false)}
                    onSubmit={handleInterviewScheduled}
                />
            )}

            {isProfileModalOpen && selectedCandidate && (
                <Modal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    title="Candidate Profile"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', color: 'white', fontWeight: 'bold'
                        }}>
                            {selectedCandidate.name.charAt(0)}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{selectedCandidate.name}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{selectedCandidate.role}</p>
                        </div>
                        <span style={{
                            marginLeft: 'auto',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: 'var(--primary-light)', // Fallback if badge style function not accessible here
                            color: 'var(--primary)',
                            fontSize: '0.9rem',
                            fontWeight: '600'
                        }}>
                            {selectedCandidate.label || 'Candidate'}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={18} className="text-gray-400" />
                            <span>{selectedCandidate.email || 'No email provided'}</span>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Phone size={18} className="text-gray-400" />
                            <span>{selectedCandidate.phone || 'N/A'}</span>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Briefcase size={18} className="text-gray-400" />
                            <span>{selectedCandidate.experience || '0'} Years Experience</span>
                        </div>
                        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={18} className="text-gray-400" />
                            <span>{selectedCandidate.time}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button className="btn-ghost" onClick={() => setIsProfileModalOpen(false)}>Close</button>
                        <button className="btn-primary" onClick={() => { setIsProfileModalOpen(false); setIsInterviewModalOpen(true); }}>Schedule Interview</button>
                    </div>
                </Modal>
            )}
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

const CandidateRow = ({ candidate, onSchedule, onStatusUpdate, onViewProfile }) => {
    const [showMenu, setShowMenu] = useState(false);
    const getBadgeColor = (label) => {
        if (label === 'Highly Suitable') return 'badge-success';
        if (label === 'Suitable') return 'badge-primary'; // Adjust if badge-primary is not defined as blue/yellow equivalent, assuming badge-warning or similar
        return 'badge-warning'; // Fallback
    };


    // Custom style for badges if class not available
    const getBadgeStyle = (label) => {
        if (label === 'Hired') return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: 'var(--success)' };
        if (label === 'Highly Suitable') return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: 'var(--success)' };
        if (label === 'Suitable') return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: 'var(--primary)' };
        return { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--warning)', border: 'var(--warning)' };
    };

    const badgeStyle = getBadgeStyle(candidate.label);

    return (
        <div className="glass-panel" style={{
            display: 'grid',
            gridTemplateColumns: 'min-content 2fr 1.5fr 1fr 1fr 1fr',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1rem 1.5rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'none',
            background: 'var(--bg-secondary)',
            transition: 'transform 0.2s ease',
        }}>
            {/* Avatar */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: 'var(--text-secondary)'
            }}>
                {candidate.name.charAt(0)}
            </div>

            {/* Name */}
            <div style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {candidate.name}
            </div>

            {/* Role */}
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {candidate.role}
            </div>

            {/* Match Score */}
            <div style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: '700',
                color: badgeStyle.color
            }}>
                {candidate.score}%
            </div>

            {/* Badge */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                }}>
                    {candidate.label}
                </span>
            </div>

            {/* Time */}
            <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {candidate.time}
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
