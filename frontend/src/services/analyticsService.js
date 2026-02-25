import api from '../api/axios';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const BASE_URL = 'http://localhost:5033'; // Matches axios.js backend port

// Create SignalR connection
// Ensure to handle connection lifecycle properly in React context or hook
export const createSignalRConnection = () => {
    const connection = new HubConnectionBuilder()
        .withUrl(`${BASE_URL}/analyticsHub`, {
            accessTokenFactory: () => sessionStorage.getItem('token')
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

    return connection;
};

// API calls
export const analyticsService = {
    getUserGrowth: async (period = 'monthly') => {
        const response = await api.get("/AdminAnalytics/user-growth", { params: { period } });
        return response.data;
    },
    getApplicationTrends: async (period = 'daily') => {
        const response = await api.get("/AdminAnalytics/application-trends", { params: { period } });
        return response.data;
    },
    getJobStatus: async () => {
        const response = await api.get("/AdminAnalytics/job-status");
        return response.data;
    },
    getFunnelStats: async () => {
        const response = await api.get("/AdminAnalytics/funnel-stats");
        return response.data;
    },
    getTopSkills: async (top = 10) => {
        const response = await api.get("/AdminAnalytics/top-skills", { params: { top } });
        return response.data;
    },
    getMatchDistribution: async () => {
        const response = await api.get("/AdminAnalytics/match-distribution");
        return response.data;
    },
    getRecruiterPerformance: async (top = 5) => {
        const response = await api.get("/AdminAnalytics/recruiter-performance", { params: { top } });
        return response.data;
    },
    getSummary: async () => {
        const response = await api.get("/AdminAnalytics/summary");
        return response.data;
    }
};
