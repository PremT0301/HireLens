import api from './axios';

const DashboardService = {
    getApplicantSummary: async () => {
        const response = await api.get('/applicant/dashboard/summary');
        return response.data;
    }
};

export default DashboardService;
