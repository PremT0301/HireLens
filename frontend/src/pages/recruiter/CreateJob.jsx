import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, FileText, CheckCircle, Plus, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import JobService from '../../api/jobService';

const CreateJob = () => {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        department: '',
        type: 'Full-time',
        locationType: 'Remote',
        location: '',
        salaryMin: '',
        salaryMax: '',
        experienceRequired: 0, // NEW field
        description: '',
        requirements: []
    });

    const [newRequirement, setNewRequirement] = useState('');

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
            // Map frontend form to Backend DTO
            const jobDto = {
                title: formData.title,
                requiredSkills: formData.requirements.join(", "),
                experienceRequired: Number(formData.experienceRequired),
                salaryMin: Number(formData.salaryMin),
                salaryMax: Number(formData.salaryMax)
                // Note: Description, Location, Department are not yet supported by Backend Schema
            };

            await JobService.createJob(jobDto);

            addToast('Job posting created successfully!', 'success');
            navigate('/recruiter'); // Redirect to dashboard

        } catch (error) {
            console.error(error);
            addToast(error.message || "Failed to create job", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-transition" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
            <h1 className="title-lg" style={{ marginBottom: '0.5rem' }}>Create New Job</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>Post a new opening to find your next great hire.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Basic Info Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Briefcase size={20} className="text-primary" /> Basic Information
                    </h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Job Title</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                </div>

                {/* Location & Salary Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapPin size={20} className="text-primary" /> Location & Compensation
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
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={20} className="text-primary" /> Job Details
                    </h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Description</label>
                            <textarea
                                required
                                rows="6"
                                className="input-field"
                                placeholder="Describe the role, responsibilities, and company culture..."
                                style={{ resize: 'vertical' }}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">Key Requirements</label>
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

                            {formData.requirements.length > 0 && (
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0 }}>
                                    {formData.requirements.map((req, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                padding: '0.8rem 1rem',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '0.95rem'
                                            }}
                                        >
                                            <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <CheckCircle size={16} className="text-success" />
                                                {req}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRequirement(index)}
                                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </motion.li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="button" className="btn-ghost" style={{ padding: '0.8rem 2rem' }}>Cancel</button>
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ padding: '0.8rem 2.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Publishing...' : 'Publish Job'}
                    </button>
                </div>

            </form>

            <style>{`
                .label {
                    display: block;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }
                .input-field {
                    width: 100%;
                    padding: 0.8rem 1rem;
                    border-radius: 8px;
                    border: 1px solid var(--glass-border);
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input-field:focus {
                    border-color: var(--primary);
                }
                /* Custom Dropdown Arrow */
                select.input-field {
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23a0aec0%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem top 50%;
                    background-size: 0.65rem auto;
                }
            `}</style>
        </div>
    );
};

export default CreateJob;
