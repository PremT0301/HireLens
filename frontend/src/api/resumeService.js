import axios from './axios';

const ResumeService = {
    // Upload resume file for analysis
    uploadResume: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Important: Do not set Content-Type manually, axios does it for FormData
            const response = await axios.post('/resumes/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error uploading resume", error);
            throw error;
        }
    },

    // Fetch the latest resume metadata for the logged-in applicant.
    // Returns { hasResume: bool, resumeId: guid | null, parsedAt: string | null }
    // This is the single source of truth for resumeId across the frontend.
    getLatestResume: async () => {
        try {
            const response = await axios.get('/resumes/latest');
            return response.data;
        } catch (error) {
            console.error("Error fetching latest resume", error);
            // Return a safe default so callers don't need to guard against thrown errors
            return { hasResume: false, resumeId: null };
        }
    }
};

export default ResumeService;
