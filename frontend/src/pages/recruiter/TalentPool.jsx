import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Mail, Phone, Briefcase, Calendar, FileText, MapPin, Building, XCircle, User } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { NoCandidatesState, NoSearchResultsState } from '../../components/ui/EmptyState';

import ApplicationService from '../../api/applicationService';
import { useNavigate } from 'react-router-dom';
import HireLensLoader from '../../components/ui/HireLensLoader';
import PlanGate from '../../components/ui/PlanGate';
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

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        minScore: '',
        maxScore: '',
        startDate: '',
        endDate: '',
        jobRole: ''
    });

    // Debounce Search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    React.useEffect(() => {
        const fetchTalentPool = async () => {
            try {
                setLoading(true);
                // Clean filters to remove empty strings
                const cleanFilters = Object.fromEntries(
                    Object.entries({ ...filters, searchTerm: debouncedSearchTerm })
                        .filter(([_, v]) => v !== '' && v !== null)
                );

                const data = await ApplicationService.getTalentPool(cleanFilters);
                setCandidates(data);
            } catch (error) {
                console.error("Failed to load talent pool", error);
                addToast("Failed to load candidates", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchTalentPool();
    }, [debouncedSearchTerm, filters, addToast]); // Trigger on filter/search change

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



    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isHireModalOpen, setIsHireModalOpen] = useState(false);

    const handleReject = (candidate) => {
        setSelectedCandidate(candidate);
        setIsRejectModalOpen(true);
        setOpenMenuId(null);
    };

    const confirmReject = async () => {
        if (!selectedCandidate) return;

        try {
            setLoading(true);
            await ApplicationService.updateStatus(selectedCandidate.id, "Rejected");
            addToast('Candidate status updated to Rejected', 'info');

            // Update local state
            setCandidates(prev => prev.map(c =>
                c.id === selectedCandidate.id ? { ...c, status: 'Rejected' } : c
            ));

            setIsRejectModalOpen(false);
            setSelectedCandidate(null);
        } catch (error) {
            console.error("Failed to reject candidate", error);
            addToast('Failed to update status', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleHire = (candidate) => {
        setSelectedCandidate(candidate);
        setIsHireModalOpen(true);
        setOpenMenuId(null);
    };

    const confirmHire = async () => {
        if (!selectedCandidate) return;

        try {
            setLoading(true);
            await ApplicationService.hireCandidate(selectedCandidate.id);
            addToast(`Successfully hired ${selectedCandidate.name}!`, 'success');

            // Update local state
            setCandidates(prev => prev.map(c =>
                c.id === selectedCandidate.id ? { ...c, status: 'Hired' } : c
            ));

            setIsHireModalOpen(false);
            setSelectedCandidate(null);
        } catch (error) {
            console.error("Failed to hire candidate", error);
            addToast('Failed to hire candidate. They may be hired elsewhere.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedCandidate(null);
        setModalView('profile');
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '300px' }}>
            <h1 className="title-lg" style={{ marginBottom: '2rem' }}>Talent Pool</h1>

            <div className="glass-panel" style={{ padding: '0', marginBottom: '2rem', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: showFilters ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search candidates by name, skill, role..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 16px 10px 44px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                fontSize: '0.95rem',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            className={`btn-ghost ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                            style={{
                                border: '1px solid var(--border-color)',
                                background: showFilters ? 'var(--primary-light)' : 'transparent',
                                color: showFilters ? 'var(--primary)' : 'var(--text-secondary)',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontWeight: 500
                            }}
                        >
                            <Filter size={16} style={{ marginRight: '8px' }} /> Filters
                        </button>

                        {(Object.values(filters).some(x => x) || searchTerm) && (
                            <button
                                className="btn-ghost"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilters({ status: '', minScore: '', maxScore: '', startDate: '', endDate: '', jobRole: '' });
                                }}
                                style={{
                                    color: 'var(--error)',
                                    fontSize: '0.9rem',
                                    padding: '8px 12px',
                                    borderRadius: '8px'
                                }}
                            >
                                <XCircle size={16} style={{ marginRight: '4px' }} /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Expanded Filter Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden', background: 'var(--bg-secondary-light)' }}
                        >
                            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                {/* Status Filter */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status</label>
                                    <div className="select-wrapper" style={{ position: 'relative' }}>
                                        <select
                                            className="input-field"
                                            style={{ width: '100%', appearance: 'none', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.9rem' }}
                                            value={filters.status}
                                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        >
                                            <option value="">All Statuses</option>
                                            <option value="Applied">Applied</option>
                                            <option value="Interview Scheduled">Interview Scheduled</option>
                                            <option value="Interview Accepted">Interview Accepted</option>
                                            <option value="Hired">Hired</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Score Range */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Match Score %</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="input-field"
                                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem' }}
                                            value={filters.minScore}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value }))}
                                        />
                                        <span style={{ color: 'var(--text-disabled)', fontWeight: 500 }}>—</span>
                                        <input
                                            type="number"
                                            placeholder="100"
                                            className="input-field"
                                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem' }}
                                            value={filters.maxScore}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxScore: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Applied Date</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="date"
                                            className="input-field"
                                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem' }}
                                            value={filters.startDate}
                                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                            placeholder="Start"
                                        />
                                        <span style={{ color: 'var(--text-disabled)', fontWeight: 500 }}>—</span>
                                        <input
                                            type="date"
                                            className="input-field"
                                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '0.9rem' }}
                                            value={filters.endDate}
                                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                            placeholder="End"
                                        />
                                    </div>
                                </div>

                                {/* Job Role */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Job Role</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            placeholder="e.g. Developer"
                                            className="input-field"
                                            style={{ width: '100%', background: 'white', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px 10px 36px', fontSize: '0.9rem' }}
                                            value={filters.jobRole}
                                            onChange={(e) => setFilters(prev => ({ ...prev, jobRole: e.target.value }))}
                                        />
                                        <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Table */}
            {loading ? (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <SkeletonTable rows={8} columns={5} />
                </div>
            ) : candidates.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    {(Object.values(filters).some(x => x) || searchTerm) ? (
                        <NoSearchResultsState searchTerm={searchTerm} />
                    ) : (
                        <NoCandidatesState onAction={() => navigate('/recruiter/create-job')} />
                    )}
                </div>
            ) : (
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
                                                                    <PlanGate requiredPlan="PRO" featureName="Detailed Candidate Actions">
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
                                                                    </PlanGate>
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
            )}

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
                        {/* Skill Distribution - Gated for PRO+ */}
                        <PlanGate requiredPlan="PRO" featureName="Skill Analytics Radar">
                            <div style={{ height: '350px', marginBottom: '1.5rem', width: '100%', minWidth: '0' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getData(activeCandidate)}>
                                        <PolarGrid stroke="var(--glass-border)" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Skills"
                                            dataKey="A"
                                            stroke="var(--primary)"
                                            strokeWidth={3}
                                            fill="var(--primary)"
                                            fillOpacity={0.5}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </PlanGate>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rejection Modal */}
            <ConfirmModal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                onConfirm={confirmReject}
                type="danger"
                title="Reject Candidate?"
                message={`You are about to reject ${selectedCandidate?.name}. This action cannot be undone.`}
                confirmText="Reject Candidate"
                cancelText="Cancel"
                loading={loading}
            />

            {/* Hiring Modal */}
            <ConfirmModal
                isOpen={isHireModalOpen}
                onClose={() => setIsHireModalOpen(false)}
                onConfirm={confirmHire}
                type="success"
                title="Hire Candidate?"
                message={`Are you sure you want to HIRE ${selectedCandidate?.name}? This will mark them as hired for this role.`}
                confirmText="Confirm Hire"
                cancelText="Cancel"
                loading={loading}
            />

            {/* Action Modal (Profile only now) */}
            <Modal
                isOpen={!!selectedCandidate && !isRejectModalOpen && !isHireModalOpen}
                onClose={handleCloseModal}
                size="md"
                title="Candidate Profile"
            >
                {selectedCandidate && (
                    <div>
                        {modalView === 'profile' && (
                            /* Profile view moved to dedicated page */
                            null
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TalentPool;
