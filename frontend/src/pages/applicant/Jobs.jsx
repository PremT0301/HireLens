import React from 'react';
import { MapPin, DollarSign, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Jobs = () => {
    const navigate = useNavigate();
    const [resumeData, setResumeData] = React.useState(null);

    React.useEffect(() => {
        const saved = localStorage.getItem('resumeResult');
        if (saved) {
            setResumeData(JSON.parse(saved));
        }
    }, []);

    const handleAnalyze = (job) => {
        // In a real app, we'd pass the job ID/Description context
        navigate('/applicant/gap-analysis');
    };

    const getSuitability = (matchScore) => {
        if (matchScore >= 80) return { label: 'Highly Suitable', color: 'var(--success)', bg: 'rgba(76, 175, 80, 0.1)' };
        if (matchScore >= 60) return { label: 'Suitable', color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' };
        return { label: 'Needs Improvement', color: 'var(--warning)', bg: 'rgba(251, 191, 36, 0.1)' };
    };

    const jobs = [
        { id: 1, title: "Senior Python Developer", company: "TechFlow AI", location: "Remote", salary: "$120k - $160k", match: 92 },
        { id: 2, title: "Data Scientist", company: "DataCorp", location: "New York, NY", salary: "$130k - $170k", match: 88 },
        { id: 3, title: "Machine Learning Engineer", company: "InnovateX", location: "San Francisco, CA", salary: "$150k - $200k", match: 75 },
    ];

    return (
        <div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Available Jobs</h1>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {jobs.map((job) => {
                    const suitability = getSuitability(job.match);

                    return (
                        <div key={job.id} className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
                                        border: `1px solid ${suitability.color}`
                                    }}>
                                        {suitability.label}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} /> {job.company}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {job.location}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} /> {job.salary}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)' }}>View Details</button>
                                <button onClick={() => handleAnalyze(job)} className="btn-primary">
                                    {resumeData ? 'Check Readiness' : 'Analyze Fit'}
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
