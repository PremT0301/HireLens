import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HiringFunnelChart = ({ data, theme }) => {
    // Transformation for Recharts (Funnel is tricky, using Bar for simplicity or custom shape)
    // Or just horizontal bar sorted
    const funnelData = [
        { name: 'Applied', value: data.applied || 0 },
        { name: 'Interview Scheduled', value: data.interviewScheduled || 0 },
        { name: 'Interview Completed', value: data.interviewCompleted || 0 },
        { name: 'Hired', value: data.hired || 0 }
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart
                layout="vertical"
                data={funnelData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#8884d8">
                    {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#10b981'][index % 4]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default HiringFunnelChart;
