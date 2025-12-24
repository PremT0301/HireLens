import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const JobPostings = () => {
    const jobs = [
        { id: 1, title: 'Senior Python Developer', dept: 'Engineering', applicants: 45, status: 'Active' },
        { id: 2, title: 'Product Manager', dept: 'Product', applicants: 28, status: 'Active' },
        { id: 3, title: 'UX Designer', dept: 'Design', applicants: 12, status: 'Draft' },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Job Postings</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your open positions</p>
                </div>
                <div />
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
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
                            <tr key={job.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1.5rem', fontWeight: '600' }}>{job.title}</td>
                                <td style={{ padding: '1.5rem', color: 'var(--text-secondary)' }}>{job.dept}</td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex' }}>
                                            {[1, 2, 3].map(i => (
                                                <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--glass-bg)', marginLeft: '-8px' }}></div>
                                            ))}
                                        </div>
                                        <span>{job.applicants}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: job.status === 'Active' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                                        color: job.status === 'Active' ? '#34d399' : '#fbbf24',
                                        fontSize: '0.85rem'
                                    }}>
                                        {job.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <button className="btn-ghost" style={{ padding: '8px' }}><MoreHorizontal size={20} /></button>
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
