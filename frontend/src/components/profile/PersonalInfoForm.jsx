import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, User as UserIcon } from 'lucide-react';

const PersonalInfoForm = ({ formData, onChange }) => {
    return (
        <div className="profile-card">
            <h3 className="card-title"><UserIcon size={20} /> Personal Information</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label><UserIcon size={14} /> Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={onChange}
                        placeholder="e.g. Your Name"
                    />
                </div>
                <div className="form-group">
                    <label><Mail size={14} /> Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={onChange}
                        disabled
                    />
                </div>
                <div className="form-group">
                    <label><Phone size={14} /> Phone Number</label>
                    <input
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber || ''}
                        onChange={onChange}
                        placeholder="+91 00000 00000"
                    />
                </div>
                <div className="form-group">
                    <label><MapPin size={14} /> My Location</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location || ''}
                        onChange={onChange}
                        placeholder="City, Country"
                    />
                </div>
                <div className="form-group">
                    <label><Linkedin size={14} /> LinkedIn URL</label>
                    <input
                        type="url"
                        name="linkedInUrl"
                        value={formData.linkedInUrl || ''}
                        onChange={onChange}
                        placeholder="linkedin.com/in/..."
                    />
                </div>
                <div className="form-group">
                    <label><Globe size={14} /> Portfolio / Site</label>
                    <input
                        type="url"
                        name="portfolioWebsite"
                        value={formData.portfolioWebsite || ''}
                        onChange={onChange}
                        placeholder="yourlink.com"
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoForm;
