import React, { useState, useEffect } from 'react';
import HireLensLoader from '../components/ui/HireLensLoader';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Briefcase, ChevronRight, Upload, MapPin, Phone, Linkedin, Calendar, GraduationCap, Building, Trash2, Plus, Sun, Moon, ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import AuthService from '../api/authService';
import ProfileService from '../api/profileService';
import axios from '../api/axios';

const Signup = () => {
    const navigate = useNavigate();
    const locationHook = useLocation();

    // Mode: 'register' (standard) or 'complete' (google callback)
    const [mode, setMode] = useState('register');
    const [loading, setLoading] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    const [error, setError] = useState('');

    // Role (Only switchable in register mode)
    const [role, setRole] = useState('applicant');

    useEffect(() => {
        // Sync theme state on mount
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') setIsDark(true);
        else if (currentTheme === 'light') setIsDark(false);
        else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(prefersDark);
        }
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        const newTheme = !isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    // Common Fields
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobileNumber: '',
        location: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        linkedinUrl: '',
        preferredRole: '',
        preferredWorkLocation: '',
        skills: '', // Comma separated string for input
        currentRole: '',
        experienceYears: 0,

        // Recruiter
        // Recruiter
        companyName: '',
        designation: '',
        companyWebsite: '',
        industry: '',
        companySize: '',
        recruiterType: ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null); // Recruiter Logo

    // Lists
    const [educationList, setEducationList] = useState([]);
    const [workExpList, setWorkExpList] = useState([]);

    // Init Effect
    useEffect(() => {
        const params = new URLSearchParams(locationHook.search);
        const token = params.get('token');
        if (token) {
            setMode('complete');
            sessionStorage.setItem('token', token);
            fetchInitialProfile();
        }
    }, [locationHook]);

    const fetchInitialProfile = async () => {
        setLoading(true);
        try {
            const profile = await ProfileService.getMyProfile();
            // Pre-fill
            setFormData(prev => ({
                ...prev,
                fullName: profile.FullName || profile.fullName || '',
                email: profile.Email || profile.email || '',
                mobileNumber: profile.MobileNumber || profile.mobileNumber || '',
                location: profile.Location || profile.location || '',
                // If profile image exists, we can't easily put it in file input, but we can show preview?
                // Logic: check profile.ProfileImage
            }));
            if (profile.ProfileImage || profile.profileImage) {
                // setProfileImagePreview(url...) // Optional
            }
        } catch (error) {
            console.error("Error fetching initial profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'profile') {
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        } else if (type === 'resume') {
            if (file.type === 'application/pdf') {
                setResumeFile(file);
            } else {
                alert("Only PDF allowed for Resume");
            }
        } else if (type === 'logo') {
            setLogoFile(file);
        }
    };



    const handleSignup = async (e) => {
        e.preventDefault();

        // Prevent double submission
        if (loading) return;

        console.log("🚀 [Signup] Starting submission...");
        setError('');

        if (mode === 'register' && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();

            // Common
            data.append('FullName', formData.fullName);
            data.append('Email', formData.email);
            data.append('MobileNumber', formData.mobileNumber);
            data.append('Location', formData.location);
            if (profileImage) data.append('ProfileImage', profileImage);

            if (mode === 'register') {
                data.append('Password', formData.password);
                data.append('Role', role);
            }


            if (role === 'recruiter') {
                // Validation (Check formData directly)
                if (!formData.companyName) { setError("Company Name is required"); setLoading(false); return; }
                if (!formData.designation) { setError("Designation is required"); setLoading(false); return; }
                if (!formData.recruiterType) { setError("Recruiter Type is required"); setLoading(false); return; }

                data.append('CompanyName', formData.companyName);
                data.append('Designation', formData.designation);

                // New Fields - Append if present
                if (formData.companyWebsite) data.append('CompanyWebsite', formData.companyWebsite);
                if (formData.industry) data.append('Industry', formData.industry);
                if (formData.companySize) data.append('CompanySize', formData.companySize);
                if (formData.recruiterType) data.append('RecruiterType', formData.recruiterType);

                if (logoFile) data.append('Logo', logoFile);

                if (mode === 'register') {
                    await AuthService.register(data);
                } else {
                    // Recruiter Google Complete?? Not scoped but assumed
                    // For now user only asked applicant flow.
                    alert("Recruiter Google Completion not fully implemented");
                    return;
                }
            } else {
                // Applicant
                data.append('Address', formData.address);
                if (formData.dateOfBirth) data.append('DateOfBirth', formData.dateOfBirth);
                data.append('Gender', formData.gender);
                // data.append('FormattedSkills', formData.skills); // Helper? No, string
                // data.append('Skills', formData.skills); // Backend Expects Comma Separated String? 
                // Wait. AuthService: string.Join(",", request.Skills) -> implies Skills is LIST<String> in Request DTO.
                // ProfileController: request.Skills (string).

                // DIVERGENCE:
                // Register DTO: List<string> Skills
                // UpdateProfile DTO: string Skills

                // I need to send correctly.
                if (mode === 'register') {
                    // Send as list? Or duplicate keys?
                    // data.append('Skills', formData.skills) might be treated as [ "skill1,skill2" ] (one item).
                    // Ideally split.
                    const skillsArr = formData.skills.split(',').map(s => s.trim());
                    skillsArr.forEach((s, i) => data.append(`Skills[${i}]`, s));
                } else {
                    data.append('Skills', formData.skills);
                }

                data.append('LinkedInUrl', formData.linkedinUrl);
                data.append('PreferredRole', formData.preferredRole);
                data.append('PreferredWorkLocation', formData.preferredWorkLocation);
                data.append('CurrentRole', formData.currentRole);
                data.append('ExperienceYears', formData.experienceYears);

                if (resumeFile) data.append('Resume', resumeFile);

                // Education & WorkExp
                if (mode === 'register') {
                    // Index based
                    educationList.forEach((ed, i) => {
                        data.append(`Education[${i}].CollegeName`, ed.collegeName);
                        data.append(`Education[${i}].Degree`, ed.degree);
                        data.append(`Education[${i}].Specialization`, ed.specialization);
                        data.append(`Education[${i}].CompletionYear`, ed.completionYear);
                        data.append(`Education[${i}].Grade`, ed.grade);
                    });
                    workExpList.forEach((exp, i) => {
                        data.append(`WorkExperience[${i}].CompanyName`, exp.companyName);
                        data.append(`WorkExperience[${i}].Role`, exp.role);
                        data.append(`WorkExperience[${i}].Duration`, exp.duration);
                        data.append(`WorkExperience[${i}].Description`, exp.description);
                    });
                } else {
                    // JSON based
                    data.append('EducationJson', JSON.stringify(educationList.map(e => ({
                        CollegeName: e.collegeName, Degree: e.degree, Specialization: e.specialization, CompletionYear: parseInt(e.completionYear), Grade: e.grade
                    }))));
                    data.append('WorkExperienceJson', JSON.stringify(workExpList.map(e => ({
                        CompanyName: e.companyName, Role: e.role, Duration: e.duration, Description: e.description
                    }))));
                }
            }

            if (mode === 'register') {
                const res = await AuthService.register(data);
                console.log("✅ [Signup] Registration success:", res);
                setVerificationSent(true);
            } else {
                // Complete profile
                // Do NOT set Content-Type manually, axios will handle boundary
                await axios.put('/profiles/me', data);

                // Force reload profile cache/context if any
                alert("Profile completed successfully! Welcome.");
                navigate('/applicant/dashboard');
            }

        } catch (error) {
            console.error(error);
            let msg = "Operation failed";

            // Check for ASP.NET Validation Errors
            if (error.errors && typeof error.errors === 'object') {
                // flatten the errors object
                const details = Object.values(error.errors).flat().join(', ');
                msg = details || "Validation failed";
            } else {
                msg = error.message || (typeof error === 'string' ? error : "Operation failed");
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Add/Remove Helpers
    const addEducation = () => setEducationList([...educationList, { collegeName: '', degree: '', specialization: '', completionYear: '', grade: '' }]);
    const removeEducation = (i) => setEducationList(educationList.filter((_, idx) => idx !== i));
    const updateEducation = (i, field, val) => {
        const newL = [...educationList];
        newL[i][field] = val;
        setEducationList(newL);
    };

    const addWork = () => setWorkExpList([...workExpList, { companyName: '', role: '', duration: '', description: '' }]);
    const removeWork = (i) => setWorkExpList(workExpList.filter((_, idx) => idx !== i));
    const updateWork = (i, field, val) => {
        const newL = [...workExpList];
        newL[i][field] = val;
        setWorkExpList(newL);
    };

    return (
        <div className="auth-wrapper page-transition">
            {/* Top Navigation Controls */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 50 }}>
                <button
                    onClick={() => navigate('/')}
                    className="btn-ghost"
                    style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <ArrowLeft size={18} /> <span className="hide-mobile">Back to Home</span>
                    <style>{`@media (max-width: 600px) { .hide-mobile { display: none; } }`}</style>
                </button>
            </div>

            <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 50 }}>
                <button
                    onClick={toggleTheme}
                    className="btn-ghost"
                    style={{
                        padding: '10px',
                        borderRadius: '50%',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Brand Panel */}
            <div className="auth-brand-panel" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/auth_logo.png" alt="HireLens" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>HireLens AI</h1>
                    </div>

                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                        Join the <br />
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>Revolution.</span>
                    </h2>

                    <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6 }}>
                        Create your profile today and let our AI connect you with opportunities that match your true potential.
                    </p>

                    <ul style={{ marginTop: '3rem', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            "AI-Powered Resume Analysis",
                            "Smart Job Matching",
                            "Skill Gap Insights"
                        ].map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 500 }}>
                                <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Content Panel */}
            <div className="auth-content-panel">
                {verificationSent ? (
                    <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '3rem' }}>
                        <div style={{ width: 80, height: 80, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                            <Mail size={40} />
                        </div>
                        <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Check Your Email</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                            We've sent a verification link to <strong>{formData.email}</strong>. Please verify your email to unlock full access to HireLens AI.
                        </p>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Didn't receive the email? Check your spam folder or wait a few minutes.
                            </p>
                        </div>
                        <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%' }}>
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <div className="auth-card" style={{ maxWidth: '800px' }}> {/* Wider for Signup form */}
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                {mode === 'complete' ? "Complete Your Profile" : "Create Account"}
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {mode === 'complete' ? "Just a few more details to get started" : "Start your journey in seconds"}
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                animation: 'fadeInScale 0.3s ease-out'
                            }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {mode === 'register' && (
                            <div style={toggleContainerStyle}>
                                <button type="button" onClick={() => setRole('applicant')} style={role === 'applicant' ? activeToggleStyle : toggleStyle}>Applicant</button>
                                <button type="button" onClick={() => setRole('recruiter')} style={role === 'recruiter' ? activeToggleStyle : toggleStyle}>Recruiter</button>
                            </div>
                        )}

                        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            <SectionTitle title="Personal Details" icon={<User size={18} />} />

                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-secondary)', margin: '0 auto', overflow: 'hidden', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    {profileImagePreview ? <img src={profileImagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="var(--text-secondary)" />}
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profile')} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '5px' }}>Upload Profile Photo</p>
                            </div>

                            <div className="grid-2">
                                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                                <Input label="Email" name="email" value={formData.email} onChange={handleInputChange} required disabled={mode === 'complete'} />
                            </div>

                            {mode === 'register' && (
                                <div className="grid-2">
                                    <Input type="password" label="Password" name="password" value={formData.password} onChange={handleInputChange} required />
                                    <Input type="password" label="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
                                </div>
                            )}

                            <div className="grid-2">
                                <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required />
                                <Input label="Current Location" name="location" value={formData.location} onChange={handleInputChange} required />
                            </div>

                            {role === 'applicant' && (
                                <>
                                    <div className="grid-2">
                                        <Input type="date" label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                                        <div>
                                            <label style={labelStyle}>Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleInputChange} style={inputStyle} required>
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Input label="Address" name="address" value={formData.address} onChange={handleInputChange} />

                                    <SectionTitle title="Professional Info" icon={<Briefcase size={18} />} />

                                    <div className="grid-2">
                                        <Input label="Current Role" name="currentRole" value={formData.currentRole} onChange={handleInputChange} placeholder="e.g. Software Engineer" />
                                        <Input type="number" label="Experience (Years)" name="experienceYears" value={formData.experienceYears} onChange={handleInputChange} />
                                    </div>

                                    <div className="grid-2">
                                        <Input label="Preferred Role" name="preferredRole" value={formData.preferredRole} onChange={handleInputChange} placeholder="e.g. Full Stack Developer" required />
                                        <div>
                                            <label style={labelStyle}>Preferred Location</label>
                                            <select name="preferredWorkLocation" value={formData.preferredWorkLocation} onChange={handleInputChange} style={inputStyle} required>
                                                <option value="">Select</option>
                                                <option value="Onsite">Onsite</option>
                                                <option value="Remote">Remote</option>
                                                <option value="Hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <Input label="LinkedIn URL" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." />

                                    <div>
                                        <label style={labelStyle}>Skills (Comma separated)</label>
                                        <input type="text" name="skills" value={formData.skills} onChange={handleInputChange} style={inputStyle} placeholder="React, Node.js, C#, AWS" required />
                                    </div>

                                    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Upload size={20} />
                                            <span>{resumeFile ? resumeFile.name : "Upload Resume (PDF Required)"}</span>
                                            <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'resume')} style={{ display: 'none' }} />
                                        </label>
                                    </div>

                                    <SectionTitle title="Education" icon={<GraduationCap size={18} />} />
                                    {educationList.map((ed, i) => (
                                        <div key={i} style={cardStyle}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>Education #{i + 1}</h4>
                                                <button type="button" onClick={() => removeEducation(i)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                            </div>
                                            <div className="grid-2">
                                                <Input label="College" value={ed.collegeName} onChange={(e) => updateEducation(i, 'collegeName', e.target.value)} required />
                                                <Input label="Degree" value={ed.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} placeholder="B.Tech" required />
                                            </div>
                                            <div className="grid-2">
                                                <Input label="Specialization" value={ed.specialization} onChange={(e) => updateEducation(i, 'specialization', e.target.value)} placeholder="CS" />
                                                <div className="grid-2">
                                                    <Input label="Year" type="number" value={ed.completionYear} onChange={(e) => updateEducation(i, 'completionYear', e.target.value)} required />
                                                    <Input label="Grade/CGPA" value={ed.grade} onChange={(e) => updateEducation(i, 'grade', e.target.value)} required />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addEducation} className="btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }}><Plus size={16} /> Add Education</button>

                                    <SectionTitle title="Work Experience (Optional)" icon={<Building size={18} />} />
                                    {workExpList.map((exp, i) => (
                                        <div key={i} style={{
                                            background: 'var(--bg-primary)',
                                            padding: '1.25rem',
                                            borderRadius: '12px',
                                            marginBottom: '1rem',
                                            border: '1px solid var(--border-color)',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                        <Briefcase size={16} />
                                                    </div>
                                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Experience #{i + 1}</h4>
                                                </div>
                                                <button type="button" onClick={() => removeWork(i)} className="btn-ghost" style={{ padding: '8px', color: 'var(--error)' }}><Trash2 size={16} /></button>
                                            </div>

                                            <div className="grid-2">
                                                <Input label="Company Name" value={exp.companyName} onChange={(e) => updateWork(i, 'companyName', e.target.value)} placeholder="e.g. Google" required />
                                                <Input label="Job Title" value={exp.role} onChange={(e) => updateWork(i, 'role', e.target.value)} placeholder="e.g. Senior Product Designer" required />
                                            </div>

                                            <div style={{ marginTop: '1rem' }}>
                                                <Input label="Duration" value={exp.duration} onChange={(e) => updateWork(i, 'duration', e.target.value)} placeholder="e.g. Jan 2022 - Present" required />
                                            </div>

                                            <div style={{ marginTop: '1rem' }}>
                                                <label style={labelStyle}>Description (Key Achievements)</label>
                                                <textarea
                                                    placeholder="• Led the design system team...&#10;• Increased conversion by 20%..."
                                                    value={exp.description}
                                                    onChange={(e) => updateWork(i, 'description', e.target.value)}
                                                    style={{
                                                        ...inputStyle,
                                                        minHeight: '100px',
                                                        resize: 'vertical',
                                                        fontFamily: 'inherit',
                                                        lineHeight: '1.5'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addWork} className="btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }}><Plus size={16} /> Add Experience</button>

                                </>
                            )}

                            {role === 'recruiter' && (
                                <>
                                    <Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} required />
                                    <Input label="Company Website" name="companyWebsite" value={formData.companyWebsite} onChange={handleInputChange} placeholder="https://example.com" />

                                    <div className="grid-2">
                                        <Input label="Industry" name="industry" value={formData.industry} onChange={handleInputChange} placeholder="e.g. Technology" />
                                        <div>
                                            <label style={labelStyle}>Company Size</label>
                                            <select name="companySize" value={formData.companySize} onChange={handleInputChange} style={inputStyle}>
                                                <option value="">Select Size</option>
                                                <option value="1-10">1-10 Employees</option>
                                                <option value="11-50">11-50 Employees</option>
                                                <option value="51-200">51-200 Employees</option>
                                                <option value="201-500">201-500 Employees</option>
                                                <option value="500+">500+ Employees</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid-2">
                                        <Input label="Designation" name="designation" value={formData.designation} onChange={handleInputChange} required />
                                        <div>
                                            <label style={labelStyle}>Recruiter Type</label>
                                            <select name="recruiterType" value={formData.recruiterType} onChange={handleInputChange} style={inputStyle} required>
                                                <option value="">Select Type</option>
                                                <option value="In-house HR">In-house HR</option>
                                                <option value="Staffing Agency">Staffing Agency</option>
                                                <option value="Headhunter">Headhunter</option>
                                                <option value="Freelance">Freelance</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed var(--glass-border)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Upload size={20} />
                                            <span>{logoFile ? logoFile.name : "Upload Company Logo"}</span>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} style={{ display: 'none' }} />
                                        </label>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="btn-primary" style={{ marginTop: '2rem' }} disabled={loading}>
                                {loading ? 'Processing...' : (mode === 'complete' ? 'Complete Profile' : 'Sign Up')}
                            </button>

                        </form>

                        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Log in</Link>
                        </p>
                    </div>
                )}
                {loading && <HireLensLoader text="Processing..." />}
                <style>{`
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                    @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
                `}</style>
            </div>
        </div>
    );
};

const SectionTitle = ({ title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>
        {icon} <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{title}</h3>
    </div>
);

const Input = ({ label, ...props }) => (
    <div>
        <label style={labelStyle}>{label}</label>
        <input style={inputStyle} {...props} />
    </div>
);

const labelStyle = { display: 'block', color: 'var(--text-secondary)', marginBottom: '5px', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' };
const toggleContainerStyle = { display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', marginBottom: '1rem' };
const toggleStyle = { flex: 1, padding: '8px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', borderRadius: '6px' };
const activeToggleStyle = { ...toggleStyle, background: 'var(--primary)', color: 'white', fontWeight: 'bold' };
const cardStyle = { background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--glass-border)' };

export default Signup;
