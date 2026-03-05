import React from 'react';
import { Building2, Globe, Users, Factory, Target, Info } from 'lucide-react';

const RecruiterDetails = ({ formData, onChange }) => {
    return (
        <div className="profile-card">
            <h3 className="card-title"><Building2 size={20} /> Recruitment Profile</h3>
            <div className="form-grid">
                <div className="form-group">
                    <label><Building2 size={14} /> Company Name</label>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={onChange}
                        placeholder="Company Name"
                    />
                </div>
                <div className="form-group">
                    <label><Globe size={14} /> Company Website</label>
                    <input
                        type="url"
                        name="companyWebsite"
                        value={formData.companyWebsite || ''}
                        onChange={onChange}
                        placeholder="https://..."
                    />
                </div>
                <div className="form-group">
                    <label><Users size={14} /> Company Size</label>
                    <select name="companySize" value={formData.companySize || ''} onChange={onChange}>
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 Employees</option>
                        <option value="11-50">11-50 Employees</option>
                        <option value="51-200">21-200 Employees</option>
                        <option value="201-500">201-500 Employees</option>
                        <option value="500+">500+ Employees</option>
                    </select>
                </div>
                <div className="form-group">
                    <label><Factory size={14} /> Industry</label>
                    <input
                        type="text"
                        name="industry"
                        value={formData.industry || ''}
                        onChange={onChange}
                        placeholder="e.g. Technology"
                    />
                </div>
                <div className="form-group full-width">
                    <label><Target size={14} /> Hiring Focus</label>
                    <input
                        type="text"
                        name="hiringFocus"
                        value={formData.hiringFocus || ''}
                        onChange={onChange}
                        placeholder="e.g. AI Experts, Fullstack Engineers"
                    />
                </div>
                <div className="form-group full-width">
                    <label><Info size={14} /> About the Company</label>
                    <textarea
                        name="companyDescription"
                        value={formData.companyDescription || ''}
                        onChange={onChange}
                        placeholder="Tell candidates about your company culture and mission..."
                        rows={4}
                    />
                </div>
            </div>
        </div>
    );
};

export default RecruiterDetails;
