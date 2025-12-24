import React, { useState } from 'react';
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

    // Recruiter Fields
    const [companyName, setCompanyName] = useState('');
    const [designation, setDesignation] = useState('');
    const [logoFile, setLogoFile] = useState(null);

    // Applicant Fields
    const [collegeName, setCollegeName] = useState('');
    const [completionYear, setCompletionYear] = useState('');
    const [grade, setGrade] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setLogoFile(e.target.files[0]);
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

            if (role === 'recruiter') {
                formData.append('companyName', companyName);
                formData.append('designation', designation);
                if (logoFile) {
                    formData.append('logo', logoFile);
                }
            } else {
                formData.append('collegeName', collegeName);
                formData.append('completionYear', completionYear);
                formData.append('grade', grade);
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
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
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

                    {/* Recruiter Extra Fields */}
                    {role === 'recruiter' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--primary)' }}>Company Details</h3>

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
                                    value={collegeName}
                                    onChange={(e) => setCollegeName(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Completion Year</label>
                                    <input
                                        type="number"
                                        placeholder="2024"
                                        value={completionYear}
                                        onChange={(e) => setCompletionYear(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Grade (CGPA/GPA)</label>
                                    <input
                                        type="text"
                                        placeholder="9.0"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
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
