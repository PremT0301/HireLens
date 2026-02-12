import React, { useEffect, useState } from 'react';
import { Search, Slash, Briefcase } from 'lucide-react';
import AdminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const JobModeration = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await AdminService.getJobs();
            setJobs(data);
        } catch (error) {
            addToast("Failed to load jobs", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleJobStatus = async (job) => {
        const action = job.status === 'Active' ? "close" : "reopen";
        if (!window.confirm(`Are you sure you want to ${action} this job?`)) {
            return;
        }

        try {
            const result = await AdminService.toggleJobStatus(job.jobId);
            addToast(result.message, "success");
            setJobs(jobs.map(j =>
                j.jobId === job.jobId
                    ? { ...j, status: result.status }
                    : j
            ));
        } catch (error) {
            addToast(error.message || `Failed to ${action} job`, "error");
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.recruiterEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>Job Moderation</h2>

                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #d1d5db',
                            width: '300px'
                        }}
                    />
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Job Title</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Recruiter</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Posted Date</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading jobs...</td>
                            </tr>
                        ) : filteredJobs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No jobs found</td>
                            </tr>
                        ) : (
                            filteredJobs.map((job) => (
                                <tr key={job.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: '#111827' }}>{job.title}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#4b5563' }}>{job.recruiterEmail}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>{new Date(job.createdDate).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: job.status === 'Open' ? '#dbeafe' : '#f3f4f6',
                                            color: job.status === 'Open' ? '#1e40af' : '#374151'
                                        }}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <label style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                width: '40px',
                                                height: '24px',
                                                cursor: 'pointer'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={job.status === 'Active'}
                                                    onChange={() => handleToggleJobStatus(job)}
                                                    style={{ opacity: 0, width: 0, height: 0 }}
                                                />
                                                <span style={{
                                                    position: 'absolute',
                                                    cursor: 'pointer',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor: job.status === 'Active' ? '#10b981' : '#ef4444',
                                                    transition: '.4s',
                                                    borderRadius: '24px'
                                                }}></span>
                                                <span style={{
                                                    position: 'absolute',
                                                    content: '""',
                                                    height: '16px',
                                                    width: '16px',
                                                    left: job.status === 'Active' ? '20px' : '4px',
                                                    bottom: '4px',
                                                    backgroundColor: 'white',
                                                    transition: '.4s',
                                                    borderRadius: '50%'
                                                }}></span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JobModeration;
