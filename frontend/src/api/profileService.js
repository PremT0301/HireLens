import axios from './axios';

const ProfileService = {
    // Get current user's profile
    getMyProfile: async () => {
        try {
            const response = await axios.get('/profiles/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching profile", error);
            throw error;
        }
    },

    // Update current user's profile
    updateProfile: async (profileData) => {
        try {
            // profileData: { currentRole, experienceYears, location }
            const response = await axios.put('/profiles/me', profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating profile", error);
            throw error;
        }
    },

    // Get applicant profile
    getApplicantProfile: async () => {
        try {
            const response = await axios.get('/profiles/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching applicant profile", error);
            throw error;
        }
    },

    // Update applicant profile
    updateApplicantProfile: async (profileData) => {
        try {
            const response = await axios.put('/profiles/me', profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating applicant profile", error);
            throw error;
        }
    },

    // Get recruiter profile
    getRecruiterProfile: async () => {
        try {
            const response = await axios.get('/profiles/recruiter/me');
            return response.data;
        } catch (error) {
            console.error("Error fetching recruiter profile", error);
            throw error;
        }
    },

    // Update recruiter profile
    updateRecruiterProfile: async (profileData) => {
        try {
            // profileData: { companyName, companyLogo, designation }
            const response = await axios.put('/profiles/recruiter/me', profileData);
            return response.data;
        } catch (error) {
            console.error("Error updating recruiter profile", error);
            throw error;
        }
    },

    // Upload recruiter logo
    uploadRecruiterLogo: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post('/profiles/recruiter/logo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data; // { url: "..." }
        } catch (error) {
            console.error("Error uploading logo", error);
            throw error;
        }
    }
};

export default ProfileService;
