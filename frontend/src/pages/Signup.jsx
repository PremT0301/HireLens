import React, { useState } from 'react';
import HireLensLoader from '../components/ui/HireLensLoader';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, ChevronRight, Upload } from 'lucide-react';
import AuthService from '../api/authService';

const Signup = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('applicant'); // 'applicant' or 'recruiter'
    const [loading, setLoading] = useState(false);

    // Common Fields
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [location, setLocation] = useState('');
    const [address, setAddress] = useState(''); // New Address field

    // Recruiter Fields
    const [companyName, setCompanyName] = useState('');
    const [designation, setDesignation] = useState('');
    const [logoFile, setLogoFile] = useState(null);

    // Applicant Fields
    const [resumeFile, setResumeFile] = useState(null);
    const [education, setEducation] = useState({
        collegeName: '',
        degree: '',
        specialization: '',
        completionYear: '',
        grade: ''
    });
    const [hasExperience, setHasExperience] = useState(false);
    const [experience, setExperience] = useState({
        companyName: '',
        role: '',
        duration: '',
        description: ''
    });

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleResumeChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setResumeFile(file);
            } else {
                alert("Only PDF files are allowed for resumes.");
                e.target.value = null; // Reset input
            }
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('role', role);
            formData.append('mobileNumber', mobileNumber);
            formData.append('location', location);
            if (address) formData.append('address', address);

            if (role === 'recruiter') {
                formData.append('companyName', companyName);
                formData.append('designation', designation);
                if (logoFile) {
                    formData.append('logo', logoFile);
                }
            } else {
                // Education
                formData.append('Education[0].CollegeName', education.collegeName);
                if (education.degree) formData.append('Education[0].Degree', education.degree);
                if (education.specialization) formData.append('Education[0].Specialization', education.specialization);
                formData.append('Education[0].CompletionYear', education.completionYear);
                formData.append('Education[0].Grade', education.grade);

                // Work Experience
                if (hasExperience) {
                    formData.append('WorkExperience[0].CompanyName', experience.companyName);
                    formData.append('WorkExperience[0].Role', experience.role);
                    formData.append('WorkExperience[0].Duration', experience.duration);
                    if (experience.description) formData.append('WorkExperience[0].Description', experience.description);
                }

                // Resume
                if (resumeFile) {
                    formData.append('resume', resumeFile);
                }
            }

            await AuthService.register(formData);
            alert("Registration successful! Please login.");
            navigate('/login');
        } catch (error) {
            console.error(error);
            alert("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
                <h2 className="gradient-text" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
                    Create Account
                </h2>

                {/* Role Switcher */}
                <div style={{
                    display: 'flex',
                    background: 'var(--bg-secondary)',
                    padding: '4px',
                    borderRadius: '12px',
                    marginBottom: '2rem'
                }}>
                    <button
                        type="button"
                        onClick={() => setRole('applicant')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: role === 'applicant' ? 'var(--primary)' : 'transparent',
                            color: role === 'applicant' ? 'white' : 'var(--text-secondary)',
                            fontWeight: role === 'applicant' ? '600' : '400',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <User size={18} /> Applicant
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('recruiter')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            background: role === 'recruiter' ? 'var(--primary)' : 'transparent',
                            color: role === 'recruiter' ? 'white' : 'var(--text-secondary)',
                            fontWeight: role === 'recruiter' ? '600' : '400',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Briefcase size={18} /> Recruiter
                    </button>
                </div>

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="form-label">Mobile Number</label>
                            <input
                                type="tel"
                                placeholder="+1 234 567 890"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label className="form-label">{role === 'recruiter' ? 'Company Location' : 'Location'}</label>
                            <input
                                type="text"
                                placeholder={role === 'recruiter' ? "New York, USA" : "City, Country"}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {role === 'applicant' && (
                        <div>
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                placeholder="123 Main St, Apt 4B"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Recruiter Extra Fields */}
                    {role === 'recruiter' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Company Details</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Company Name</label>
                                    <input
                                        type="text"
                                        placeholder="Tech Corp"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Designation</label>
                                    <input
                                        type="text"
                                        placeholder="HR Manager"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Company Logo</label>
                                <div style={{
                                    border: '1px dashed var(--glass-border)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        id="logo-upload"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="logo-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        <Upload size={24} />
                                        <span>{logoFile ? logoFile.name : "Click to upload logo"}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applicant Extra Fields */}
                    {role === 'applicant' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Education Details</h3>
                            <div>
                                <label className="form-label">College Name</label>
                                <input
                                    type="text"
                                    placeholder="University of Technology"
                                    value={education.collegeName}
                                    onChange={(e) => setEducation({ ...education, collegeName: e.target.value })}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Degree</label>
                                    <input
                                        type="text"
                                        placeholder="B.Tech"
                                        value={education.degree}
                                        onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Specialization</label>
                                    <input
                                        type="text"
                                        placeholder="Computer Science"
                                        value={education.specialization}
                                        onChange={(e) => setEducation({ ...education, specialization: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Completion Year</label>
                                    <input
                                        type="number"
                                        placeholder="2024"
                                        value={education.completionYear}
                                        onChange={(e) => setEducation({ ...education, completionYear: e.target.value })}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">CGPA / Grade</label>
                                    <input
                                        type="text"
                                        placeholder="9.0"
                                        value={education.grade}
                                        onChange={(e) => setEducation({ ...education, grade: e.target.value })}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                                    <input
                                        type="checkbox"
                                        id="hasExperience"
                                        checked={hasExperience}
                                        onChange={(e) => setHasExperience(e.target.checked)}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="hasExperience" style={{ cursor: 'pointer', color: 'var(--text-primary)', fontWeight: '500' }}>
                                        I have work experience
                                    </label>
                                </div>

                                {hasExperience && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0.5rem', borderLeft: '2px solid var(--primary)' }}>
                                        <div>
                                            <label className="form-label">Company Name</label>
                                            <input
                                                type="text"
                                                placeholder="Tech Solutions Inc."
                                                value={experience.companyName}
                                                onChange={(e) => setExperience({ ...experience, companyName: e.target.value })}
                                                required={hasExperience}
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label className="form-label">Role</label>
                                                <input
                                                    type="text"
                                                    placeholder="Software Engineer Intern"
                                                    value={experience.role}
                                                    onChange={(e) => setExperience({ ...experience, role: e.target.value })}
                                                    required={hasExperience}
                                                    style={inputStyle}
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">Duration</label>
                                                <input
                                                    type="text"
                                                    placeholder="6 months"
                                                    value={experience.duration}
                                                    onChange={(e) => setExperience({ ...experience, duration: e.target.value })}
                                                    required={hasExperience}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label">Description</label>
                                            <textarea
                                                placeholder="Brief description of your responsibilities..."
                                                value={experience.description}
                                                onChange={(e) => setExperience({ ...experience, description: e.target.value })}
                                                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                <label className="form-label">Upload Resume (PDF only, Public)</label>
                                <div style={{
                                    border: '1px dashed var(--glass-border)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleResumeChange}
                                        id="resume-upload"
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="resume-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        <Upload size={24} />
                                        <span>{resumeFile ? resumeFile.name : "Click to upload Resume (PDF)"}</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : <>Sign Up <ChevronRight size={18} /></>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
                </p>
            </div>
            {loading && <HireLensLoader text="Creating Account..." subtext={role === 'recruiter' ? "Setting up your recruiter workspace..." : "Preparing your applicant profile..."} />}
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid var(--glass-border)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    outline: 'none'
};

export default Signup;
