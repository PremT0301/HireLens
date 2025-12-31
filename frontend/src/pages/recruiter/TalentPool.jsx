import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Mail, Phone, Briefcase, Calendar, FileText, MapPin, Building, XCircle, User } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import ScheduleForm from '../../components/forms/ScheduleForm';

import ApplicationService from '../../api/applicationService';
import HireLensLoader from '../../components/ui/HireLensLoader';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const TalentPool = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [activeCandidate, setActiveCandidate] = useState(null); // For Chart Overlay
    const [selectedCandidate, setSelectedCandidate] = useState(null); // For Action Modal
    const [modalView, setModalView] = useState('profile'); // 'profile', 'schedule', 'message'
    const [openMenuId, setOpenMenuId] = useState(null);

    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchTalentPool = async () => {
            try {
                // Import Service inside effect or at top. Assuming imported at top.
                const data = await ApplicationService.getTalentPool();
                setCandidates(data);
            } catch (error) {
                console.error("Failed to load talent pool", error);
                // alert("Failed to load candidates. Please try again."); // Optional: verify backend connectivity
            } finally {
                setLoading(false);
            }
        };
        fetchTalentPool();
    }, []);

    const getData = (candidate) => {
        if (!candidate || !candidate.skills) return [];
        return Object.keys(candidate.skills).map(key => ({
            subject: key,
            A: candidate.skills[key],
            fullMark: 100
        }));
    };

    const handleToggleChart = (e, candidate) => {
        e.stopPropagation();
        if (activeCandidate && activeCandidate.id === candidate.id) {
            setActiveCandidate(null);
        } else {
            // Calculate position based on the row
            const rowRect = e.currentTarget.closest('tr').getBoundingClientRect();
            setActiveCandidate({ ...candidate, y: rowRect.top });
        }
    };

    const handleOpenActionModal = (candidate) => {
        setSelectedCandidate(candidate);
        setModalView('profile');
        setActiveCandidate(null); // Close chart if open
    };

    const handleScheduleSubmit = async (formData) => {
        try {
            await ApplicationService.scheduleInterview(selectedCandidate.id, formData);
            addToast('Interview scheduled successfully', 'success');

            // Update local state to reflect status change
            setCandidates(prev => prev.map(c =>
                c.id === selectedCandidate.id ? { ...c, status: 'Interview Scheduled' } : c
            ));

            // Update selected candidate as well so if they reopen it is updated
            setSelectedCandidate(prev => ({ ...prev, status: 'Interview Scheduled' }));

            handleCloseModal();
        } catch (error) {
            console.error("Failed to schedule", error);
            addToast('Failed to schedule interview', 'error');
        }
    };



    const handleReject = (candidate) => {
        setSelectedCandidate(candidate);
        setModalView('reject-confirmation');
        setOpenMenuId(null);
    };

    const confirmReject = async () => {
        if (!selectedCandidate) return;

        try {
            await ApplicationService.updateStatus(selectedCandidate.id, "Rejected");
            addToast('Candidate status updated to Rejected', 'info');

            // Update local state
            setCandidates(prev => prev.map(c =>
                c.id === selectedCandidate.id ? { ...c, status: 'Rejected' } : c
            ));

            handleCloseModal();
        } catch (error) {
            console.error("Failed to reject candidate", error);
            addToast('Failed to update status', 'error');
        }
    };

    const handleHire = async (candidate) => {
        if (!window.confirm(`Are you sure you want to HIRE ${candidate.name}? This will mark them as hired for this role.`)) return;

        try {
            await ApplicationService.hireCandidate(candidate.id);
            addToast(`Successfully hired ${candidate.name}!`, 'success');

            // Update local state
            setCandidates(prev => prev.map(c =>
                c.id === candidate.id ? { ...c, status: 'Hired' } : c
            ));

            setOpenMenuId(null);
        } catch (error) {
            console.error("Failed to hire candidate", error);
            addToast('Failed to hire candidate. They may be hired elsewhere.', 'error');
        }
    };

    const handleCloseModal = () => {
        setSelectedCandidate(null);
        setModalView('profile');
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '300px' }}>
            <h1 className="title-lg" style={{ marginBottom: '2rem' }}>Talent Pool</h1>

            {loading && <HireLensLoader text="Loading Candidates..." />}

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search candidates by skill, role, or ID..."
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            outline: 'none'
                        }}
                    />
                </div>
                <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)' }}>
                    <Filter size={18} style={{ marginRight: '8px' }} /> Filters
                </button>
            </div>

            {/* Table */}
            <div className="glass-panel" style={{ overflow: 'visible' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '1.5rem', textAlign: 'left', width: '35%' }}>Candidate</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Match Score</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Applied</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map(candidate => {
                            const getBadgeStyle = (status, label) => {
                                if (status === 'Rejected') return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'var(--error)', text: 'Rejected' };
                                if (status === 'Interview Scheduled') return { bg: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', border: 'var(--accent-primary)', text: 'Interview Scheduled' };
                                if (status === 'Interview Accepted') return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'var(--success)', text: 'Interview Accepted' };
                                if (status === 'Hired') return { bg: 'rgba(37, 99, 235, 0.2)', color: '#1e40af', border: '#1e40af', text: 'Hired 🎉' };
                                if (label === 'Poor') return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'var(--error)', text: label }; // Red for Poor

                                if (label === 'Highly Suitable') return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: 'var(--success)', text: label };
                                if (label === 'Suitable') return { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: 'var(--primary)', text: label };
                                return { bg: 'rgba(251, 191, 36, 0.1)', color: 'var(--warning)', border: 'var(--warning)', text: label };
                            };
                            const badgeStyle = getBadgeStyle(candidate.status, candidate.label);

                            return (
                                <tr
                                    key={candidate.id}
                                    style={{
                                        borderBottom: '1px solid var(--glass-border)',
                                        position: 'relative',
                                        background: activeCandidate?.id === candidate.id ? 'var(--bg-hover)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: 'var(--border-color)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '600',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{candidate.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{candidate.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            background: badgeStyle.bg,
                                            color: badgeStyle.color,
                                            border: `1px solid ${badgeStyle.border}`,
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {badgeStyle.text}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontWeight: '700', color: candidate.score > 90 ? 'var(--success)' : 'var(--primary)' }}>{candidate.score}%</span>
                                            <div style={{ width: '80px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ width: `${candidate.score}%`, height: '100%', background: candidate.score > 90 ? 'var(--success)' : 'var(--primary)', borderRadius: '3px' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        {candidate.time || 'Recently'}
                                    </td>
                                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <button
                                                className="btn-ghost"
                                                style={{
                                                    padding: '8px',
                                                    color: activeCandidate?.id === candidate.id ? 'var(--primary)' : 'var(--text-secondary)'
                                                }}
                                                onClick={(e) => handleToggleChart(e, candidate)}
                                                title="View Skills Chart"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            {candidate.status === 'Hired' ? (
                                                <div style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '20px',
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    border: '1px solid var(--success)',
                                                    color: 'var(--success)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <span>🎉</span> Hired
                                                </div>
                                            ) : (
                                                <div style={{ position: 'relative' }}>
                                                    <button
                                                        className="btn-ghost"
                                                        style={{ padding: '8px', color: openMenuId === candidate.id ? 'var(--primary)' : 'var(--text-secondary)' }}
                                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === candidate.id ? null : candidate.id); }}
                                                        title="More Actions"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    {openMenuId === candidate.id && (
                                                        <>
                                                            <div
                                                                style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                                                                onClick={() => setOpenMenuId(null)}
                                                            />
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 'calc(100% + 6px)',
                                                                right: '0',
                                                                marginTop: '0',
                                                                background: 'var(--bg-secondary)',
                                                                border: '1px solid var(--border-color)',
                                                                borderRadius: '16px',
                                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0,0,0,0.05)',
                                                                zIndex: 100,
                                                                minWidth: '220px',
                                                                padding: '8px',
                                                                animation: 'fadeIn 0.2s ease',
                                                                transformOrigin: 'top right',
                                                                textAlign: 'left'
                                                            }}>
                                                                <button
                                                                    style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '12px 16px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: 'var(--text-primary)',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '500',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        borderRadius: '10px',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = 'var(--primary-light)';
                                                                        e.target.style.color = 'var(--text-primary)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'transparent';
                                                                        e.target.style.color = 'var(--text-primary)';
                                                                    }}
                                                                    onClick={() => { setOpenMenuId(null); navigate(`/recruiter/candidate/${candidate.id}`); }}
                                                                >
                                                                    <User size={18} /> View Profile
                                                                </button>
                                                                <button
                                                                    style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '12px 16px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: 'var(--text-primary)',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '500',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        borderRadius: '10px',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = 'var(--primary-light)';
                                                                        e.target.style.color = 'var(--text-primary)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'transparent';
                                                                        e.target.style.color = 'var(--text-primary)';
                                                                    }}
                                                                    onClick={() => { setOpenMenuId(null); navigate(`/recruiter/schedule/${candidate.id}`); }}
                                                                >
                                                                    <Calendar size={18} /> Schedule Interview
                                                                </button>
                                                                <button
                                                                    style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '12px 16px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: 'var(--text-primary)',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '500',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        borderRadius: '10px',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = 'var(--primary-light)';
                                                                        e.target.style.color = 'var(--primary)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'transparent';
                                                                        e.target.style.color = 'var(--text-primary)';
                                                                    }}
                                                                    onClick={() => { setOpenMenuId(null); navigate(`/recruiter/contact/${candidate.id}`); }}
                                                                >
                                                                    <Mail size={18} /> Contact Candidate
                                                                </button>
                                                                {candidate.status === 'Interview Accepted' && (
                                                                    <button
                                                                        style={{
                                                                            width: '100%',
                                                                            textAlign: 'left',
                                                                            padding: '12px 16px',
                                                                            background: 'transparent',
                                                                            border: 'none',
                                                                            color: 'var(--success)',
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.9rem',
                                                                            fontWeight: '700',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '12px',
                                                                            borderRadius: '10px',
                                                                            transition: 'all 0.2s',
                                                                            marginTop: '4px',
                                                                            borderTop: '1px solid var(--border-color)'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.background = 'transparent';
                                                                        }}
                                                                        onClick={() => handleHire(candidate)}
                                                                    >
                                                                        <Briefcase size={18} /> Hire Candidate
                                                                    </button>
                                                                )}
                                                                <button
                                                                    style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '12px 16px',
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: 'var(--error)',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem',
                                                                        fontWeight: '500',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '12px',
                                                                        borderRadius: '10px',
                                                                        transition: 'all 0.2s',
                                                                        marginTop: '4px',
                                                                        borderTop: '1px solid var(--border-color)'
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        e.target.style.background = 'transparent';
                                                                    }}
                                                                    onClick={() => handleReject(candidate)}
                                                                >
                                                                    <XCircle size={18} /> Reject Candidate
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Radar Chart Overlay */}
            <AnimatePresence>
                {activeCandidate && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            position: 'fixed',
                            top: Math.min(activeCandidate.y - 100, window.innerHeight - 450),
                            right: '5%',
                            width: '400px',
                            height: '420px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            boxShadow: 'var(--card-shadow)',
                            zIndex: 100,
                            padding: '1.5rem',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ margin: 0 }}>Skill Profile: {activeCandidate.name}</h3>
                            <button
                                onClick={() => setActiveCandidate(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ width: '100%', height: '320px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="60%" data={getData(activeCandidate)}>
                                    <PolarGrid stroke="var(--glass-border)" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Skills"
                                        dataKey="A"
                                        stroke="var(--primary)"
                                        strokeWidth={3}
                                        fill="var(--primary)"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Modal */}
            <Modal
                isOpen={!!selectedCandidate}
                onClose={handleCloseModal}
                size={modalView === 'reject-confirmation' ? 'sm' : 'md'}
                hideHeader={modalView === 'reject-confirmation'}
                title={
                    modalView === 'profile' ? "Candidate Profile" :
                        modalView === 'schedule' ? "Schedule Interview" :
                            modalView === 'reject-confirmation' ? "Confirm Action" :
                                "Send Message"
                }
            >
                {selectedCandidate && (
                    <div>
                        {modalView === 'reject-confirmation' && (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    style={{
                                        width: '88px',
                                        height: '88px',
                                        background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1.5rem auto',
                                        boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.3)',
                                        border: '4px solid white'
                                    }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        <XCircle size={42} color="#dc2626" strokeWidth={2} />
                                    </div>
                                </motion.div>

                                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', background: 'linear-gradient(to right, #ef4444, #b91c1c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    Reject Candidate?
                                </h3>

                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.05rem' }}>
                                    You are about to reject <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{selectedCandidate.name}</span>.
                                    <br />
                                    <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>This action cannot be undone.</span>
                                </p>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    <button
                                        onClick={handleCloseModal}
                                        className="btn-ghost"
                                        style={{
                                            border: 'none',
                                            background: 'var(--bg-secondary)',
                                            width: '130px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            color: 'var(--text-secondary)'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmReject}
                                        style={{
                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0 24px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            minWidth: '160px',
                                            boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.4)',
                                            transition: 'all 0.2s',
                                        }}
                                        className="hover-lift"
                                    >
                                        <XCircle size={20} /> Conform Reject
                                    </button>
                                </div>
                            </div>
                        )}
                        {modalView === 'profile' && (
                            /* Profile view moved to dedicated page */
                            null
                        )}

                        {modalView === 'schedule' && (
                            <ScheduleForm
                                onSubmit={handleScheduleSubmit}
                                onCancel={() => setModalView('profile')}
                            />
                        )}


                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TalentPool;
