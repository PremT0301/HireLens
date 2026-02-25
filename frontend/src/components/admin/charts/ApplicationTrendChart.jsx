import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ApplicationTrendChart = ({ data, theme }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis />
                <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" name="Applications" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default ApplicationTrendChart;
