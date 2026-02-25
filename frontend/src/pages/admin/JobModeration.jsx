import React, { useEffect, useState, useCallback } from 'react';
import { Search, Briefcase, Filter, ChevronLeft, ChevronRight, RefreshCw, Layers, Users, TrendingUp } from 'lucide-react';
import AdminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const JobModeration = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const { addToast } = useToast();

    const loadJobs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminService.getJobs({
                status: statusFilter,
                recruiter: searchTerm,
                page,
                pageSize
            });
            setJobs(data);
        } catch (error) {
            addToast("Failed to load jobs", "error");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter, page, pageSize, addToast]);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    const handleToggleJobStatus = async (job) => {
        const action = job.status === 'Active' ? "close" : "reopen";
        if (!window.confirm(`Are you sure you want to ${action} this job?`)) {
            return;
        }

        try {
            await AdminService.toggleJobStatus(job.jobId);
            addToast(`Job ${action}d successfully`, "success");
            loadJobs();
        } catch (error) {
            addToast(error.message || `Failed to ${action} job`, "error");
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Job Moderation</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Global job oversight and recruiters activity monitoring</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search by recruiter..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            style={{
                                padding: '0.625rem 1rem 0.625rem 2.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                width: '320px',
                                fontSize: '0.9375rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: '#475569',
                            fontSize: '0.9375rem',
                            outline: 'none'
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Job Details</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Company / Recruiter</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Applicants</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                    <RefreshCw className="animate-spin" size={32} style={{ color: '#3b82f6', margin: '0 auto' }} />
                                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Syncing global jobs...</p>
                                </td>
                            </tr>
                        ) : jobs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ marginBottom: '1rem' }}><Briefcase size={48} style={{ opacity: 0.2, margin: '0 auto' }} /></div>
                                    No jobs found
                                </td>
                            </tr>
                        ) : (
                            jobs.map((job) => (
                                <tr key={job.jobId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{job.title}</span>
                                            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>ID: {job.jobId.substring(0, 8)}...</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '500', color: '#475569' }}>{job.companyName}</span>
                                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{job.recruiterName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: '600' }}>
                                            <Users size={16} style={{ color: '#64748b' }} />
                                            {job.applicationCount}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.375rem 0.75rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            backgroundColor: job.status === 'Active' ? '#dcfce7' : job.status === 'Closed' ? '#fee2e2' : '#f1f5f9',
                                            color: job.status === 'Active' ? '#15803d' : job.status === 'Closed' ? '#991b1b' : '#475569',
                                            textTransform: 'uppercase'
                                        }}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleToggleJobStatus(job)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.375rem',
                                                border: '1px solid',
                                                borderColor: job.status === 'Active' ? '#ef4444' : '#10b981',
                                                backgroundColor: 'transparent',
                                                color: job.status === 'Active' ? '#ef4444' : '#10b981',
                                                fontSize: '0.8125rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = job.status === 'Active' ? '#ef4444' : '#10b981';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = job.status === 'Active' ? '#ef4444' : '#10b981';
                                            }}
                                        >
                                            {job.status === 'Active' ? "Close Job" : "Reopen Job"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Showing page {page}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            style={{
                                display: 'flex', alignItems: 'center', p: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                                backgroundColor: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1
                            }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button
                            disabled={jobs.length < pageSize}
                            onClick={() => setPage(p => p + 1)}
                            style={{
                                display: 'flex', alignItems: 'center', p: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                                backgroundColor: 'white', cursor: jobs.length < pageSize ? 'not-allowed' : 'pointer', opacity: jobs.length < pageSize ? 0.5 : 1
                            }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobModeration;
