import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, MapPin, IndianRupee, FileText, CheckCircle, Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import JobService from '../../api/jobService';

const CreateJob = () => {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { jobId } = useParams();
    const isEditMode = !!jobId;

    const [formData, setFormData] = useState({
        title: '',
        department: '',
        type: 'Full-time',
        locationType: 'Remote',
        location: '',
        salaryMin: '',
        salaryMax: '',
        experienceRequired: 0,

        numberOfOpenings: 1,
        description: '',

        // New Fields
        roleOverview: '',
        keyResponsibilities: '',
        technologies: '',
        experienceMin: 0,
        experienceMax: 0,
        perksAndBenefits: '',
        growthOpportunities: '',
        assessmentRequired: false,
        assessmentType: 'Test',
        interviewRounds: ['HR Round'],
        interviewMode: 'Online',
        mandatorySkills: [] // { skillName, category, proficiencyLevel, weight }
    });



    const [newSkill, setNewSkill] = useState({ skillName: '', category: 'Technical', proficiencyLevel: 'Intermediate', weight: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const fetchJob = async () => {
                setLoading(true);
                try {
                    const job = await JobService.getJobById(jobId);
                    setFormData({
                        title: job.title,
                        department: job.department || '',
                        type: job.employmentType || 'Full-time',
                        locationType: job.locationType || 'Remote',
                        location: job.location || '',
                        salaryMin: job.salaryMin || '',
                        salaryMax: job.salaryMax || '',
                        experienceRequired: job.experienceRequired,

                        numberOfOpenings: job.numberOfOpenings || 1,
                        description: job.description || '',

                        roleOverview: job.roleOverview || '',
                        keyResponsibilities: job.keyResponsibilities || '',
                        technologies: job.technologies || '',
                        experienceMin: job.experienceMin || 0,
                        experienceMax: job.experienceMax || 0,
                        perksAndBenefits: job.perksAndBenefits || '',
                        growthOpportunities: job.growthOpportunities || '',
                        assessmentRequired: job.assessmentRequired || false,
                        assessmentType: job.assessmentType || 'Test',
                        interviewRounds: job.interviewRounds ? JSON.parse(job.interviewRounds) : ['HR Round'],
                        interviewMode: job.interviewMode || 'Online',
                        mandatorySkills: job.mandatorySkills || []
                    });
                } catch (error) {
                    console.error("Failed to load job", error);
                    addToast("Failed to load job details", 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchJob();
        }
    }, [isEditMode, jobId]);

    const handleAddSkill = (e) => {
        e.preventDefault();
        if (newSkill.skillName.trim() && newSkill.weight > 0) {
            setFormData({
                ...formData,
                mandatorySkills: [...formData.mandatorySkills, { ...newSkill, weight: Number(newSkill.weight) }]
            });
            setNewSkill({ skillName: '', category: 'Technical', proficiencyLevel: 'Intermediate', weight: 0 });
        } else {
            addToast('Please enter a skill name and a valid weight > 0', 'error');
        }
    };

    const handleRemoveSkill = (index) => {
        const updatedSkills = formData.mandatorySkills.filter((_, i) => i !== index);
        setFormData({ ...formData, mandatorySkills: updatedSkills });
    };

    const handleAddRound = () => {
        setFormData({
            ...formData,
            interviewRounds: [...formData.interviewRounds, 'New Round']
        });
    }

    const handleRoundChange = (index, value) => {
        const updatedRounds = [...formData.interviewRounds];
        updatedRounds[index] = value;
        setFormData({ ...formData, interviewRounds: updatedRounds });
    };

    const handleRemoveRound = (index) => {
        const updatedRounds = formData.interviewRounds.filter((_, i) => i !== index);
        setFormData({ ...formData, interviewRounds: updatedRounds });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate Weights
            const totalWeight = formData.mandatorySkills.reduce((acc, curr) => acc + curr.weight, 0);
            if (formData.mandatorySkills.length > 0 && totalWeight !== 100) {
                addToast(`Total skill weight must be 100%. Current: ${totalWeight}%`, 'error');
                setIsSubmitting(false);
                return;
            }

            const jobDto = {
                title: formData.title,
                experienceRequired: Number(formData.experienceMin), // Legacy support
                numberOfOpenings: Number(formData.numberOfOpenings),
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
                description: formData.description,
                department: formData.department,
                employmentType: formData.type,
                location: formData.location,
                locationType: formData.locationType,

                // New Fields
                roleOverview: formData.roleOverview,
                keyResponsibilities: formData.keyResponsibilities,
                technologies: formData.technologies,
                experienceMin: Number(formData.experienceMin),
                experienceMax: Number(formData.experienceMax),
                perksAndBenefits: formData.perksAndBenefits,
                growthOpportunities: formData.growthOpportunities,
                assessmentRequired: formData.assessmentRequired,
                assessmentType: formData.assessmentType,
                interviewRounds: JSON.stringify(formData.interviewRounds),
                interviewMode: formData.interviewMode,
                mandatorySkills: formData.mandatorySkills
            };



            if (isEditMode) {
                await JobService.updateJob(jobId, jobDto);
                addToast('Job posting updated successfully!', 'success');
            } else {
                await JobService.createJob(jobDto);
                addToast('Job posting created successfully!', 'success');
            }

            navigate('/recruiter/dashboard');

        } catch (error) {
            console.error(error);
            addToast(error.message || "Failed to create job", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container page-transition" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem', paddingTop: '2rem' }}>



            <div style={{ marginBottom: '3rem' }}>
                <h1 className="title-lg" style={{ marginBottom: '0.5rem' }}>{isEditMode ? 'Edit Job Posting' : 'Post a New Job'}</h1>
                <p className="text-subtle">{isEditMode ? 'Update the details of your job listing.' : 'Create a detailed job listing to attract the best talent.'}</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Basic Info Section */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}>
                            <Briefcase size={20} />
                        </div>
                        Basic Information
                    </h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Job Title <span style={{ color: 'var(--error)' }}>*</span></label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                            <p className="helper-text">The public title of the role as it will appear to candidates.</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                            <div>
                                <label className="label">Department</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="e.g. Engineering"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Experience Range (Years)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        required
                                        className="input-field"
                                        placeholder="Min"
                                        value={formData.experienceMin}
                                        onChange={e => setFormData({ ...formData, experienceMin: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        required
                                        className="input-field"
                                        placeholder="Max"
                                        value={formData.experienceMax}
                                        onChange={e => setFormData({ ...formData, experienceMax: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="label">Openings</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    className="input-field"
                                    placeholder="1"
                                    value={formData.numberOfOpenings}
                                    onChange={e => setFormData({ ...formData, numberOfOpenings: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="label">Employment Type</label>
                                <select
                                    className="input-field"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* New Section: Role Details */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '8px', color: 'var(--accent)' }}>
                            <FileText size={20} />
                        </div>
                        Role Details
                    </h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Role Overview</label>
                            <textarea
                                required
                                rows="3"
                                className="input-field"
                                placeholder="Short 2-3 line summary of the role..."
                                value={formData.roleOverview}
                                onChange={e => setFormData({ ...formData, roleOverview: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Key Responsibilities (Detailed)</label>
                            <textarea
                                required
                                rows="4"
                                className="input-field"
                                placeholder="List user duties..."
                                value={formData.keyResponsibilities}
                                onChange={e => setFormData({ ...formData, keyResponsibilities: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Technologies / Tools</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="React, Node.js, AWS..."
                                value={formData.technologies}
                                onChange={e => setFormData({ ...formData, technologies: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* New Section: Skills & Matching */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                            <CheckCircle size={20} />
                        </div>
                        Skills & Matching (Total Weight must be 100%)
                    </h3>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                        <div style={{ flex: 2 }}>
                            <label className="label">Skill Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Python"
                                value={newSkill.skillName}
                                onChange={e => setNewSkill({ ...newSkill, skillName: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">Category</label>
                            <select
                                className="input-field"
                                value={newSkill.category}
                                onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                            >
                                <option>Technical</option>
                                <option>Domain</option>
                                <option>Soft</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label">Level</label>
                            <select
                                className="input-field"
                                value={newSkill.proficiencyLevel}
                                onChange={e => setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })}
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                        <div style={{ flex: 0.5 }}>
                            <label className="label">Wt (%)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="20"
                                value={newSkill.weight}
                                onChange={e => setNewSkill({ ...newSkill, weight: e.target.value })}
                            />
                        </div>
                        <button type="button" className="btn-primary" onClick={handleAddSkill} style={{ height: '46px' }}>
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Skills Table */}
                    {formData.mandatorySkills.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '12px' }}>Skill</th>
                                        <th style={{ padding: '12px' }}>Category</th>
                                        <th style={{ padding: '12px' }}>Level</th>
                                        <th style={{ padding: '12px' }}>Weight</th>
                                        <th style={{ padding: '12px' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.mandatorySkills.map((skill, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '12px' }}>{skill.skillName}</td>
                                            <td style={{ padding: '12px' }}>{skill.category}</td>
                                            <td style={{ padding: '12px' }}>{skill.proficiencyLevel}</td>
                                            <td style={{ padding: '12px' }}>{skill.weight}%</td>
                                            <td style={{ padding: '12px' }}>
                                                <button type="button" onClick={() => handleRemoveSkill(idx)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <X size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr style={{ background: 'var(--bg-secondary)', fontWeight: 'bold' }}>
                                        <td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>Total Weight:</td>
                                        <td style={{ padding: '12px', color: formData.mandatorySkills.reduce((a, b) => a + b.weight, 0) === 100 ? 'var(--success)' : 'var(--error)' }}>
                                            {formData.mandatorySkills.reduce((a, b) => a + b.weight, 0)}%
                                        </td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* New Section: Compensation & Benefits */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
                            <IndianRupee size={20} />
                        </div>
                        Compensation & Benefits
                    </h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Perks & Benefits</label>
                            <textarea
                                className="input-field"
                                rows="3"
                                placeholder="Health Insurance, Remote Work, Gym..."
                                value={formData.perksAndBenefits}
                                onChange={e => setFormData({ ...formData, perksAndBenefits: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="label">Growth Opportunities</label>
                            <textarea
                                className="input-field"
                                rows="3"
                                placeholder="Mentorship, career path..."
                                value={formData.growthOpportunities}
                                onChange={e => setFormData({ ...formData, growthOpportunities: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                {/* New Section: Hiring Process */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', color: 'var(--info)' }}>
                            <Briefcase size={20} />
                        </div>
                        Hiring Process
                    </h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="assessment"
                                checked={formData.assessmentRequired}
                                onChange={e => setFormData({ ...formData, assessmentRequired: e.target.checked })}
                                style={{ width: '20px', height: '20px' }}
                            />
                            <label htmlFor="assessment" className="label" style={{ marginBottom: 0 }}>Assessment Required?</label>
                        </div>

                        {formData.assessmentRequired && (
                            <div>
                                <label className="label">Assessment Type</label>
                                <select
                                    className="input-field"
                                    value={formData.assessmentType}
                                    onChange={e => setFormData({ ...formData, assessmentType: e.target.value })}
                                >
                                    <option>Test</option>
                                    <option>Assignment</option>
                                    <option>Task</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="label">Interview Mode</label>
                            <select
                                className="input-field"
                                value={formData.interviewMode}
                                onChange={e => setFormData({ ...formData, interviewMode: e.target.value })}
                            >
                                <option>Online</option>
                                <option>In-person</option>
                                <option>Hybrid</option>
                            </select>
                        </div>

                        <div>
                            <label className="label">Interview Rounds</label>
                            {formData.interviewRounds.map((round, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={round}
                                        onChange={e => handleRoundChange(idx, e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleRemoveRound(idx)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="btn-secondary" onClick={handleAddRound} style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                + Add Round
                            </button>
                        </div>
                    </div>
                </section>

                {/* Details Section (Updated Layout) */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
                            <FileText size={20} />
                        </div>
                        Job Description (Formatting)
                    </h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Description</label>
                            <textarea
                                required
                                rows="6"
                                className="input-field"
                                placeholder="Describe the role, responsibilities, and company culture..."
                                style={{ resize: 'vertical', minHeight: '150px' }}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </section>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn-ghost" style={{ padding: '1rem 2.5rem', border: '1px solid var(--border-color)' }}>Cancel</button>
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '1rem 3rem', opacity: isSubmitting ? 0.7 : 1 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Job' : 'Publish Job')}
                    </button>
                </div>

            </form>

            <style>{`
                .label {
                    display: block;
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .helper-text {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-top: 0.4rem;
                }
                .input-field {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.2s;
                    font-family: var(--font-main);
                }
                .input-field:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px var(--primary-light);
                }
                /* Custom Dropdown Arrow */
                select.input-field {
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22gray%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem top 50%;
                    background-size: 0.65rem auto;
                }
            `}</style>
        </div>
    );
};

export default CreateJob;
