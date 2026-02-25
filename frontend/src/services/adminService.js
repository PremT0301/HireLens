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

    // Get system health
    getHealth: async () => {
        try {
            const response = await api.get("/admin/health");
            return response.data;
        } catch (error) {
            console.error("Error fetching admin health:", error);
            throw error.response?.data || { message: "Failed to fetch health status" };
        }
    },

    // Get all users (Paginated)
    getUsers: async (params = { page: 1, pageSize: 10 }) => {
        try {
            const response = await api.get("/admin/users", { params });
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

    // Update user role
    updateUserRole: async (userId, role) => {
        try {
            const response = await api.put(`/admin/users/${userId}/role`, JSON.stringify(role), {
                headers: { 'Content-Type': 'application/json' }
            });
            return response.data;
        } catch (error) {
            console.error("Error updating user role:", error);
            throw error.response?.data || { message: "Failed to update user role" };
        }
    },

    // Delete user (Soft delete)
    deleteUser: async (userId) => {
        try {
            const response = await api.delete(`/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error.response?.data || { message: "Failed to delete user" };
        }
    },

    // Get all jobs for moderation (Paginated)
    getJobs: async (params = { page: 1, pageSize: 10 }) => {
        try {
            const response = await api.get("/admin/jobs", { params });
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
