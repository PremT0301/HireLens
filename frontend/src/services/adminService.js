import api from "../api/axios";

const AdminService = {
    // Get system statistics
    getStats: async () => {
        try {
            const response = await api.get("/admin/stats");
            return response.data;
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            throw error.response?.data || { message: "Failed to fetch stats" };
        }
    },

    // Get all users
    getUsers: async () => {
        try {
            const response = await api.get("/admin/users");
            return response.data;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error.response?.data || { message: "Failed to fetch users" };
        }
    },

    // Toggle user status (Enable/Disable)
    toggleUserStatus: async (userId) => {
        try {
            const response = await api.patch(`/admin/users/${userId}/toggle`);
            return response.data;
        } catch (error) {
            console.error("Error toggling user status:", error);
            throw error.response?.data || { message: "Failed to toggle user status" };
        }
    },

    // Get all jobs for moderation
    getJobs: async () => {
        try {
            const response = await api.get("/admin/jobs");
            return response.data;
        } catch (error) {
            console.error("Error fetching jobs:", error);
            throw error.response?.data || { message: "Failed to fetch jobs" };
        }
    },

    // Toggle job status (Open/Close)
    toggleJobStatus: async (jobId) => {
        try {
            const response = await api.patch(`/admin/jobs/${jobId}/toggle`);
            return response.data;
        } catch (error) {
            console.error("Error toggling job status:", error);
            throw error.response?.data || { message: "Failed to toggle job status" };
        }
    },

    // Get system logs
    getSystemLogs: async (params) => {
        try {
            const response = await api.get("/admin/logs", { params });
            return {
                data: response.data,
                totalCount: response.headers['x-total-count']
            };
        } catch (error) {
            console.error("Error fetching system logs:", error);
            throw error.response?.data || { message: "Failed to fetch system logs" };
        }
    }
};

export default AdminService;
