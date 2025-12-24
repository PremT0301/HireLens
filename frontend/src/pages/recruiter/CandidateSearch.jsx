import React from 'react';
import { Search, Filter } from 'lucide-react';

const CandidateSearch = () => {
    return (
        <div>
            <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Candidate Search</h1>

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search by skill, role, or name..."
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
                <button className="btn-ghost" style={{ border: '1px solid var(--glass-border)', display: 'flex', items: 'center', gap: '8px' }}>
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Results */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', margin: '0 auto 1rem' }}></div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>Candidate #{4020 + i}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Senior Python Developer</p>

                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            {['Python', 'Django', 'AWS'].map(skill => (
                                <span key={skill} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{skill}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn-ghost" style={{ flex: 1, border: '1px solid var(--glass-border)' }}>Profile</button>
                            <button className="btn-primary" style={{ flex: 1 }}>Contact</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CandidateSearch;
