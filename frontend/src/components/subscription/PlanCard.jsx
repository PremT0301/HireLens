import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const PlanCard = ({ plan, isCurrent, onAction, isPopular }) => {
    return (
        <motion.div
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={`plan-card ${isPopular ? 'plan-popular' : ''} ${isCurrent ? 'plan-current' : ''}`}
        >
            {isPopular && (
                <div className="popular-ribbon">
                    <Sparkles size={14} />
                    Most Popular
                </div>
            )}

            <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                    <span className="currency">₹</span>
                    <span className="amount">{plan.price.replace('₹', '')}</span>
                    <span className="duration">/mo</span>
                </div>
                <p className="plan-desc">{plan.description}</p>
            </div>

            <div className="features-list">
                {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                        <div className="check-icon">
                            <Check size={14} />
                        </div>
                        <span className="feature-text">{feature}</span>
                    </div>
                ))}
            </div>

            <button
                onClick={() => onAction(plan.name)}
                className={`plan-btn ${isCurrent ? 'current-btn' : isPopular ? 'popular-btn' : 'secondary-btn'}`}
                disabled={isCurrent}
            >
                {isCurrent ? 'Current Plan' : 'Get Started'}
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                .plan-card {
                    background: white;
                    border-radius: 20px;
                    padding: 32px;
                    border: 1px solid #e5e7eb;
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    position: relative;
                    transition: all 0.2s ease;
                }
                .plan-popular {
                    border: 2px solid #2563eb;
                    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.08);
                }
                .popular-ribbon {
                    position: absolute;
                    top: -14px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #2563eb;
                    color: white;
                    padding: 6px 16px;
                    border-radius: 100px;
                    font-size: 13px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }
                .plan-name {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 16px;
                }
                .plan-price {
                    display: flex;
                    align-items: baseline;
                    margin-bottom: 12px;
                }
                .currency {
                    font-size: 20px;
                    font-weight: 600;
                    color: #475569;
                    margin-right: 2px;
                }
                .amount {
                    font-size: 40px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .duration {
                    font-size: 15px;
                    color: #64748b;
                    margin-left: 4px;
                }
                .plan-desc {
                    font-size: 14px;
                    color: #64748b;
                    line-height: 1.5;
                    margin-bottom: 24px;
                    min-height: 42px;
                }
                .features-list {
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .feature-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .check-icon {
                    width: 20px;
                    height: 20px;
                    background: #f0fdf4;
                    color: #16a34a;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .feature-text {
                    font-size: 14px;
                    color: #475569;
                    line-height: 1.4;
                }
                .plan-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }
                .popular-btn {
                    background: #2563eb;
                    color: white;
                }
                .popular-btn:hover {
                    background: #1d4ed8;
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
                }
                .secondary-btn {
                    background: #f8fafc;
                    color: #0f172a;
                    border: 1px solid #e2e8f0;
                }
                .secondary-btn:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                }
                .current-btn {
                    background: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                }
            `}} />
        </motion.div>
    );
};

export default PlanCard;
