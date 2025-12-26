import React from 'react';
import { MapPin, DollarSign, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobService from '../../api/jobService';
import ApplicationService from '../../api/applicationService';
import HireLensLoader from '../../components/ui/HireLensLoader';

const Jobs = () => {
    const navigate = useNavigate();
    const [resumeData, setResumeData] = React.useState(null);

    React.useEffect(() => {
        const saved = localStorage.getItem('resumeResult');
        if (saved) {
            setResumeData(JSON.parse(saved));
        }
    }, []);

    const handleApply = async (jobId) => {
        if (!window.confirm("Are you sure you want to apply for this job?")) return;

        try {
            await ApplicationService.applyToJob(jobId);
            alert("Application submitted successfully!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data || "Failed to submit application.");
        }
    };

    const handleAnalyze = (job) => {
        if (!job.description || job.description.trim() === '') {
            alert("Job Description not provided by the recruiter.");
            return;
        }
        navigate('/applicant/gap-analysis', {
            state: {
                jobId: job.jobId,
                jobDescription: job.description
            }
        });
    };

    const getSuitability = (matchScore) => {
        if (matchScore >= 80) return { label: 'Highly Suitable', color: 'var(--success)', bg: 'rgba(76, 175, 80, 0.1)' };
        if (matchScore >= 60) return { label: 'Suitable', color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' };
        return { label: 'Needs Improvement', color: 'var(--warning)', bg: 'rgba(251, 191, 36, 0.1)' };
    };

    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await JobService.getAllJobs();
                setJobs(data);
            } catch (error) {
                console.error("Failed to load jobs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <HireLensLoader text="Loading Jobs..." />;

    return (
        <div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Available Jobs</h1>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {jobs.map((job) => {
                    const suitability = getSuitability(job.match || 0); // Default 0 if not calculated yet

                    return (
                        <div key={job.jobId} className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.3rem' }}>{job.title}</h3>
                                    {/* Suitability Preview */}
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: suitability.bg,
                                        color: suitability.color,
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        border: `1px solid ${suitability.color}`,
                                        display: job.match ? 'inline-block' : 'none'
                                    }}>
                                        {suitability.label}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} /> {job.companyName}</span>
                                    {/* Location is not in JobDto yet, hardcode or remove */}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Remote</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn-ghost"
                                    style={{ border: '1px solid var(--glass-border)' }}
                                    onClick={() => navigate(`/applicant/jobs/${job.jobId}`)}
                                >
                                    View Details
                                </button>
                                <button onClick={() => handleAnalyze(job)} className="btn-primary">
                                    {resumeData ? 'Check Readiness' : 'Analyze Fit'}
                                </button>
                                <button
                                    className="btn-primary"
                                    style={{ background: 'var(--success)', border: 'none' }}
                                    onClick={() => handleApply(job.jobId)}
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Jobs;
