import React from 'react';

const Dashboard = ({ data }) => {
    // Mock data if none provided
    const results = data || {
        role: "Senior Data Scientist",
        matchScore: 87,
        skills: ["Python", "TensorFlow", "React", "AWS", "SQL", "Deep Learning"],
        experience: [
            { role: "ML Engineer", year: "2020-Present", company: "Tech Corp" },
            { role: "Data Analyst", year: "2018-2020", company: "Data Inc" }
        ]
    };

    return (
        <div className="dashboard" style={{ marginTop: '2rem', display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

            {/* Score Card */}
            <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Match Score</h3>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: `conic-gradient(var(--accent-secondary) ${results.matchScore}%, var(--glass-border) 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '1rem 0',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: '3px',
                        background: 'var(--bg-primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span className="gradient-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{results.matchScore}%</span>
                    </div>
                </div>
                <p style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{results.role}</p>
            </div>

            {/* Skills Card */}
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Identified Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {results.skills.map((skill, index) => (
                        <span key={index} style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: 'rgba(109, 40, 217, 0.2)',
                            border: '1px solid rgba(109, 40, 217, 0.3)',
                            color: '#d8b4fe',
                            fontSize: '0.9rem'
                        }}>
                            {skill}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
