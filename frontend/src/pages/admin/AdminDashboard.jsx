import React, { useEffect, useState, useCallback } from 'react';
import { Users, Briefcase, FileText, CheckCircle, Activity, Database, Cpu, Clock, RefreshCw } from 'lucide-react';
import AdminService from '../../services/adminService';
import { createSignalRConnection } from '../../services/analyticsService';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        transition: 'transform 0.2s',
        cursor: 'default'
    }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: `${color}15`,
            color: color
        }}>
            <Icon size={28} />
        </div>
        <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>{title}</p>
            {loading ? (
                <div style={{ height: '2rem', width: '60%', backgroundColor: '#f1f5f9', borderRadius: '0.375rem' }} className="animate-pulse"></div>
            ) : (
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
            )}
        </div>
    </div>
);

const HealthCard = ({ title, status, icon: Icon, color }) => {
    const isHealthy = status === 'Healthy' || status === 'Connected' || status === 'Reachable';
    const statusColor = isHealthy ? '#10b981' : '#ef4444';

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.25rem',
            borderRadius: '0.75rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: `4px solid ${statusColor}`
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={20} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#334155' }}>{title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: statusColor }}>{status}</span>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalApplicants: 0,
        totalRecruiters: 0,
        totalJobs: 0,
        activeJobs: 0,
        closedJobs: 0,
        totalApplications: 0,
        totalHires: 0,
        averageMatchScore: 0
    });
    const [health, setHealth] = useState({
        backend: "Healthy",
        database: "Checking...",
        aiService: "Checking...",
        uptime: "0d 0h 0m"
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const [statsData, healthData] = await Promise.all([
                AdminService.getStats(),
                AdminService.getHealth()
            ]);
            setStats(statsData);
            setHealth(healthData);
            setError(null);
        } catch (err) {
            setError("Failed to load dashboard data");
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Polling every 30 seconds as requested (Level 1)
        const pollInterval = setInterval(() => {
            fetchData(true);
        }, 30000);

        // SignalR for real-time (Level 2)
        let isMounted = true;
        const connection = createSignalRConnection();

        const startConnection = async () => {
            try {
                await connection.start();
                if (isMounted) {
                    console.log("Connected to AnalyticsHub");
                    connection.on("ReceiveAnalyticsUpdate", (updateType) => {
                        console.log("Real-time update received:", updateType);
                        fetchData(true);
                    });
                } else {
                    await connection.stop();
                }
            } catch (err) {
                // Ignore AbortError caused by stopping during negotiation (common in React Dev Mode)
                if (isMounted && err.name !== 'AbortError' && !err.message?.includes('stopped during negotiation')) {
                    console.error("SignalR Connection Error: ", err);
                }
            }
        };

        startConnection();

        return () => {
            isMounted = false;
            clearInterval(pollInterval);
            if (connection.state === 'Connected') {
                connection.stop();
            }
        };
    }, [fetchData]);

    if (error && !stats.totalUsers) {
        return (
            <div style={{ padding: '2rem', color: '#ef4444', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <p>{error}</p>
                <button
                    onClick={() => fetchData()}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Admin Control Center</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Production-grade monitoring and system management</p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        color: '#475569',
                        fontWeight: '600',
                        cursor: refreshing ? 'not-allowed' : 'pointer',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Updating..." : "Refresh"}
                </button>
            </div>

            {/* Health Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem'
            }}>
                <HealthCard title="Backend API" status={health.backend} icon={Activity} />
                <HealthCard title="MySQL Database" status={health.database} icon={Database} />
                <HealthCard title="Python AI Service" status={health.aiService} icon={Cpu} />
                <HealthCard title="System Uptime" status={health.uptime} icon={Clock} />
            </div>

            {/* Main Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem'
            }}>
                <StatCard
                    title="Total Ecosystem Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="#3b82f6"
                    loading={loading}
                />
                <StatCard
                    title="Active Applicants"
                    value={stats.totalApplicants}
                    icon={Users}
                    color="#10b981"
                    loading={loading}
                />
                <StatCard
                    title="Verified Recruiters"
                    value={stats.totalRecruiters}
                    icon={Briefcase}
                    color="#8b5cf6"
                    loading={loading}
                />
                <StatCard
                    title="Live Job Postings"
                    value={stats.activeJobs}
                    icon={FileText}
                    color="#f59e0b"
                    loading={loading}
                />
                <StatCard
                    title="Total Applications"
                    value={stats.totalApplications}
                    icon={CheckCircle}
                    color="#ec4899"
                    loading={loading}
                />
                <StatCard
                    title="Average Match Score"
                    value={`${(stats.averageMatchScore * 100).toFixed(1)}%`}
                    icon={Activity}
                    color="#06b6d4"
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
