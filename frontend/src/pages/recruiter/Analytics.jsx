import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Analytics = () => {
    const supplyDemandData = [
        { name: 'Python', demand: 90, supply: 65 },
        { name: 'React', demand: 85, supply: 80 },
        { name: 'Kubernetes', demand: 75, supply: 40 },
        { name: 'AWS', demand: 95, supply: 55 },
        { name: 'Go', demand: 60, supply: 30 },
    ];

    const salaryData = [
        { year: '2020', min: 80, avg: 110, max: 140 },
        { year: '2021', min: 90, avg: 125, max: 160 },
        { year: '2022', min: 95, avg: 135, max: 170 },
        { year: '2023', min: 100, avg: 145, max: 190 },
        { year: '2024', min: 110, avg: 155, max: 210 },
        { year: '2025', min: 120, avg: 165, max: 220 },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', padding: '10px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: 'bold' }}>{label}</p>
                    {payload.map((entry, i) => (
                        <p key={i} style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <h1 className="title-lg" style={{ marginBottom: '2rem' }}>Market Analytics</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                {/* Supply vs Demand */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Skill Supply vs. Demand (2025)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={supplyDemandData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-secondary)" tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="demand" name="Market Demand" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="supply" name="Talent Supply" fill="var(--success)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        High demand for Cloud Native skills (AWS, Kubernetes) is outpacing supply, indicating a highly competitive market.
                    </p>
                </div>

                {/* Salary Trends */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Salary Benchmarks (₹k/yr)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={salaryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                                <XAxis dataKey="year" stroke="var(--text-secondary)" tickLine={false} />
                                <YAxis stroke="var(--text-secondary)" tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line type="monotone" dataKey="max" name="Top 10%" stroke="var(--success)" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="avg" name="Average" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="min" name="Entry Level" stroke="var(--text-secondary)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        Salary growth remains strong, projecting a 6.5% increase for senior roles in 2025.
                    </p>
                </div>

                {/* Difficulty Meter */}
                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Hiring Difficulty Score</h3>
                    <div style={{ position: 'relative', width: '220px', height: '110px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                        <div style={{ width: '220px', height: '220px', background: 'var(--glass-bg)', borderRadius: '50%', border: '25px solid var(--bg-secondary)' }}></div>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '220px', height: '220px',
                            borderRadius: '50%', border: '25px solid transparent',
                            borderTopColor: 'var(--error)', borderRightColor: 'var(--warning)',
                            transform: 'rotate(-45deg)', zIndex: 1
                        }}></div>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '220px', height: '220px',
                            borderRadius: '50%', border: '25px solid transparent',
                            borderLeftColor: 'var(--success)',
                            transform: 'rotate(-45deg)', zIndex: 0
                        }}></div>
                        <div style={{
                            position: 'absolute', bottom: 0, left: '50%', width: '4px', height: '100px',
                            background: 'var(--text-primary)', transformOrigin: 'bottom center',
                            transform: 'translateX(-50%) rotate(45deg)', /* 45deg = High Difficulty */
                            borderRadius: '2px', zIndex: 2
                        }}></div>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--error)' }}>High</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Avg. Time to Fill: 45 Days</p>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
