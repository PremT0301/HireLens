import React from 'react';
import { MoreHorizontal, Loader2, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobService from '../../api/jobService';

const JobPostings = () => {
    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [activeActionId, setActiveActionId] = React.useState(null);
    const navigate = useNavigate();

    // Close dropdown on click outside
    React.useEffect(() => {
        const handleClickOutside = () => setActiveActionId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    React.useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await JobService.getPostedJobs();
                setJobs(data);
            } catch (error) {
                console.error("Failed to load jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleAction = async (action, job) => {
        if (action === 'view') {
            navigate(`/recruiter/jobs/${job.jobId}`);
        } else if (action === 'edit') {
            navigate(`/recruiter/edit-job/${job.jobId}`);
        } else if (action === 'close') {
            if (window.confirm(`Are you sure you want to close "${job.title}"? This will mark it as complete.`)) {
                try {
                    await JobService.updateJobStatus(job.jobId, 'Closed');
                    setJobs(jobs.map(j => j.jobId === job.jobId ? { ...j, status: 'Closed' } : j));
                } catch (error) {
                    console.error("Failed to close job", error);
                    alert("Failed to close job");
                }
            }
        } else if (action === 'delete') {
            if (window.confirm(`Are you sure you want to delete "${job.title}"? This cannot be undone.`)) {
                try {
                    await JobService.deleteJob(job.jobId);
                    setJobs(jobs.filter(j => j.jobId !== job.jobId));
                } catch (error) {
                    console.error("Failed to delete job", error);
                    alert("Failed to delete job");
                }
            }
        }
        setActiveActionId(null);
    };

    const getStatusBadge = (status) => {
        const styles = {
            Active: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34d399' },
            Closed: { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' },
            Draft: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }
        };
        const style = styles[status] || styles.Active;
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '20px',
                background: style.bg,
                color: style.color,
                fontSize: '0.85rem'
            }}>
                {status || 'Active'}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Job Postings</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your open positions</p>
                </div>
                <div />
            </div>

            <div className="glass-panel" style={{ overflow: 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '1.5rem', fontWeight: '500' }}>Job Title</th>
                            <th style={{ padding: '1.5rem', fontWeight: '500' }}>Department</th>
                            <th style={{ padding: '1.5rem', fontWeight: '500' }}>Applicants</th>
                            <th style={{ padding: '1.5rem', fontWeight: '500' }}>Status</th>
                            <th style={{ padding: '1.5rem', fontWeight: '500' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.jobId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1.5rem', fontWeight: '600' }}>{job.title}</td>
                                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>{job.department || 'General'}</td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex' }}>
                                            {[1, 2, 3].map(i => (
                                                <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--glass-bg)', marginLeft: '-8px' }}></div>
                                            ))}
                                        </div>
                                        <span>{job.applicantCount}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    {getStatusBadge(job.status)}
                                </td>
                                <td style={{ padding: '1.5rem', position: 'relative' }}>
                                    <button
                                        className="btn-ghost"
                                        style={{ padding: '8px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveActionId(activeActionId === job.jobId ? null : job.jobId);
                                        }}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    {/* Action Dropdown */}
                                    {activeActionId === job.jobId && (
                                        <div className="glass-panel" style={{
                                            position: 'absolute',
                                            right: '1.5rem',
                                            top: '3.5rem',
                                            zIndex: 50,
                                            width: '180px',
                                            padding: '0.5rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                        }}>
                                            <button className="dropdown-item" onClick={() => handleAction('view', job)} style={{ width: '100%', textAlign: 'left', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                                <Eye size={16} /> View Details
                                            </button>
                                            <button className="dropdown-item" onClick={() => handleAction('edit', job)} style={{ width: '100%', textAlign: 'left', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                                <Edit size={16} /> Edit Job
                                            </button>
                                            {job.status !== 'Closed' && (
                                                <button className="dropdown-item" onClick={() => handleAction('close', job)} style={{ width: '100%', textAlign: 'left', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                                    <CheckCircle size={16} /> Complete Hiring
                                                </button>
                                            )}
                                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }}></div>
                                            <button className="dropdown-item" onClick={() => handleAction('delete', job)} style={{ width: '100%', textAlign: 'left', padding: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                                                <Trash2 size={16} /> Delete Job
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobPostings;
