import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TopSkillsChart = ({ data, theme }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="skillName" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#f43f5e" name="Count" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopSkillsChart;
