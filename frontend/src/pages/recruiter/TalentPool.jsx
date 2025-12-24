import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../../components/ui/Modal';
import ScheduleForm from '../../components/forms/ScheduleForm';
import MessageForm from '../../components/forms/MessageForm';

const TalentPool = () => {
    const [activeCandidate, setActiveCandidate] = useState(null); // For Chart Overlay
    const [selectedCandidate, setSelectedCandidate] = useState(null); // For Action Modal
    const [modalView, setModalView] = useState('profile'); // 'profile', 'schedule', 'message'

    const candidates = [
        {
            id: 1, name: 'Alex Johnson', role: 'Senior Python Developer', score: 94,
            skills: { Python: 90, AWS: 85, React: 60, SQL: 80, Docker: 75 },
            status: 'Pending Review'
        },
        {
            id: 2, name: 'Sarah Chen', role: 'Data Scientist', score: 88,
            skills: { Python: 95, AWS: 70, React: 40, SQL: 90, Docker: 60 },
            status: 'Interviewing'
        },
        {
            id: 3, name: 'Mike Smith', role: 'Full Stack Engineer', score: 82,
            skills: { Python: 70, AWS: 60, React: 90, SQL: 75, Docker: 80 },
            status: 'Rejected'
        },
    ];

    const getData = (candidate) => {
        if (!candidate) return [];
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

    const handleCloseModal = () => {
        setSelectedCandidate(null);
        setModalView('profile');
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '300px' }}>
            <h1 className="title-lg" style={{ marginBottom: '2rem' }}>Talent Pool</h1>

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
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Candidate</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Role Match</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>BERT Score</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {candidates.map(candidate => (
                            <tr
                                key={candidate.id}
                                style={{
                                    borderBottom: '1px solid var(--glass-border)',
                                    position: 'relative',
                                    background: activeCandidate?.id === candidate.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                                }}
                            >
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ fontWeight: '600' }}>{candidate.name}</div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{candidate.role}</div>
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                    <div style={{ width: '100px', height: '6px', background: 'var(--glass-border)', borderRadius: '3px' }}>
                                        <div style={{ width: `${candidate.score}%`, height: '100%', background: candidate.score > 90 ? 'var(--success)' : 'var(--primary)', borderRadius: '3px' }}></div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', fontWeight: 'bold', color: candidate.score > 90 ? 'var(--success)' : 'var(--primary)' }}>
                                    {candidate.score}%
                                </td>
                                <td style={{ padding: '1.5rem', display: 'flex', gap: '10px' }}>
                                    <button
                                        className="btn-ghost"
                                        style={{
                                            padding: '8px',
                                            color: activeCandidate?.id === candidate.id ? 'var(--primary)' : 'inherit'
                                        }}
                                        onClick={(e) => handleToggleChart(e, candidate)}
                                        title="View Skills Chart"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className="btn-ghost"
                                        style={{ padding: '8px' }}
                                        onClick={() => handleOpenActionModal(candidate)}
                                        title="View Actions"
                                    >
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
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
                            top: Math.min(activeCandidate.y - 100, window.innerHeight - 350),
                            right: '5%',
                            width: '320px',
                            height: '350px',
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
                        <div style={{ width: '100%', height: '250px' }}>
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
                                        <Mail size={18} className="text-gray-400" />
                                        <span>{selectedCandidate.name.toLowerCase().replace(' ', '.')}@example.com</span>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Phone size={18} className="text-gray-400" />
                                        <span>+1 (555) 000-0000</span>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Briefcase size={18} className="text-gray-400" />
                                        <span>5 Years Experience</span>
                                    </div>
                                    <div className="glass-panel" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Calendar size={18} className="text-gray-400" />
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
        </div>
    );
};

export default TalentPool;
