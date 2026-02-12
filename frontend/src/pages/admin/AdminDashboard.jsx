import React, { useEffect, useState } from 'react';
import { Users, Briefcase, FileText, CheckCircle } from 'lucide-react';
import AdminService from '../../services/adminService';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    }}>
        <div style={{
            padding: '0.75rem',
            borderRadius: '0.375rem',
            backgroundColor: `${color}20`,
            color: color
        }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{title}</p>
            {loading ? (
                <div style={{ height: '2rem', width: '4rem', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', marginTop: '0.25rem' }} className="animate-pulse"></div>
            ) : (
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{value}</p>
            )}
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalApplicants: 0,
        totalRecruiters: 0,
        totalJobs: 0,
        totalApplications: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AdminService.getStats();
                setStats(data);
            } catch (err) {
                setError("Failed to load dashboard statistics");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (error) {
        return (
            <div style={{ padding: '2rem', color: '#ef4444', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                {error}
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Dashboard Overview</h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem'
            }}>
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="#3b82f6"
                    loading={loading}
                />
                <StatCard
                    title="Applicants"
                    value={stats.totalApplicants}
                    icon={Users}
                    color="#10b981"
                    loading={loading}
                />
                <StatCard
                    title="Recruiters"
                    value={stats.totalRecruiters}
                    icon={Briefcase}
                    color="#8b5cf6"
                    loading={loading}
                />
                <StatCard
                    title="Active Jobs"
                    value={stats.totalJobs}
                    icon={FileText}
                    color="#f59e0b"
                    loading={loading}
                />
                <StatCard
                    title="Applications"
                    value={stats.totalApplications}
                    icon={CheckCircle}
                    color="#ec4899"
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;
