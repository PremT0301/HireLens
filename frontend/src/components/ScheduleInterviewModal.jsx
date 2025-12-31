import React, { useState } from 'react';
import Modal from '../components/ui/Modal';

const ScheduleInterviewModal = ({ candidate, onClose, onSubmit }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [type, setType] = useState('video'); // video, phone, onsite
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            candidateId: candidate?.id,
            date,
            time,
            type,
            notes
        });
    };

    if (!candidate) return null;

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Schedule Interview with ${candidate.name}`}
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date</label>
                    <input
                        type="date"
                        className="input-field"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Time</label>
                    <input
                        type="time"
                        className="input-field"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Interview Type</label>
                    <select
                        className="input-field"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        style={{ width: '100%' }}
                    >
                        <option value="video">Video Call</option>
                        <option value="phone">Phone Call</option>
                        <option value="onsite">On-site Interview</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes</label>
                    <textarea
                        className="input-field"
                        rows="3"
                        placeholder="Add any instructions or notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary">Schedule Interview</button>
                </div>
            </form>
        </Modal>
    );
};

export default ScheduleInterviewModal;
