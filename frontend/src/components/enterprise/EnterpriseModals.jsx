import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, Briefcase, Mail, Phone, Globe, MessageSquare, Tag, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const ModalWrapper = ({ isOpen, onClose, title, subtitle, children }) => {
    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="glass-panel"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: '700px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '3rem',
                        background: 'var(--bg-secondary)',
                        position: 'relative',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }}
                >
                    <button
                        onClick={onClose}
                        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>{title}</h2>
                        <p className="text-subtle" style={{ fontSize: '1.05rem', lineHeight: 1.5 }}>{subtitle}</p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
};

const SuccessView = ({ message }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '2rem 1rem' }}
    >
        <div style={{
            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(22, 163, 74, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--success)'
        }}>
            <CheckCircle2 size={40} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Request Submitted!</h3>
        <p className="text-subtle" style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>{message}</p>
    </motion.div>
);

const FormField = ({ label, icon: Icon, error, children }) => (
    <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{label}</label>
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', opacity: 0.6, pointerEvents: 'none' }}>
                <Icon size={18} />
            </div>
            {children}
        </div>
        {error && <span style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
);

export const ScheduleDemoModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '', email: '', company: '', companySize: '', jobTitle: '',
        country: '', phone: '', preferredDate: '', preferredTime: '',
        hiringVolume: '', message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.company.trim()) newErrors.company = "Company name is required";
        if (!formData.companySize) newErrors.companySize = "Select company size";
        if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.preferredDate) newErrors.preferredDate = "Select a date";
        else {
            const selectedDate = new Date(formData.preferredDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) newErrors.preferredDate = "Date cannot be in the past";
        }
        if (!formData.preferredTime) newErrors.preferredTime = "Select a time";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5033/api/enterprise/schedule-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsSuccess(true);
            }
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="Schedule a Demo with HireLens AI"
            subtitle="Tell us about your hiring needs and we will schedule a strategy call with our AI recruitment experts."
        >
            {isSuccess ? (
                <SuccessView message="Thank you! Our enterprise team will contact you within 24 hours." />
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Full Name *" icon={Users} error={errors.fullName}>
                            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Work Email *" icon={Mail} error={errors.email}>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" style={{ paddingLeft: '40px' }} />
                        </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Company Name *" icon={Briefcase} error={errors.company}>
                            <input name="company" value={formData.company} onChange={handleChange} placeholder="Acme Corp" style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Company Size *" icon={Tag} error={errors.companySize}>
                            <select name="companySize" value={formData.companySize} onChange={handleChange} style={{ paddingLeft: '40px' }}>
                                <option value="">Select Size</option>
                                <option value="1-10">1 - 10</option>
                                <option value="11-50">11 - 50</option>
                                <option value="51-200">51 - 200</option>
                                <option value="201-500">201 - 500</option>
                                <option value="500+">500+</option>
                            </select>
                        </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Job Title *" icon={Briefcase} error={errors.jobTitle}>
                            <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="HR Director" style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Country *" icon={Globe} error={errors.country}>
                            <input name="country" value={formData.country} onChange={handleChange} placeholder="United States" style={{ paddingLeft: '40px' }} />
                        </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Phone Number" icon={Phone}>
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Hiring Volume (Monthly)" icon={Tag}>
                            <select name="hiringVolume" value={formData.hiringVolume} onChange={handleChange} style={{ paddingLeft: '40px' }}>
                                <option value="">Select Volume</option>
                                <option value="1-10 hires">1 - 10 hires</option>
                                <option value="10-50 hires">10 - 50 hires</option>
                                <option value="50-200 hires">50 - 200 hires</option>
                                <option value="200+ hires">200+ hires</option>
                            </select>
                        </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Preferred Demo Date *" icon={Calendar} error={errors.preferredDate}>
                            <input name="preferredDate" type="date" value={formData.preferredDate} onChange={handleChange} style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Preferred Time *" icon={Clock} error={errors.preferredTime}>
                            <select name="preferredTime" value={formData.preferredTime} onChange={handleChange} style={{ paddingLeft: '40px' }}>
                                <option value="">Select Time</option>
                                <option value="Morning (9AM - 12PM)">Morning (9AM - 12PM)</option>
                                <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
                                <option value="Evening (4PM - 7PM)">Evening (4PM - 7PM)</option>
                            </select>
                        </FormField>
                    </div>

                    <FormField label="Message / Requirements" icon={MessageSquare}>
                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your specific needs..." rows={4} style={{ paddingLeft: '40px' }} />
                    </FormField>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '1rem' }}
                    >
                        {isSubmitting ? (
                            <>Submitting... <Loader2 size={18} className="spin" /></>
                        ) : (
                            <>Schedule My Demo <ChevronRight size={18} /></>
                        )}
                    </button>

                    <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </form>
            )}
        </ModalWrapper>
    );
};

export const ContactSalesModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '', email: '', company: '', jobTitle: '',
        country: '', phone: '', inquiryType: '', message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.company.trim()) newErrors.company = "Company name is required";
        if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
        if (!formData.country.trim()) newErrors.country = "Country is required";
        if (!formData.inquiryType) newErrors.inquiryType = "Select inquiry type";
        if (!formData.message.trim() || formData.message.length < 10) newErrors.message = "Message must be at least 10 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:5033/api/enterprise/contact-sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsSuccess(true);
            }
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="Talk to HireLens AI Sales Team"
            subtitle="Have questions about enterprise deployment, pricing, or integrations? Our team will help."
        >
            {isSuccess ? (
                <SuccessView message="Thank you! Our enterprise team will contact you within 24 hours." />
            ) : (
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Full Name *" icon={Users} error={errors.fullName}>
                            <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Work Email *" icon={Mail} error={errors.email}>
                            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" style={{ paddingLeft: '40px' }} />
                        </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Company Name *" icon={Briefcase} error={errors.company}>
                            <input name="company" value={formData.company} onChange={handleChange} placeholder="Acme Corp" style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Job Title *" icon={Briefcase} error={errors.jobTitle}>
                            <input name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="HR Director" style={{ paddingLeft: '40px' }} />
                        </FormField>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <FormField label="Country *" icon={Globe} error={errors.country}>
                            <input name="country" value={formData.country} onChange={handleChange} placeholder="United States" style={{ paddingLeft: '40px' }} />
                        </FormField>
                        <FormField label="Phone Number" icon={Phone}>
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" style={{ paddingLeft: '40px' }} />
                        </FormField>
                    </div>

                    <FormField label="Inquiry Type *" icon={Tag} error={errors.inquiryType}>
                        <select name="inquiryType" value={formData.inquiryType} onChange={handleChange} style={{ paddingLeft: '40px' }}>
                            <option value="">Select Type</option>
                            <option value="Pricing">Pricing</option>
                            <option value="Enterprise Deployment">Enterprise Deployment</option>
                            <option value="Integration">Integration</option>
                            <option value="Security & Compliance">Security & Compliance</option>
                            <option value="Other">Other</option>
                        </select>
                    </FormField>

                    <FormField label="Message *" icon={MessageSquare} error={errors.message}>
                        <textarea name="message" value={formData.message} onChange={handleChange} placeholder="How can we help you?" rows={4} style={{ paddingLeft: '40px' }} />
                    </FormField>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '1rem' }}
                    >
                        {isSubmitting ? (
                            <>Submitting... <Loader2 size={18} className="spin" /></>
                        ) : (
                            <>Contact Sales <ChevronRight size={18} /></>
                        )}
                    </button>

                    <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </form>
            )}
        </ModalWrapper>
    );
};
