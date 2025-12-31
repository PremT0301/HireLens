import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, IndianRupee, Calendar, Clock, Users, Building, CheckCircle, Gift, ListChecks } from 'lucide-react';
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
                <ArrowLeft size={18} /> Previous
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
                            <IndianRupee size={18} /> Salary Range
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            ₹{job.salaryMin.toLocaleString()} - ₹{job.salaryMax.toLocaleString()}
                        </div>
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            <Briefcase size={18} /> Experience
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {job.experienceMin} - {job.experienceMax} Years
                        </div>
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                            <Users size={18} /> Openings
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            {job.numberOfOpenings}
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
                    {/* Role Overview */}
                    {job.roleOverview && (
                        <section>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Role Overview</h3>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>{job.roleOverview}</p>
                        </section>
                    )}

                    {/* Key Responsibilities */}
                    {job.keyResponsibilities && (
                        <section>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Key Responsibilities</h3>
                            <p style={{ lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{job.keyResponsibilities}</p>
                        </section>
                    )}

                    {/* Technologies */}
                    {job.technologies && (
                        <section>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Technologies / Tools</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {job.technologies.split(',').map((tech, i) => (
                                    <span key={i} style={{ background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
                                        {tech.trim()}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    <section>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle size={20} className="text-primary" /> Skills & Requirements
                        </h3>
                        {job.mandatorySkills && job.mandatorySkills.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '12px' }}>Skill</th>
                                            <th style={{ padding: '12px' }}>Category</th>
                                            <th style={{ padding: '12px' }}>Level</th>
                                            <th style={{ padding: '12px' }}>Weight</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {job.mandatorySkills.map((skill, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '12px', fontWeight: 500 }}>{skill.skillName}</td>
                                                <td style={{ padding: '12px' }}>{skill.category}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span style={{
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        background: skill.proficiencyLevel === 'Advanced' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                        color: skill.proficiencyLevel === 'Advanced' ? 'var(--success)' : 'var(--info)',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {skill.proficiencyLevel}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px' }}>{skill.weight}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                                {job.requiredSkills ? job.requiredSkills.split(',').map((skill, index) => (
                                    <li key={index} style={{ lineHeight: '1.6' }}>
                                        {skill.trim()}
                                    </li>
                                )) : <li style={{ listStyle: 'none' }} className="text-subtle">No specific requirements listed.</li>}
                            </ul>
                        )}
                    </section>

                    {/* Benefits */}
                    {(job.perksAndBenefits || job.growthOpportunities) && (
                        <section>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Gift size={20} className="text-success" /> Compensation & Benefits
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {job.perksAndBenefits && (
                                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Perks & Benefits</h4>
                                        <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{job.perksAndBenefits}</p>
                                    </div>
                                )}
                                {job.growthOpportunities && (
                                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Growth Opportunities</h4>
                                        <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>{job.growthOpportunities}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Hiring Process */}
                    {(job.interviewRounds || job.assessmentRequired) && (
                        <section>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ListChecks size={20} className="text-info" /> Hiring Process
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Assessment</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {job.assessmentRequired ? (
                                            <>
                                                <CheckCircle size={16} className="text-success" />
                                                <span style={{ fontWeight: 600 }}>Required</span>
                                            </>
                                        ) : (
                                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Not Required</span>
                                        )}
                                    </div>
                                </div>

                                {job.assessmentRequired && (
                                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Assessment Type</span>
                                        <span style={{ fontWeight: 600 }}>{job.assessmentType}</span>
                                    </div>
                                )}

                                <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Interview Mode</span>
                                    <span style={{ fontWeight: 600 }}>{job.interviewMode || 'Online'}</span>
                                </div>
                            </div>

                            {job.interviewRounds && (
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Interview Rounds</h4>
                                    <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                        {(job.interviewRounds.startsWith('[') ? JSON.parse(job.interviewRounds) : job.interviewRounds.split(',')).map((round, i) => (
                                            <div key={i} style={{
                                                minWidth: '160px',
                                                padding: '1.25rem',
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                position: 'relative',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '8px'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: 'var(--primary)',
                                                    fontWeight: 700
                                                }}>
                                                    Round {i + 1}
                                                </div>
                                                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{round}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

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
