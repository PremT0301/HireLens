import React, { useState, useEffect } from 'react';
import { Users, FileText, TrendingUp, Clock, MoreVertical, Briefcase, Mail, Phone, Calendar, Building } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../../components/ui/Modal';
import { motion } from 'framer-motion';
import ScheduleForm from '../../components/forms/ScheduleForm';
import MessageForm from '../../components/forms/MessageForm';
import JobService from '../../api/jobService';
import NewsSection from '../../components/NewsSection';
import AuthService from '../../api/authService';
import ProfileService from '../../api/profileService';
import { useToast } from '../../context/ToastContext';

const RecruiterDashboard = () => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [modalView, setModalView] = useState('profile'); // 'profile', 'schedule', 'message'

    // Profile State
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [recruiterProfile, setRecruiterProfile] = useState({
        companyName: '',
        companyLogo: '',
        designation: ''
    });
    const { success, error: toastError } = useToast();

    // Real Data State
    const [activeJobCount, setActiveJobCount] = useState(0);
    const [recruiterName, setRecruiterName] = useState('Recruiter');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const user = AuthService.getCurrentUser();
                if (user && user.fullName) {
                    setRecruiterName(user.fullName);
                }

                // Fetch extended profile
                try {
                    const profile = await ProfileService.getRecruiterProfile();
                    if (profile) {
                        setRecruiterProfile({
                            companyName: profile.companyName || '',
                            companyLogo: profile.companyLogo || '',
                            designation: profile.designation || ''
                        });
                        // Also update name if returned from profile as source of truth
                        if (profile.fullName) setRecruiterName(profile.fullName);
                    }
                } catch (err) {
                    console.log("No recruiter profile found yet or error", err);
                }

                const jobs = await JobService.getAllJobs();
                setActiveJobCount(jobs.length);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            }
        };

        fetchDashboardData();
    }, []);

    const handleSaveProfile = async (formData) => {
        setLoading(true);
        try {
            await ProfileService.updateRecruiterProfile(formData);
            setRecruiterProfile(formData);
            success('Profile updated successfully');
            setShowEditProfile(false);
        } catch (error) {
            toastError('Failed to update profile');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedCandidate(null);
        setModalView('profile'); // Reset view on close
    };

    const data = [
        { name: 'Mon', applicants: 40, hired: 24 },
        { name: 'Tue', applicants: 30, hired: 13 },
        { name: 'Wed', applicants: 20, hired: 58 },
        { name: 'Thu', applicants: 27, hired: 39 },
        { name: 'Fri', applicants: 18, hired: 48 },
        { name: 'Sat', applicants: 23, hired: 38 },
        { name: 'Sun', applicants: 34, hired: 43 },
    ];

    const recentActivity = [
        { id: 1, role: 'Senior Developer', name: 'Alex Johnson', time: '2h ago', status: 'Pending Review' },
        { id: 2, role: 'UX Designer', name: 'Sarah Wilson', time: '4h ago', status: 'Interviewing' },
        { id: 3, role: 'Product Manager', name: 'Mike Brown', time: '5h ago', status: 'Rejected' },
    ];

    return (
        <div className="page-transition">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Welcome back, {recruiterName}
                        {recruiterProfile.companyLogo && (
                            <img src={recruiterProfile.companyLogo.startsWith('/') ? `http://localhost:5033${recruiterProfile.companyLogo}` : recruiterProfile.companyLogo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        )}
                    </h1>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {recruiterProfile.designation && <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{recruiterProfile.designation}</span>}
                        {recruiterProfile.designation && recruiterProfile.companyName && <span>at</span>}
                        {recruiterProfile.companyName && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Building size={14} /> {recruiterProfile.companyName}
                            </span>
                        )}
                        {(!recruiterProfile.designation && !recruiterProfile.companyName) && <span>Track your hiring pipeline and market insights</span>}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel hover-lift" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-secondary)', color: 'var(--accent-primary)' }}><Users size={20} /></div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>1,248</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Candidates</div>
                </div>

                <div className="glass-panel hover-lift" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-secondary)', color: 'var(--accent-secondary)' }}><FileText size={20} /></div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{activeJobCount}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Active Jobs</div>
                </div>

                <div className="glass-panel hover-lift" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-secondary)', color: '#34d399' }}><TrendingUp size={20} /></div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>64%</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Placement Rate</div>
                </div>

                <div className="glass-panel hover-lift" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--bg-secondary)', color: '#fbbf24' }}><Clock size={20} /></div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>14d</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Time to Fill</div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Application Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                            <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Area type="monotone" dataKey="applicants" stroke="#8884d8" fillOpacity={1} fill="url(#colorApplicants)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentActivity.map(activity => (
                            <motion.div
                                key={activity.id}
                                whileHover={{ scale: 1.02, backgroundColor: 'var(--bg-secondary)' }}
                                style={{
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setSelectedCandidate(activity)}
                            >
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: 'bold'
                                    }}>
                                        {activity.name[0]}
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{activity.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            Applied for <span style={{ color: 'var(--primary)' }}>{activity.role}</span> • {activity.time}
                                        </p>
                                    </div>
                                </div>
                                <button className="btn-ghost" style={{ fontSize: '0.8rem' }}>Review</button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Candidate Modal */}
            <Modal
                isOpen={!!selectedCandidate}
                onClose={handleCloseModal}
                title={modalView === 'profile' ? "Candidate Profile" : modalView === 'schedule' ? "Schedule Interview" : "Send Message"}
            >
                {selectedCandidate && (
                    <div>
                        {modalView === 'profile' && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2rem', color: 'white', fontWeight: 'bold'
                                    }}>
                                        {selectedCandidate.name[0]}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{selectedCandidate.name}</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{selectedCandidate.role}</p>
                                    </div>
                                    <span style={{
                                        marginLeft: 'auto',
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        background: 'var(--primary-light)',
                                        color: 'var(--primary)',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        {selectedCandidate.status}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Mail size={18} style={{ color: 'var(--text-secondary)' }} />
                                        <span>{selectedCandidate.name.toLowerCase().replace(' ', '.')}@example.com</span>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Phone size={18} style={{ color: 'var(--text-secondary)' }} />
                                        <span>+1 (555) 000-0000</span>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Briefcase size={18} style={{ color: 'var(--text-secondary)' }} />
                                        <span>5 Years Experience</span>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
                                        <span>Available Immediately</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button className="btn-ghost" onClick={() => setModalView('message')}>Message Candidate</button>
                                    <button className="btn-primary" onClick={() => setModalView('schedule')}>Schedule Interview</button>
                                </div>
                            </>
                        )}

                        {modalView === 'schedule' && (
                            <ScheduleForm
                                onSubmit={() => handleCloseModal()}
                                onCancel={() => setModalView('profile')}
                            />
                        )}

                        {modalView === 'message' && (
                            <MessageForm
                                candidateName={selectedCandidate.name}
                                onSubmit={() => handleCloseModal()}
                                onCancel={() => setModalView('profile')}
                            />
                        )}
                    </div>
                )}
            </Modal>

            {/* Market Insights News */}
            <NewsSection query="recruitment market hiring trends" title="Market Insights & Hiring Trends" />
        </div>
    );
};

export default RecruiterDashboard;
