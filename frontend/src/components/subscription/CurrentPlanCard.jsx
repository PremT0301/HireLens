import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar, CreditCard } from 'lucide-react';

const CurrentPlanCard = ({ planName, price, expiryDate, onCancel }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="subscription-card"
        >
            <div className="card-header">
                <div className="plan-label">CURRENT PLAN</div>
                <div className={`plan-badge ${planName.toLowerCase()}`}>{planName}</div>
            </div>

            <div className="card-body">
                <div className="plan-price-display">
                    <span className="price">{price}</span>
                    <span className="period">/ month</span>
                </div>

                <div className="billing-info">
                    <div className="info-item">
                        <Calendar size={16} />
                        <span>Next billing date: <strong>{expiryDate}</strong></span>
                    </div>
                    <div className="info-item">
                        <Shield size={16} />
                        <span>Securely managed via Stripe</span>
                    </div>
                </div>
            </div>

            <div className="card-footer">
                <button onClick={onCancel} className="cancel-btn">
                    Cancel Subscription
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .subscription-card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.04);
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    max-width: 100%;
                    position: relative;
                    overflow: hidden;
                }
                .subscription-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #2563eb, #3b82f6);
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .plan-label {
                    font-size: 12px;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 1px;
                }
                .plan-badge {
                    font-size: 12px;
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-weight: 600;
                }
                .plan-badge.free { background: #f1f5f9; color: #475569; }
                .plan-badge.pro { background: #dbeafe; color: #1e40af; }
                .plan-badge.elite { background: #faf5ff; color: #6b21a8; }
                
                .plan-price-display {
                    margin-bottom: 24px;
                }
                .price {
                    font-size: 42px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .period {
                    font-size: 16px;
                    color: #64748b;
                    margin-left: 8px;
                }
                .billing-info {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #475569;
                    font-size: 15px;
                }
                .cancel-btn {
                    border: 1px solid #fee2e2;
                    color: #ef4444;
                    background: #fffafa;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .cancel-btn:hover {
                    background: #fef2f2;
                    border-color: #fca5a5;
                    transform: translateY(-1px);
                }
            `}} />
        </motion.div>
    );
};

export default CurrentPlanCard;
