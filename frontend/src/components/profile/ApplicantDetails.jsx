import React, { useState } from 'react';
import { FileText, Briefcase, GraduationCap, DollarSign, Clock, Code, X } from 'lucide-react';

const ApplicantDetails = ({ formData, onChange, onFileChange }) => {
    const [skillInput, setSkillInput] = useState('');
    const skills = formData.skills ? formData.skills.split(',').filter(s => s.trim() !== '') : [];

    const handleAddSkill = (e) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            const newSkills = [...skills, skillInput.trim()];
            onChange({ target: { name: 'skills', value: newSkills.join(',') } });
            setSkillInput('');
        } else if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
            const newSkills = skills.slice(0, -1);
            onChange({ target: { name: 'skills', value: newSkills.join(',') } });
        }
    };

    const removeSkill = (indexToRemove) => {
        const newSkills = skills.filter((_, index) => index !== indexToRemove);
        onChange({ target: { name: 'skills', value: newSkills.join(',') } });
    };

    return (
        <div className="profile-card">
            <h3 className="card-title"><FileText size={20} /> Role-Specific Details</h3>
            <div className="form-grid">
                <div className="form-group full-width">
                    <label>Resume Upload</label>
                    <div
                        className="custom-file-uploader"
                        onClick={() => document.getElementById('resume-input').click()}
                    >
                        <input
                            type="file"
                            id="resume-input"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => onFileChange(e.target.files[0], 'resume')}
                            style={{ display: 'none' }}
                        />
                        <div className="upload-icon-wrapper">
                            <FileText size={24} />
                        </div>
                        <p className="upload-text">
                            {formData.resumeName || 'Click to upload or drag and drop'}
                        </p>
                        <p className="upload-hint">PDF, DOCX (Max 5MB)</p>
                    </div>
                </div>

                <div className="form-group full-width">
                    <label><Code size={16} /> Technical Skills</label>
                    <div className="skill-tags-input-wrapper">
                        {skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                                <X
                                    size={14}
                                    className="skill-tag-remove"
                                    onClick={() => removeSkill(index)}
                                />
                            </span>
                        ))}
                        <input
                            type="text"
                            className="skill-input-phantom"
                            placeholder={skills.length === 0 ? "Type a skill and press Enter..." : ""}
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleAddSkill}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label><Briefcase size={16} /> Experience (Years)</label>
                    <input
                        type="number"
                        name="experienceYears"
                        value={formData.experienceYears || 0}
                        onChange={onChange}
                    />
                </div>
                <div className="form-group">
                    <label><GraduationCap size={16} /> Preferred Roles</label>
                    <input
                        type="text"
                        name="preferredRole"
                        value={formData.preferredRole || ''}
                        onChange={onChange}
                        placeholder="e.g. AI Engineer"
                    />
                </div>
                <div className="form-group">
                    <label><DollarSign size={16} /> Expected Salary ($)</label>
                    <input
                        type="number"
                        name="expectedSalary"
                        value={formData.expectedSalary || ''}
                        onChange={onChange}
                        placeholder="Annual"
                    />
                </div>
                <div className="form-group">
                    <label><Clock size={16} /> Availability</label>
                    <select name="availability" value={formData.availability || ''} onChange={onChange}>
                        <option value="">Select Status</option>
                        <option value="Immediate">Immediate</option>
                        <option value="1 Month">1 Month</option>
                        <option value="2 Months">2 Months</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ApplicantDetails;
