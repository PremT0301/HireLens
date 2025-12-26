import axios from './axios';
import { endpoints } from './config';

const ApplicationService = {
    getMyApplications: async () => {
        const response = await axios.get(`${endpoints.applications}/my`);
        return response.data;
    },

    getRecruiterStats: async () => {
        const response = await axios.get(`${endpoints.applications}/recruiter-stats`);
        return response.data;
    },

    getRecentApplications: async () => {
        const response = await axios.get(`${endpoints.applications}/recent`);
        return response.data;
    },

    applyToJob: async (jobId) => {
        const response = await axios.post(`${endpoints.applications}/apply?jobId=${jobId}`);
        return response.data;
    },

    getTalentPool: async () => {
        const response = await axios.get(`${endpoints.applications}/talent-pool`);
        return response.data;
    },

    withdrawApplication: async (jobId) => {
        const response = await axios.delete(`${endpoints.applications}/withdraw/${jobId}`);
        return response.data;
    },

    updateStatus: async (applicationId, status) => {
        const response = await axios.patch(`${endpoints.applications}/${applicationId}/status`, status, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    scheduleInterview: async (applicationId, interviewData) => {
        const response = await axios.post(`${endpoints.applications}/${applicationId}/schedule`, interviewData);
        return response.data;
    },

    sendMessage: async (applicationId, messageData) => {
        const response = await axios.post(`${endpoints.applications}/${applicationId}/message`, messageData);
        return response.data;
    }
};

export default ApplicationService;
