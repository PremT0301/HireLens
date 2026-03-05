import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Camera } from 'lucide-react';

const ProfileHeader = ({ userData, onPhotoUpload }) => {
    const { user } = useAuth();
    const [preview, setPreview] = useState(userData?.profileImage || '/default-avatar.png');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            onPhotoUpload(file);
        }
    };

    return (
        <div className="profile-header-card">
            <div className="header-banner"></div>
            <div className="header-content">
                <div className="profile-photo-wrapper">
                    <div className="avatar-container">
                        <img
                            src={preview}
                            alt="Profile"
                            className="profile-avatar-large"
                            onError={(e) => { e.target.src = '/default-avatar.png'; }}
                        />
                        <label htmlFor="photo-upload" className="photo-upload-trigger">
                            <Camera size={20} />
                            <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    <div className="profile-info-text">
                        <h1 className="profile-name">{userData?.fullName || user?.fullName}</h1>
                        <p className="profile-email">{userData?.email || user?.email}</p>
                        <span className={`plan-badge ${userData?.subscriptionPlan?.toLowerCase().replace('_', '-') || 'free'}`}>
                            {userData?.subscriptionPlan?.replace('_', ' ') || 'FREE'} PLAN
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn-ghost"
                        onClick={() => document.getElementById('photo-upload').click()}
                        style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                    >
                        Change Photo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
