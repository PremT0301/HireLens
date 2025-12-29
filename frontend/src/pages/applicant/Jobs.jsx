import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Building, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import JobService from '../../api/jobService';
import ApplicationService from '../../api/applicationService';
import HireLensLoader from '../../components/ui/HireLensLoader';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { useToast } from '../../context/ToastContext';

const Jobs = () => {
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [resumeData, setResumeData] = useState(null);
    const [jobs, setJobs] = useState([]);

    const [applications, setApplications] = useState({}); // Map jobId -> application data
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'default',
        onConfirm: () => { },
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    useEffect(() => {
        const saved = localStorage.getItem('resumeResult');
        if (saved) {
            setResumeData(JSON.parse(saved));
        }

        const fetchData = async () => {
            try {
                const [jobsData, appsData] = await Promise.all([
                    JobService.getAllJobs(),
                    ApplicationService.getMyApplications()
                ]);
                setJobs(jobsData);

                // Map applications by JobId
                const appsMap = {};
                appsData.forEach(app => {
                    // Robust mapping: Use JobId if available, otherwise match by Title/Company
                    let jobId = app.jobId || app.JobId;

                    if (!jobId) {
                        const match = jobsData.find(j =>
                            j.title === (app.JobTitle || app.jobTitle) &&
                            j.companyName === (app.CompanyName || app.companyName)
                        );
                        if (match) jobId = match.jobId;
                    }

                    if (jobId) {
                        appsMap[jobId] = app;
                    }
                });

                setApplications(appsMap);
            } catch (error) {
                console.error("Failed to load data", error);
                addToast("Failed to load jobs", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openApplyModal = (job) => {
        setModalConfig({
            isOpen: true,
            title: `Apply to ${job.title}`,
            message: `Are you sure you want to submit your application for the ${job.title} position at ${job.companyName}?`,
            type: 'success',
            confirmText: 'Submit Application',
            cancelText: 'Cancel',
            onConfirm: () => handleApply(job)
        });
    };

    const openWithdrawModal = (job) => {
        setModalConfig({
            isOpen: true,
            title: 'Withdraw Application?',
            message: `Are you sure you want to withdraw your application for ${job.title}? This action cannot be undone.`,
            type: 'destructive',
            confirmText: 'Withdraw',
            cancelText: 'Keep Application',
            onConfirm: () => handleWithdraw(job)
        });
    };

    const handleApply = async (job) => {
        try {
            await ApplicationService.applyToJob(job.jobId);
            addToast("Application submitted successfully!", "success");

            setApplications(prev => ({
                ...prev,
                [job.jobId]: { jobId: job.jobId, status: 'Applied' } // Optimistic update
            }));
        } catch (error) {
            console.error(error);
            addToast(error.response?.data || "Failed to submit application.", "error");
        }
    };

    const handleWithdraw = async (job) => {
        const id = job.jobId || job.JobId;
        try {
            await ApplicationService.withdrawApplication(id);
            addToast("Application withdrawn.", "info");

            setApplications(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || error.response?.data || "Failed to withdraw application.";
            addToast(errorMsg, "error");
        }
    };

    const handleAnalyze = (job) => {
        if (!job.description || job.description.trim() === '') {
            addToast("Job Description not provided by the recruiter.", "warning");
            return;
        }
        navigate('/applicant/gap-analysis', {
            state: {
                jobId: job.jobId,
                jobDescription: job.description
            }
        });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Interview Scheduled': return { bg: 'var(--primary)', color: 'white', label: 'Interview Scheduled' };
            case 'Interview Accepted': return { bg: 'var(--success)', color: 'white', label: 'Interview Accepted' };
            case 'Reapplied': return { bg: 'var(--primary)', color: 'white', label: 'Reapplied' };
            case 'Contacted': return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', label: 'Contacted' };
            case 'Offer': return { bg: 'var(--success)', color: 'white', label: 'Offer Received' };
            case 'Hired': return { bg: 'var(--success)', color: 'white', label: 'Hired' };
            case 'Rejected': return { bg: 'var(--error)', color: 'white', label: 'Rejected' };
            default: return { bg: 'var(--secondary)', color: 'white', label: 'Applied' }; // Default applied
        }
    };

    if (loading) return <HireLensLoader text="Loading Jobs..." />;

    return (
        <div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Available Jobs</h1>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {jobs.map((job) => {
                    // Replicated logic because getSuitability removed
                    const matchScore = job.match || 0;
                    let suitability = { label: 'Needs Improvement', color: 'var(--warning)', bg: 'rgba(251, 191, 36, 0.1)' };
                    if (matchScore >= 80) suitability = { label: 'Highly Suitable', color: 'var(--success)', bg: 'rgba(76, 175, 80, 0.1)' };
                    else if (matchScore >= 60) suitability = { label: 'Suitable', color: 'var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' };

                    const application = applications[job.jobId];
                    const statusConfig = application ? getStatusConfig(application.status) : null;

                    return (
                        <div key={job.jobId} className="glass-panel" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.3rem' }}>{job.title}</h3>

                                    {application ? (
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: statusConfig.bg,
                                            color: statusConfig.color,
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}>
                                            {statusConfig.label}
                                        </span>
                                    ) : (
                                        job.match && (
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
                                        )
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} /> {job.companyName}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Remote</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><DollarSign size={16} /> ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>
                                </div>


                                {/* Interview Details Block */}
                                {['Interview Scheduled', 'Interview Accepted'].includes(application?.status) && application.interviewDate && (
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={16} /> Interview Scheduled
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: '1.5rem', fontSize: '0.9rem' }}>
                                            <div>
                                                <div className="text-subtle" style={{ fontSize: '0.8rem' }}>Date & Time</div>
                                                <div style={{ fontWeight: 500 }}>{new Date(application.interviewDate).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-subtle" style={{ fontSize: '0.8rem' }}>Mode</div>
                                                <div style={{ fontWeight: 500 }}>{application.interviewMode}</div>
                                            </div>
                                            {application.meetingLink && (
                                                <div>
                                                    <div className="text-subtle" style={{ fontSize: '0.8rem' }}>Link/Location</div>
                                                    <a href={application.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                                                        Join / View
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {application?.status === 'Hired' ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '0.5rem',
                                    padding: '0.8rem 1.5rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--success)',
                                    color: 'var(--success)',
                                    fontWeight: '600',
                                    marginLeft: 'auto'
                                }}>
                                    <span style={{ fontSize: '1.2rem' }}>🎉</span>
                                    <span>Congratulations! You've been hired!</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="btn-ghost"
                                        style={{ border: '1px solid var(--glass-border)' }}
                                        onClick={() => navigate(`/applicant/jobs/${job.jobId}`)}
                                    >
                                        View Details
                                    </button>

                                    {!application || application.status === 'Rejected' ? (
                                        <button onClick={() => handleAnalyze(job)} className="btn-primary">
                                            {resumeData ? 'Check Readiness' : 'Analyze Fit'}
                                        </button>
                                    ) : null}

                                    {application && application.status !== 'Rejected' ? (
                                        <button
                                            className="btn-ghost"
                                            style={{ color: 'var(--error)', border: '1px solid var(--error)' }}
                                            onClick={() => openWithdrawModal(job)}
                                        >
                                            Withdraw
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-primary"
                                            style={{ background: 'var(--success)', border: 'none' }}
                                            onClick={() => openApplyModal(job)}
                                        >
                                            {application && application.status === 'Rejected' ? 'Reapply' : 'Apply'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                confirmText={modalConfig.confirmText}
                cancelText={modalConfig.cancelText}
            />
        </div >
    );
};

export default Jobs;
