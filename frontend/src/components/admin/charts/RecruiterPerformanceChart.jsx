import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RecruiterPerformanceChart = ({ data, theme }) => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recruiterName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="jobsPosted" fill="#6366f1" name="Jobs Posted" />
                <Bar dataKey="applicationsReceived" fill="#eab308" name="Applications" />
                <Bar dataKey="hiresMade" fill="#22c55e" name="Hires" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default RecruiterPerformanceChart;
