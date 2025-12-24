import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Upload, User, Briefcase, MapPin, Phone, Building, Edit2, Mail, Calendar, GraduationCap } from 'lucide-react';
import AuthService from '../../api/authService';
import ProfileService from '../../api/profileService';

const ProfileEditor = ({ isOpen, onClose, userRole }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Joint State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        location: '',
        mobileNumber: '',
        // Recruiter specific
        companyName: '',
        designation: '',
        companyLogo: '',
        // Applicant specific
        currentRole: '',
        experienceYears: 0,
        collegeName: '',
        completionYear: '',
        grade: ''
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsEditing(false);
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const user = AuthService.getCurrentUser();
            let data = {
                fullName: user.fullName || '',
                email: user.email || '',
                location: '',
                mobileNumber: '',
                companyName: '',
                designation: '',
                companyLogo: '',
                currentRole: '',
                experienceYears: 0,
                collegeName: '',
                completionYear: '',
                grade: ''
            };

            if (userRole === 'recruiter') {
                const profile = await ProfileService.getRecruiterProfile();
                data = { ...data, ...profile }; // Spread handles camelCase if present

                // Explicitly map PascalCase or ensure fallback
                data.location = profile.Location || profile.location || '';
                data.mobileNumber = profile.MobileNumber || profile.mobileNumber || '';
                data.companyName = profile.CompanyName || profile.companyName || '';
                data.designation = profile.Designation || profile.designation || '';
                data.companyLogo = profile.CompanyLogo || profile.companyLogo || '';
            } else {
                const profile = await ProfileService.getApplicantProfile();
                data = { ...data, ...profile };

                // Explicitly map PascalCase or ensure fallback
                data.location = profile.Location || profile.location || '';
                data.mobileNumber = profile.MobileNumber || profile.mobileNumber || '';
                data.currentRole = profile.CurrentRole || profile.currentRole || '';
                data.experienceYears = profile.ExperienceYears || profile.experienceYears || 0;
                data.collegeName = profile.CollegeName || profile.collegeName || '';
                data.completionYear = profile.CompletionYear || profile.completionYear || '';
                data.grade = profile.Grade || profile.grade || '';
            }
            setFormData(data);
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (userRole === 'recruiter') {
                // If logo changed, upload it first
                if (logoFile) {
                    const result = await ProfileService.uploadRecruiterLogo(logoFile);
                    formData.companyLogo = result.url;
                }

                await ProfileService.updateRecruiterProfile({
                    companyName: formData.companyName,
                    designation: formData.designation,
                    location: formData.location,
                    mobileNumber: formData.mobileNumber,
                    companyLogo: formData.companyLogo
                });
            } else {
                await ProfileService.updateApplicantProfile({
                    currentRole: formData.currentRole,
                    experienceYears: parseInt(formData.experienceYears),
                    location: formData.location,
                    mobileNumber: formData.mobileNumber,
                    collegeName: formData.collegeName,
                    completionYear: parseInt(formData.completionYear),
                    grade: formData.grade
                });
            }
            setIsEditing(false); // Switch back to view mode
            fetchProfile(); // Refresh data
        } catch (error) {
            console.error("Failed to save profile", error);
            alert("Failed to save profile changes.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            zIndex: 9999, display: 'flex', overflow: 'auto', padding: '20px'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem', position: 'relative', margin: 'auto', maxHeight: 'none' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 className="gradient-text" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    {isEditing ? 'Edit Profile' : 'My Profile'}
                </h2>

                {loading ? <div style={{ color: 'var(--text-secondary)' }}>Loading...</div> : (
                    <>
                        {!isEditing ? (
                            // VIEW MODE
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* User Info Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    {userRole === 'recruiter' && formData.companyLogo ? (
                                        <img
                                            src={formData.companyLogo.startsWith('/') ? `http://localhost:5033${formData.companyLogo}` : formData.companyLogo}
                                            alt="Logo"
                                            style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '12px',
                                            background: 'var(--accent-primary)', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                                        }}>
                                            {formData.fullName.charAt(0)}
                                        </div>
                                    )}

                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>{formData.fullName}</h3>
                                        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                            {userRole === 'recruiter' ? formData.designation : formData.currentRole}
                                            {userRole === 'recruiter' && formData.companyName && ` at ${formData.companyName}`}
                                        </p>
                                    </div>
                                </div >

                                {/* Details Grid */}
                                < div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <ViewField icon={<Mail size={18} />} label="Email" value={formData.email} />
                                    <ViewField icon={<Phone size={18} />} label="Mobile" value={formData.mobileNumber || '-'} />
                                    <ViewField icon={<MapPin size={18} />} label="Location" value={formData.location || '-'} />
                                    {
                                        userRole === 'recruiter' ? (
                                            <>
                                                <ViewField icon={<Building size={18} />} label="Company" value={formData.companyName || '-'} />
                                                <ViewField icon={<Briefcase size={18} />} label="Designation" value={formData.designation || '-'} />
                                            </>
                                        ) : (
                                            <>
                                                <ViewField icon={<Briefcase size={18} />} label="Current Role" value={formData.currentRole || '-'} />
                                                <ViewField icon={<Calendar size={18} />} label="Experience" value={`${formData.experienceYears} Years`} />
                                                <ViewField icon={<GraduationCap size={18} />} label="College" value={formData.collegeName || '-'} />
                                                <ViewField icon={<GraduationCap size={18} />} label="Graduation" value={formData.completionYear || '-'} />
                                                <ViewField icon={<GraduationCap size={18} />} label="Grade" value={formData.grade || '-'} />
                                            </>
                                        )
                                    }
                                </div >

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Edit2 size={18} /> Edit Profile
                                    </button>
                                </div>
                            </div >
                        ) : (
                            // EDIT MODE
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Read Only Fields */}
                                <div>
                                    <label style={labelStyle}>Full Name</label>
                                    <div style={readOnlyStyle}>
                                        <User size={18} /> {formData.fullName}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Email</label>
                                    <div style={readOnlyStyle}>
                                        <Mail size={18} /> {formData.email}
                                    </div>
                                </div>

                                {/* Common Editable */}
                                <div>
                                    <label style={labelStyle}>Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={formData.mobileNumber}
                                        onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Role Specific Editable Fields */}
                                {userRole === 'recruiter' ? (
                                    <>
                                        <div>
                                            <label style={labelStyle}>Designation</label>
                                            <input
                                                type="text"
                                                value={formData.designation}
                                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Company Name</label>
                                            <input
                                                type="text"
                                                value={formData.companyName}
                                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Company Logo</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {(logoPreview || formData.companyLogo) && (
                                                    <img
                                                        src={logoPreview || (formData.companyLogo.startsWith('/') ? `http://localhost:5033${formData.companyLogo}` : formData.companyLogo)}
                                                        alt="Logo"
                                                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                                                    />
                                                )}
                                                <label style={{
                                                    cursor: 'pointer', padding: '8px 12px', background: 'var(--bg-secondary)',
                                                    border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '0.9rem',
                                                    display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    <Upload size={16} /> Change Logo
                                                    <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label style={labelStyle}>Current Role</label>
                                            <input
                                                type="text"
                                                value={formData.currentRole}
                                                onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Experience (Years)</label>
                                            <input
                                                type="number"
                                                value={formData.experienceYears}
                                                onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>College Name</label>
                                            <input
                                                type="text"
                                                value={formData.collegeName}
                                                onChange={e => setFormData({ ...formData, collegeName: e.target.value })}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={labelStyle}>Completion Year</label>
                                                <input
                                                    type="number"
                                                    value={formData.completionYear}
                                                    onChange={e => setFormData({ ...formData, completionYear: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Grade</label>
                                                <input
                                                    type="text"
                                                    value={formData.grade}
                                                    onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => { setIsEditing(false); fetchProfile(); }} // Re-fetch to discard unsaved changes
                                        className="btn-ghost"
                                        disabled={saving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={saving}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div >
        </div >
        , document.body);
};

const ViewField = ({ icon, label, value }) => (
    <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '0.85rem' }}>
            {icon} {label}
        </label>
        <div style={{ color: 'var(--text-primary)', fontSize: '1rem' }}>{value}</div>
    </div>
);

const labelStyle = { display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' };
const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    outline: 'none'
};
const readOnlyStyle = {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
    background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-secondary)'
};

export default ProfileEditor;
