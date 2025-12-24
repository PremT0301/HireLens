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
    }
};

export default ResumeService;
