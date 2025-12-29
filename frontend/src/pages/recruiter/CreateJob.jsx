import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, FileText, CheckCircle, Plus, X, ChevronLeft } from 'lucide-react';
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
        experienceRequired: 0,
        numberOfOpenings: 1,
        description: '',
        requirements: []
    });



    const [newRequirement, setNewRequirement] = useState('');
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
                        experienceRequired: job.experienceRequired,
                        numberOfOpenings: job.numberOfOpenings || 1,
                        description: job.description || '',
                        requirements: job.requiredSkills ? job.requiredSkills.split(',').map(s => s.trim()) : []
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

    const handleAddRequirement = (e) => {
        e.preventDefault();
        if (newRequirement.trim()) {
            setFormData({
                ...formData,
                requirements: [...formData.requirements, newRequirement.trim()]
            });
            setNewRequirement('');
        }
    };

    const handleRemoveRequirement = (index) => {
        const updatedReqs = formData.requirements.filter((_, i) => i !== index);
        setFormData({ ...formData, requirements: updatedReqs });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const jobDto = {
                title: formData.title,
                requiredSkills: formData.requirements.join(", "),
                experienceRequired: Number(formData.experienceRequired),
                numberOfOpenings: Number(formData.numberOfOpenings),
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax),
                description: formData.description,
                department: formData.department,
                employmentType: formData.type,
                location: formData.location,
                locationType: formData.locationType
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

            <button
                onClick={() => navigate('/recruiter/dashboard')}
                className="btn-ghost"
                style={{ marginBottom: '2rem', paddingLeft: 0 }}
            >
                <ChevronLeft size={20} /> Back to Dashboard
            </button>

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
                                <label className="label">Experience (Years)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    required
                                    className="input-field"
                                    placeholder="e.g. 5"
                                    value={formData.experienceRequired}
                                    onChange={e => setFormData({ ...formData, experienceRequired: e.target.value })}
                                />
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

                {/* Location & Comp Section */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
                            <MapPin size={20} />
                        </div>
                        Location & Compensation
                    </h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                            <div>
                                <label className="label">Workplace Type</label>
                                <select
                                    className="input-field"
                                    value={formData.locationType}
                                    onChange={e => setFormData({ ...formData, locationType: e.target.value })}
                                >
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="On-site">On-site</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Location</label>
                                <input
                                    type="text"
                                    required={formData.locationType !== 'Remote'}
                                    className="input-field"
                                    placeholder={formData.locationType === 'Remote' ? "Remote (or 'Global')" : "e.g. San Francisco, CA"}
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label">Salary Range (Annual)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ paddingLeft: '35px' }}
                                        placeholder="Min"
                                        value={formData.salaryMin}
                                        onChange={e => setFormData({ ...formData, salaryMin: e.target.value })}
                                    />
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ paddingLeft: '35px' }}
                                        placeholder="Max"
                                        value={formData.salaryMax}
                                        onChange={e => setFormData({ ...formData, salaryMax: e.target.value })}
                                    />
                                </div>
                            </div>
                            <p className="helper-text">Leave blank if you prefer not to disclose salary upfront.</p>
                        </div>
                    </div>
                </section>

                {/* Details Section */}
                <section className="glass-panel" style={{ padding: '2.5rem' }}>
                    <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem' }}>
                        <div style={{ padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
                            <FileText size={20} />
                        </div>
                        Job Details
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

                        <div>
                            <label className="label">Key Requirements / Skills</label>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Add a requirement (e.g. 5+ years React experience)"
                                    value={newRequirement}
                                    onChange={e => setNewRequirement(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleAddRequirement(e)}
                                />
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleAddRequirement}
                                    style={{ padding: '0 1.2rem' }}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {formData.requirements.length > 0 ? (
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0 }}>
                                    {formData.requirements.map((req, index) => (
                                        <li
                                            key={index}
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                padding: '0.8rem 1rem',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <CheckCircle size={18} className="text-success" />
                                                {req}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRequirement(index)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                                            >
                                                <X size={18} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                                    No requirements added yet. Add skills to help with matching.
                                </div>
                            )}
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
