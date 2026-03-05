import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProfileService from '../../api/profileService';
import ProfileHeader from '../../components/profile/ProfileHeader';
import PersonalInfoForm from '../../components/profile/PersonalInfoForm';
import ApplicantDetails from '../../components/profile/ApplicantDetails';
import RecruiterDetails from '../../components/profile/RecruiterDetails';
import AccountSettings from '../../components/profile/AccountSettings';
import './Profile.css';

const ProfilePage = () => {
    const { user, updatePlan } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [formData, setFormData] = useState({});
    const [files, setFiles] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await ProfileService.getMyProfile();
            setProfileData(data);
            setFormData(data);
        } catch (error) {
            addToast("Failed to load profile data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (file, type) => {
        setFiles(prev => ({ ...prev, [type]: file }));
    };

    const handlePhotoUpload = async (file) => {
        try {
            const result = await ProfileService.uploadProfileImage(file);
            setFormData(prev => ({ ...prev, profileImage: result.url }));
            addToast("Photo uploaded locally. Save changes to persist.", "info");
        } catch (error) {
            addToast("Failed to upload photo", "error");
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const isRecruiter = user?.role?.toLowerCase() === 'recruiter';

            if (isRecruiter) {
                // Recruiter API expects DTO (JSON)
                await ProfileService.updateRecruiterProfile(formData);
            } else {
                // Applicant API expects FormData
                const dataToSubmit = new FormData();

                Object.keys(formData).forEach(key => {
                    const value = formData[key];
                    if (value !== null && value !== undefined) {
                        if (Array.isArray(value)) {
                            // Backend expects EducationJson and WorkExperienceJson
                            if (key === 'Education') dataToSubmit.append('EducationJson', JSON.stringify(value));
                            else if (key === 'WorkExperience') dataToSubmit.append('WorkExperienceJson', JSON.stringify(value));
                            else dataToSubmit.append(key, value);
                        } else {
                            dataToSubmit.append(key, value);
                        }
                    }
                });

                if (files.resume) dataToSubmit.append('resume', files.resume);
                if (files.profileImage) dataToSubmit.append('profileImage', files.profileImage);

                await ProfileService.updateProfile(dataToSubmit);
            }

            addToast("Profile updated successfully", "success");
            fetchProfile();
        } catch (error) {
            addToast("Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    };

    const calculateCompletion = () => {
        if (!formData) return 0;
        const fields = user?.role?.toLowerCase() === 'recruiter'
            ? ['fullName', 'email', 'mobileNumber', 'location', 'companyName', 'companyWebsite', 'designation']
            : ['fullName', 'email', 'mobileNumber', 'location', 'skills', 'experienceYears', 'preferredRole'];

        const filled = fields.filter(f => formData[f] && formData[f] !== '' && formData[f] !== 0);
        return Math.round((filled.length / fields.length) * 100);
    };

    if (loading) return <div className="profile-loading">Loading profile...</div>;

    const isRecruiter = user?.role?.toLowerCase() === 'recruiter';

    return (
        <div className="profile-container">
            <div className="completion-bar-container">
                <div className="completion-label">
                    <span>Profile Completion</span>
                    <span>{calculateCompletion()}%</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${calculateCompletion()}%` }}></div>
                </div>
            </div>

            <ProfileHeader
                userData={profileData}
                onPhotoUpload={(file) => {
                    handleFileChange(file, 'profileImage');
                    handlePhotoUpload(file);
                }}
            />

            <div className="profile-grid">
                <div className="profile-main-col">
                    <PersonalInfoForm formData={formData} onChange={handleInputChange} />

                    {isRecruiter ? (
                        <RecruiterDetails formData={formData} onChange={handleInputChange} />
                    ) : (
                        <ApplicantDetails
                            formData={formData}
                            onChange={handleInputChange}
                            onFileChange={handleFileChange}
                        />
                    )}
                </div>

                <div className="profile-side-col">
                    <AccountSettings userData={profileData} />
                </div>
            </div>

            <div className="profile-footer">
                <button
                    className="btn-premium-save"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Save Profile Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
