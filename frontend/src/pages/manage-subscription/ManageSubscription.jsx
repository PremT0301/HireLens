import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

// New Components
import CurrentPlanCard from '../../components/subscription/CurrentPlanCard';
import PricingPlans from '../../components/subscription/PricingPlans';
import BillingManagement from '../../components/subscription/BillingManagement';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ManageSubscription = () => {
    const { user, updatePlan } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const userRole = (user?.role || 'Applicant').toLowerCase();
    const currentPlan = user?.plan || 'FREE';

    // Plan Data
    const applicantPlans = [
        {
            name: 'FREE',
            price: '₹0',
            description: 'Basic tools for job seekers to get started.',
            features: ['Limited job applications', 'Basic AI resume analysis', 'Basic dashboard']
        },
        {
            name: 'PRO',
            price: '₹999',
            description: 'Most popular for serious job seekers.',
            features: ['Unlimited job applications', 'AI skill gap analysis', 'AI job recommendations', 'Interview Copilot']
        },
        {
            name: 'ELITE+PLUS',
            price: '₹2,499',
            description: 'Maximum visibility and advanced AI insights.',
            features: ['Unlimited AI Copilot', 'Advanced ATS score insights', 'Priority recruiter visibility', 'Premium AI recommendations']
        }
    ];

    const recruiterPlans = [
        {
            name: 'FREE',
            price: '₹0',
            description: 'Basic hiring tools for small teams.',
            features: ['Limited job postings', 'Basic candidate search', 'Limited dashboard analytics']
        },
        {
            name: 'PRO',
            price: '₹1,999',
            description: 'Advanced tools for active recruiters.',
            features: ['Unlimited job postings', 'Candidate ranking system', 'AI resume matching', 'Talent pool access']
        },
        {
            name: 'ELITE+PLUS',
            price: '₹4,999',
            description: 'Full suite of AI-powered hiring tools.',
            features: ['Advanced hiring analytics', 'AI Copilot hiring assistant', 'Priority candidate ranking', 'Premium recruiter insights']
        }
    ];

    const plans = userRole === 'recruiter' ? recruiterPlans : applicantPlans;

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await api.get('/subscription/current');
                setSubscriptionData(response.data);
            } catch (error) {
                console.error("Failed to fetch subscription", error);
                setSubscriptionData({
                    expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
                });
            }
        };
        fetchSubscription();
    }, []);

    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
    const [pendingPlan, setPendingPlan] = useState(null);

    const handlePlanAction = async (planName) => {
        const planOrder = { 'FREE': 0, 'PRO': 1, 'ELITE+PLUS': 2 };
        const currentOrder = planOrder[currentPlan] || 0;
        const targetOrder = planOrder[planName];

        if (targetOrder > currentOrder) {
            setLoading(true);
            setTimeout(() => {
                updatePlan(planName);
                setSuccessMessage('Upgrade Successful!');
                setShowSuccessOverlay(true);
                addToast(`Successfully upgraded to ${planName.replace('_', '+')}`, "success");
                setLoading(false);
                setTimeout(() => setShowSuccessOverlay(false), 3000);
            }, 1500);
        } else if (planName === 'FREE') {
            setIsCancelModalOpen(true);
        } else {
            setPendingPlan(planName);
            setIsSwitchModalOpen(true);
        }
    };

    const confirmPlanSwitch = () => {
        addToast("Change scheduled. Your plan will update at the end of the billing cycle.", "info");
        setIsSwitchModalOpen(false);
    };

    const handleConfirmCancel = () => {
        setLoading(true);
        setIsCancelModalOpen(false);
        setTimeout(() => {
            updatePlan('FREE');
            addToast("Subscription cancelled. Your account will move to the Free plan at the end of the billing cycle.", "success");
            setLoading(false);
        }, 1500);
    };

    const renewalDate = subscriptionData?.expiry
        ? new Date(subscriptionData.expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'March 4, 2026';

    const currentPlanDetails = plans.find(p => p.name === currentPlan) || plans[0];

    return (
        <div className="manage-subscription-wrapper">
            <div className="manage-subscription-content">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <button onClick={() => navigate(-1)} className="back-link">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </motion.div>

                <div className="page-header">
                    <div>
                        <h1 className="page-title">Manage Subscription</h1>
                        <p className="page-subtitle">Manage your plan, billing, and payment methods.</p>
                    </div>
                    {currentPlan !== 'FREE' && (
                        <div className="pro-badge-top">
                            <Sparkles size={14} />
                            Premium Member
                        </div>
                    )}
                </div>

                {/* Section 1: Current Plan */}
                <CurrentPlanCard
                    planName={currentPlan.replace('_', '+')}
                    price={currentPlanDetails.price}
                    expiryDate={renewalDate}
                    onCancel={() => setIsCancelModalOpen(true)}
                />

                {/* Section 2: Pricing Plans */}
                <PricingPlans
                    plans={plans}
                    currentPlan={currentPlan}
                    onPlanAction={handlePlanAction}
                />

                {/* Section 3: Billing Management */}
                <BillingManagement />
            </div>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                type="danger"
                title="Cancel Subscription?"
                message="Your subscription will remain active until the end of the billing cycle. After cancellation, your account will move to the Free plan."
                confirmText="Confirm Cancellation"
                cancelText="Keep Plan"
                loading={loading}
            />

            <ConfirmModal
                isOpen={isSwitchModalOpen}
                onClose={() => setIsSwitchModalOpen(false)}
                onConfirm={confirmPlanSwitch}
                type="info"
                title="Switch Plan?"
                message={`Are you sure you want to switch to ${pendingPlan}? Changes will take effect at the end of your billing cycle.`}
                confirmText={`Switch to ${pendingPlan}`}
                cancelText="Not Now"
            />

            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccessOverlay && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="success-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="success-modal"
                        >
                            <div className="success-icon-container">
                                <CheckCircle2 size={48} color="white" />
                            </div>
                            <h2>{successMessage}</h2>
                            <p>You now have access to all premium features.</p>
                            <button onClick={() => setShowSuccessOverlay(false)} className="success-close-btn">
                                Great, let's go!
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading && (
                <div className="global-loader">
                    <div className="spinner"></div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .manage-subscription-wrapper {
                    min-height: 100vh;
                    background-color: #fcfcfd;
                    padding: 48px 24px;
                }
                .manage-subscription-content {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .back-link {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 32px;
                    padding: 0;
                    transition: color 0.2s;
                }
                .back-link:hover { color: #0f172a; }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-bottom: 48px;
                }
                .page-title {
                    font-size: 36px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                .page-subtitle {
                    font-size: 16px;
                    color: #64748b;
                }
                .pro-badge-top {
                    background: #eff6ff;
                    color: #2563eb;
                    padding: 8px 16px;
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border: 1px solid #dbeafe;
                }

                /* Overlays and Modals */
                .success-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .success-modal {
                    background: white;
                    border-radius: 24px;
                    padding: 48px;
                    text-align: center;
                    max-width: 400px;
                    width: 100%;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.2);
                }
                .success-icon-container {
                    width: 96px;
                    height: 96px;
                    background: #2563eb;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 32px;
                    box-shadow: 0 0 40px rgba(37, 99, 235, 0.4);
                }
                .success-modal h2 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 12px;
                }
                .success-modal p {
                    color: #64748b;
                    margin-bottom: 32px;
                }
                .success-close-btn {
                    width: 100%;
                    padding: 14px;
                    background: #0f172a;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .success-close-btn:hover { background: #1e293b; transform: translateY(-2px); }

                .global-loader {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 2100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f1f5f9;
                    border-top: 4px solid #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                    }
                    .page-title { font-size: 28px; }
                }
            `}} />
        </div>
    );
};

export default ManageSubscription;
