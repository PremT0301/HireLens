import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, Star, X, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applicantPlans, recruiterPlans, comparisonData } from '../data/pricingData';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(false);
    const [userType, setUserType] = useState('applicant'); // 'applicant' | 'recruiter'

    const currentPlans = userType === 'applicant' ? applicantPlans : recruiterPlans;

    const getPriceDisplay = (plan) => {
        if (plan.price === 'Custom') return 'Custom';

        if (typeof plan.price === 'string') {
            return plan.price; // e.g., '0'
        }

        // It's a monthly/annual object
        const monthlyRate = parseInt(plan.price.monthly.replace(',', ''));
        const annualRate = parseInt(plan.price.annual.replace(',', ''));

        if (isAnnual) {
            // Calculate yearly total: rate * 12
            const yearlyTotal = annualRate * 12;
            return yearlyTotal.toLocaleString();
        }

        return plan.price.monthly;
    };

    const getDurationLabel = (plan) => {
        if (plan.price === 'Custom') return plan.duration;
        if (plan.name === 'Explorer' || plan.name === 'Starter Recruiter') return plan.duration;

        return isAnnual ? 'year' : 'month';
    };

    return (
        <div className="page-transition aurora-bg" style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '100px' }}>
            <div className="container">
                {/* Hero section */}
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.div
                        key={`${userType}-hero`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                            Simple, Transparent <span className="gradient-text">Pricing</span>
                        </h1>
                        <p className="text-subtle" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                            {userType === 'applicant'
                                ? "Level up your career with AI-powered insights."
                                : "Scale hiring with intelligent AI infrastructure."}
                        </p>
                    </motion.div>

                    {/* Toggles Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                        {/* User Type Toggle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: 'var(--bg-secondary)',
                                padding: '0.5rem',
                                borderRadius: '100px',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setUserType('applicant')}
                                style={{
                                    padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                    background: userType === 'applicant' ? 'var(--primary)' : 'transparent',
                                    color: userType === 'applicant' ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.3s',
                                    zIndex: 1
                                }}
                            >
                                Applicant
                            </button>
                            <button
                                onClick={() => setUserType('recruiter')}
                                style={{
                                    padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                    background: userType === 'recruiter' ? 'var(--primary)' : 'transparent',
                                    color: userType === 'recruiter' ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.3s',
                                    zIndex: 1
                                }}
                            >
                                Recruiter
                            </button>
                        </motion.div>

                        {/* Billing Toggle */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '100px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                        >
                            <button
                                onClick={() => setIsAnnual(false)}
                                style={{
                                    padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                    background: !isAnnual ? 'var(--primary)' : 'transparent',
                                    color: !isAnnual ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setIsAnnual(true)}
                                style={{
                                    padding: '10px 24px', borderRadius: '100px', border: 'none', cursor: 'pointer', fontWeight: 600,
                                    background: isAnnual ? 'var(--primary)' : 'transparent',
                                    color: isAnnual ? 'white' : 'var(--text-secondary)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                Annual <span style={{ fontSize: '0.75rem', opacity: 0.8, color: isAnnual ? 'white' : 'var(--success)' }}>(-20%)</span>
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Pricing Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={userType + isAnnual}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '2.5rem',
                            marginBottom: '8rem'
                        }}
                    >
                        {currentPlans.map((plan, idx) => (
                            <motion.div
                                key={plan.name}
                                whileHover={{ y: -10 }}
                                className="glass-panel"
                                style={{
                                    padding: '3rem 2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2rem',
                                    border: plan.highlight ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                                    boxShadow: plan.highlight ? '0 0 30px rgba(37, 99, 235, 0.15)' : 'var(--shadow-md)',
                                    position: 'relative'
                                }}
                            >
                                {plan.highlight && (
                                    <div style={{
                                        position: 'absolute', top: '0', left: '50%', transform: 'translate(-50%, -50%)',
                                        background: 'var(--primary)', color: 'white', padding: '6px 20px', borderRadius: '100px',
                                        fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>
                                        Most Popular
                                    </div>
                                )}

                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>{plan.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                            {plan.price !== 'Custom' && '₹'}{getPriceDisplay(plan)}
                                        </span>
                                        {plan.price !== 'Custom' && (
                                            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                /{getDurationLabel(plan)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                                    {plan.features.map((feature, fIdx) => (
                                        <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                            <div style={{ marginTop: '4px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
                                                <Check size={10} strokeWidth={4} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                    {plan.notIncluded && plan.notIncluded.map((feature, fIdx) => (
                                        <div key={`not-${fIdx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '0.95rem', color: 'var(--text-subtle)', opacity: 0.6 }}>
                                            <div style={{ marginTop: '4px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', flexShrink: 0 }}>
                                                <X size={10} strokeWidth={3} />
                                            </div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                {plan.limitations && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        color: 'var(--text-secondary)',
                                        border: '1px dashed var(--border-color)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600 }}>
                                            <Info size={14} /> Limitations
                                        </div>
                                        <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                            {plan.limitations.map((limit, lIdx) => <li key={lIdx}>{limit}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <Link
                                    to={plan.ctaLink}
                                    className={plan.highlight ? 'btn-primary' : 'btn-nav-outline'}
                                    style={{
                                        textAlign: 'center', width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1.1rem',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {plan.btnText}
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Comparison Table */}
                <div style={{ marginBottom: '8rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
                            Compare <span className="gradient-text">Features</span>
                        </h2>
                        <p className="text-subtle">Choose the plan that's right for you</p>
                    </div>

                    <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Feature</th>
                                    {userType === 'applicant' ? (
                                        <>
                                            <th style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Explorer</th>
                                            <th style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>Pro</th>
                                            <th style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Elite</th>
                                        </>
                                    ) : (
                                        <>
                                            <th style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Starter</th>
                                            <th style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>Growth</th>
                                            <th style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>Enterprise</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData[userType].map((row, idx) => (
                                    <tr key={idx} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-primary)', fontWeight: 500 }}>{row.feature}</td>
                                        {userType === 'applicant' ? (
                                            <>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.explorer}</td>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>{row.pro}</td>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.elite}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.starter}</td>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>{row.growth}</td>
                                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.enterprise}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>
                            Common <span className="gradient-text">Questions</span>
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            {
                                question: "Can I cancel my subscription at any time?",
                                answer: "Yes, you can cancel your subscription at any time from your account settings. You will continue to have access until the end of your billing period."
                            },
                            {
                                question: "Is there a limit on resume uploads for the Pro plan?",
                                answer: "For Applicants, the Pro plan offers unlimited resume analyses. For Recruiters, limits depend on the specific tier of the Growth or Enterprise plan."
                            },
                            {
                                question: "Do you offer discounts for annual billing?",
                                answer: "Yes! We offer a 20% discount on all our paid plans when billed annually."
                            },
                            {
                                question: "How secure is my data on HireLens AI?",
                                answer: "We use enterprise-grade encryption and follow strict security protocols to ensure your data and your candidates' data is always protected."
                            }
                        ].map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * idx }}
                                className="glass-panel"
                                style={{ padding: '2rem' }}
                            >
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', gap: '10px' }}>
                                    <span style={{ color: 'var(--primary)' }}>Q:</span> {faq.question}
                                </h4>
                                <p className="text-subtle" style={{ lineHeight: 1.6, fontSize: '1rem', paddingLeft: '1.8rem' }}>{faq.answer}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
