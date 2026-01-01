import api from "./axios";

const JobService = {
    // ======================
    // GET ALL JOBS
    // ======================
    getAllJobs: async () => {
        try {
            const response = await api.get("/jobs");
            return response.data;
        } catch (error) {
            console.error("Error fetching jobs", error);
            throw error.response?.data || { message: "Failed to fetch jobs" };
        }
    },

    // ======================
    // GET POSTED JOBS (RECRUITER)
    // ======================
    getPostedJobs: async () => {
        try {
            const response = await api.get("/jobs/posted");
            return response.data;
        } catch (error) {
            console.error("Error fetching posted jobs", error);
            throw error.response?.data || { message: "Failed to fetch jobs" };
        }
    },

    // ======================
    // GET JOB BY ID
    // ======================
    getJobById: async (id) => {
        try {
            const response = await api.get(`/jobs/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching job ${id}`, error);
            throw error.response?.data || { message: "Failed to fetch job details" };
        }
    },

    // ======================
    // CREATE JOB
    // ======================
    createJob: async (jobData) => {
        try {
            // jobData should match CreateJobDto
            // { Title, RequiredSkills (string), ExperienceRequired (string), SalaryMin, SalaryMax }
            const response = await api.post("/jobs", jobData);
            return response.data;
        } catch (error) {
            console.error("Error creating job", error);
            throw error.response?.data || { message: "Failed to create job" };
        }
    },

    // ======================
    // UPDATE JOB
    // ======================
    updateJob: async (id, jobData) => {
        try {
            const response = await api.put(`/jobs/${id}`, jobData);
            return response.data;
        } catch (error) {
            console.error(`Error updating job ${id}`, error);
            throw error.response?.data || { message: "Failed to update job" };
        }
    },

    // ======================
    // DELETE JOB
    // ======================
    deleteJob: async (id) => {
        try {
            await api.delete(`/jobs/${id}`);
            return true;
        } catch (error) {
            console.error(`Error deleting job ${id}`, error);
            throw error.response?.data || { message: "Failed to delete job" };
        }
    },

    // ======================
    // UPDATE JOB STATUS
    // ======================
    updateJobStatus: async (id, status) => {
        try {
            await api.patch(`/jobs/${id}/status`, JSON.stringify(status), {
                headers: { 'Content-Type': 'application/json' }
            });
            return true;
        } catch (error) {
            console.error(`Error updating job status ${id}`, error);
            throw error.response?.data || { message: "Failed to update job status" };
        }
    },

    // ======================
    // GET INTERVIEW ROUNDS
    // ======================
    getInterviewRounds: async (jobId) => {
        try {
            const response = await api.get(`/jobs/${jobId}/interview-rounds`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching interview rounds for job ${jobId}`, error);
            // Default to empty array if fails or 404
            return [];
        }
    }
};

export default JobService;
