import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
    TrendingUp, FileText, CheckCircle, UploadCloud,
    User as UserIcon, MapPin, Briefcase, Trash2,
    ChevronRight, Sparkles, Brain, Target, Activity,
    AlertCircle, Info, ArrowUpRight, Plus, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip, AreaChart, Area
} from 'recharts';

import DashboardService from '../../api/dashboardService';
import ProfileService from '../../api/profileService';
import ResumeService from '../../api/resumeService';
import ApplicationService from '../../api/applicationService';
import ThreeDTiltCard from '../../components/ui/ThreeDTiltCard';
import HireLensLoader from '../../components/ui/HireLensLoader';
import Skeleton, { SkeletonTable } from '../../components/ui/Skeleton';
import NewsSection from '../../components/NewsSection';
import { NoApplicationsState } from '../../components/ui/EmptyState';

const ApplicantDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [profile, setProfile] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [summary, userProfile, userApplications] = await Promise.all([
                DashboardService.getApplicantSummary(),
                ProfileService.getMyProfile(),
                ApplicationService.getMyApplications()
            ]);
            setData(summary);
            setProfile(userProfile);
            setApplications(userApplications || []);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setAnalyzing(true);
        try {
            await ResumeService.uploadResume(file);
            await loadDashboardData();
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setAnalyzing(false);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        multiple: false,
        noClick: true // We will use a button for explicit click
    });

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Skeleton variant="title" width="400px" height="40px" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="panel" height="120px" />)}
                        </div>
                        <Skeleton variant="panel" height="400px" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <Skeleton variant="panel" height="300px" />
                        <Skeleton variant="panel" height="400px" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-wrapper">
            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>

                {/* 1. WELCOME HEADER */}
                <div className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Updated {data?.resumeHealth?.lastAnalyzed || 'Recently'}</span>
                            </div>
                            <h1 className="title-xl" style={{ margin: 0, letterSpacing: '-0.02em' }}>
                                Master your career, {profile?.fullName?.split(' ')[0] || 'Candidate'}
                            </h1>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', gap: '1rem' }}>
                            <button onClick={open} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                                <UploadCloud size={18} /> Update Intelligence
                            </button>
                            <Link to="/applicant/jobs" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                                Browse All Jobs <ArrowUpRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. DYNAMIC LAYOUT GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* QUICK STATS ROW */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <StatCard
                                label="Profile Completion"
                                value={`${data?.quickStats?.profileCompletion || 0}%`}
                                icon={<UserIcon size={20} />}
                                color="#8b5cf6"
                                trend="+5% this week"
                            />
                            <StatCard
                                label="ATS Health Score"
                                value={`${data?.quickStats?.atsScore || 0}/100`}
                                icon={<Brain size={20} />}
                                color="#3b82f6"
                                trend="Top 15% in cohort"
                            />
                            <StatCard
                                label="Applications Sent"
                                value={data?.quickStats?.applicationsSent || 0}
                                icon={<FileText size={20} />}
                                color="#10b981"
                                trend={`${applications.filter(a => a.status === 'Interview Scheduled').length} active tracking`}
                            />
                            <StatCard
                                label="Avg. Role Match"
                                value={`${data?.quickStats?.roleMatchPercentage || 0}%`}
                                icon={<Target size={20} />}
                                color="#f59e0b"
                                trend="AI Optimized"
                            />
                        </div>

                        {/* RECOMMENDED JOBS SECTION */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Recommended For You</h3>
                                <Link to="/applicant/jobs" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>View Match Engine →</Link>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
                                {data?.recommendedJobs?.length > 0 ? (
                                    data.recommendedJobs.map((job, idx) => (
                                        <JobMatchCard key={idx} job={job} />
                                    ))
                                ) : (
                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem 2rem' }}>
                                        <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                                            No matches yet. Upload your resume to start matching your skills with jobs.
                                        </div>
                                        <button onClick={open} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            <UploadCloud size={18} /> Upload Resume Now
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RECENT APPLICATIONS */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Clock size={20} color="var(--primary)" /> Recent Applications
                                </h3>
                                <Link to="/applicant/applications" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>View All</Link>
                            </div>

                            {applications.length > 0 ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <th style={{ padding: '12px 8px' }}>Target Job</th>
                                                <th style={{ padding: '12px 8px' }}>Company</th>
                                                <th style={{ padding: '12px 8px' }}>Applied</th>
                                                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.slice(0, 5).map((app, idx) => (
                                                <tr key={idx} style={{ borderBottom: idx < 4 ? '1px solid rgba(255,255,255,0.03)' : 'none', fontSize: '0.9rem' }}>
                                                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>{app.jobTitle}</td>
                                                    <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{app.companyName}</td>
                                                    <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                                                        <span className={`status-pill ${app.status.toLowerCase().replace(' ', '-')}`}>
                                                            {app.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ padding: '2rem 0' }}>
                                    <NoApplicationsState onAction={() => navigate('/applicant/jobs')} />
                                </div>
                            )}
                        </div>

                        {/* WEEKLY PROGRESS WIDGET */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Weekly Profile Strength</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0' }}>Activity tracked across indexable channels</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div className="chart-legend" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span> Strength
                                    </div>
                                </div>
                            </div>
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data?.weeklyProgress}>
                                        <defs>
                                            <linearGradient id="colorStrength" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <RechartsTooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(20, 20, 25, 0.9)',
                                                border: '1px solid var(--glass-border)',
                                                borderRadius: '12px',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                            itemStyle={{ color: 'white' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="strength"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorStrength)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN (SIDEBAR) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* RESUME HEALTH BREAKDOWN */}
                        <div
                            {...getRootProps()}
                            className={`glass-panel upload-zone ${isDragActive ? 'active' : ''}`}
                            style={{
                                padding: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'default', // Don't show hand cursor on whole panel
                                transition: 'all 0.3s ease',
                                border: isDragActive ? '2px dashed var(--primary)' : '1px solid var(--border-color)'
                            }}
                        >
                            <input {...getInputProps()} />
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', opacity: 0.1, filter: 'blur(30px)' }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <AlertCircle size={18} color="var(--primary)" /> Resume Insights
                                </h4>
                                <button onClick={open} className="btn-icon-only" title="Upload New Resume" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', padding: '6px', borderRadius: '8px' }}>
                                    <UploadCloud size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                                <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                    <svg width="120" height="120" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                                        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--primary)" strokeWidth="8"
                                            strokeDasharray={`${((data?.resumeHealth?.atsScore || 0) / 100) * 339} 339`}
                                            strokeLinecap="round"
                                            transform="rotate(-90 60 60)"
                                            style={{ transition: 'stroke-dasharray 1s ease-out' }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{data?.resumeHealth?.atsScore || 0}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>ATS SCORE</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Object.entries(data?.resumeHealth?.sectionCompleteness || {
                                    "Contact Info": false,
                                    "Skills": false,
                                    "Experience": false,
                                    "Education": false
                                }).map(([section, complete]) => (
                                    <div key={section} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>{section} Check</span>
                                        {complete ? <CheckCircle size={16} color="var(--success)" /> : <AlertCircle size={16} color="var(--warning)" />}
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                <h5 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Improvement Tip:</h5>
                                <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                    "{data?.resumeHealth?.improvementTips?.[0] || 'Upload resume for AI analysis.'}"
                                </p>
                            </div>

                            <button onClick={open} className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <UploadCloud size={16} /> Refresh Resume Data
                            </button>

                            <div className="upload-overlay" style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(20, 20, 25, 0.9)',
                                display: isDragActive ? 'flex' : 'none',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10,
                                borderRadius: '16px'
                            }}>
                                <UploadCloud size={40} color="var(--primary)" />
                                <span style={{ fontWeight: 600, marginTop: '8px' }}>Drop to Update Intelligence</span>
                            </div>
                        </div>

                        {/* SKILL GAP INSIGHTS */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Brain size={18} color="var(--secondary)" /> Skill Matrix
                            </h4>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Detected Core Skills</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {data?.skillGapInsights?.detectedSkills?.length > 0 ? (
                                        data.skillGapInsights.detectedSkills.slice(0, 6).map(skill => (
                                            <span key={skill} className="skill-chip">{skill}</span>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>None detected yet.</span>
                                    )}
                                    {data?.skillGapInsights?.detectedSkills?.length > 6 && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', alignSelf: 'center', paddingLeft: '4px' }}>+{data.skillGapInsights.detectedSkills.length - 6} more</span>}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.5px' }}>Top Gaps for Current Roles</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {data?.skillGapInsights?.missingSkills?.length > 0 ? (
                                        data.skillGapInsights.missingSkills.map(skill => (
                                            <span key={skill} className="skill-chip gap">{skill}</span>
                                        ))
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No gaps identified.</span>
                                    )}
                                </div>
                            </div>

                            <button className="btn-secondary" style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}>
                                {data?.skillGapInsights?.improvementCta || 'Learn with AI Copilot'}
                            </button>
                        </div>

                        {/* ACTIVITY TIMELINE */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h4 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Activity size={18} color="var(--primary)" /> Activity
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {data?.activityTimeline?.length > 0 ? (
                                    data.activityTimeline.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                                            {idx < data.activityTimeline.length - 1 && <div style={{ position: 'absolute', left: '10px', top: '22px', bottom: '-15px', width: '1px', background: 'var(--border-color)' }}></div>}
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.event}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(item.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No recent activity.</div>
                                )}
                            </div>
                        </div>

                    </div>

                </div>

                {/* 3. FULL WIDTH NEWS & INSIGHTS */}
                <div style={{ marginTop: '2rem' }}>
                    <NewsSection query="technology career trends AI" title="Industry Intelligence" />
                </div>

                {/* MODAL - ANALYZING LOADER */}
                <AnimatePresence>
                    {analyzing && (
                        <HireLensLoader text="Updating Profile Intelligence..." subtext="AI is recalibrating your market value and matching scores." />
                    )}
                </AnimatePresence>

            </div>

            <style>{`
                .btn-ai-action {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(10px);
                    position: relative;
                    overflow: hidden;
                }
                .btn-ai-action:hover {
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
                    border-color: rgba(139, 92, 246, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.15);
                }
                .btn-ai-action:active {
                    transform: translateY(0);
                }
                .btn-ai-action::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .btn-ai-action:hover::after {
                    opacity: 1;
                }

                .badge-ai {
                    background: rgba(139, 92, 246, 0.1);
                    color: #8b5cf6;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid rgba(139, 92, 246, 0.2);
                }
Status.skill-chip {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: var(--text-primary);
                }
                .skill-chip.gap {
                    background: rgba(245, 158, 11, 0.05);
                    border-color: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }
                .status-pill {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--border-color);
                }
                .status-pill.applied { color: var(--primary); border-color: rgba(59, 130, 246, 0.3); background: rgba(59, 130, 246, 0.05); }
                .status-pill.interview-scheduled, .status-pill.interview-accepted { color: var(--success); border-color: rgba(76, 175, 80, 0.3); background: rgba(76, 175, 80, 0.05); }
                .status-pill.rejected { color: var(--error); border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); }

                .dashboard-wrapper {
                    background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.03), transparent 50%),
                                radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.03), transparent 50%);
                }
                .upload-zone:hover {
                    box-shadow: 0 0 20px rgba(139, 92, 246, 0.1);
                    border-color: var(--primary);
                }
            `}</style>
        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ label, value, icon, color, trend }) => (
    <ThreeDTiltCard>
        <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: `${color}15`, color: color }}>
                    {icon}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>{trend}</div>
            </div>
            <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{value}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</div>
            </div>
        </div>
    </ThreeDTiltCard>
);

const JobMatchCard = ({ job }) => (
    <div className="job-match-card" style={{
        padding: '1.25rem',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-color)',
        transition: 'all 0.3s ease'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700 }}>{job.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <span>{job.companyName}</span>
                    <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-secondary)' }}></span>
                    <span>{job.location}</span>
                </div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{job.matchPercentage}%</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Match</div>
            </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
            <Link to={`/applicant/jobs/${job.jobId}`} className="btn-ghost" style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}>View Details</Link>
            <button className="btn-nav-primary" style={{ flex: 0.5, padding: '8px', fontSize: '0.85rem', borderRadius: '8px' }}>Apply</button>
        </div>
    </div>
);

export default ApplicantDashboard;
