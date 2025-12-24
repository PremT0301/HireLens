import React, { useState } from 'react';
import { Calendar, Clock, Video, Phone, AlignLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ScheduleForm = ({ onSubmit, onCancel }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        type: 'video',
        duration: '30',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            addToast('Interview scheduled successfully', 'success');
            onSubmit(formData);
        }, 800);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={18} className="text-gray-400" />
                        <input
                            type="date"
                            required
                            style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Time</label>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={18} className="text-gray-400" />
                        <input
                            type="time"
                            required
                            style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Type</label>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {formData.type === 'video' ? <Video size={18} /> : <Phone size={18} />}
                        <select
                            style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="video" style={{ color: 'black' }}>Video Call</option>
                            <option value="phone" style={{ color: 'black' }}>Phone Call</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Duration</label>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={18} className="text-gray-400" />
                        <select
                            style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none' }}
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        >
                            <option value="15" style={{ color: 'black' }}>15 min</option>
                            <option value="30" style={{ color: 'black' }}>30 min</option>
                            <option value="45" style={{ color: 'black' }}>45 min</option>
                            <option value="60" style={{ color: 'black' }}>1 hour</option>
                        </select>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Notes (Optional)</label>
                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '10px' }}>
                    <AlignLeft size={18} className="text-gray-400" style={{ marginTop: '4px' }} />
                    <textarea
                        rows="3"
                        style={{ background: 'transparent', border: 'none', color: 'inherit', width: '100%', outline: 'none', resize: 'none' }}
                        placeholder="Add any specific topics to cover..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn-primary">Schedule Interview</button>
            </div>
        </form>
    );
};

export default ScheduleForm;
