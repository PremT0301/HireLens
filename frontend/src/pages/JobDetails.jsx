import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, Clock, Users, Building } from 'lucide-react';
import JobService from '../api/jobService';
import { Loader2 } from 'lucide-react';

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await JobService.getJobById(jobId);
                setJob(data);
            } catch (error) {
                console.error("Failed to load job details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    if (!job) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>Job Not Found</h2>
                <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginTop: '1rem' }}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container page-transition" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button
                onClick={() => navigate(-1)}
                className="btn-ghost"
                style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: 0 }}
            >
                <ArrowLeft size={18} /> Back '
            </button>

            <div className="glass-panel" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="title-lg" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{job.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Building size={16} /> {job.companyName}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={16} /> {job.locationType === 'Remote' ? 'Remote' : job.location}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Briefcase size={16} /> {job.employmentType || 'Full-time'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={16} /> Posted {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            background: job.status === 'Active' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                            color: job.status === 'Active' ? '#34d399' : '#9ca3af',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            {job.status}
                        </span>
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0 0 2rem 0' }}></div>

                {/* Job Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            <DollarSign size={18} /> Salary Range
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            <Briefcase size={18} /> Experience
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {job.experienceRequired}+ Years
                        </div>
                    </div>
                    {/* Placeholder for Applicants if easier to fetch */}
                    {/* <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            <Users size={18} /> Applicants
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                           12 (Mock)
                        </div>
                    </div> */}
                </div>

                {/* Detailed Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <section>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Key Requirements / Skills</h3>
                        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            {job.requiredSkills ? job.requiredSkills.split(',').map((skill, index) => (
                                <li key={index} style={{ lineHeight: '1.6' }}>
                                    {skill.trim()}
                                </li>
                            )) : <li style={{ listStyle: 'none' }} className="text-subtle">No specific requirements listed.</li>}
                        </ul>
                    </section>

                    {/* Description Section */}
                    <section>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Job Description</h3>
                        <div style={{ lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                            {job.description || (
                                <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                    No description provided.
                                </span>
                            )}
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default JobDetails;
