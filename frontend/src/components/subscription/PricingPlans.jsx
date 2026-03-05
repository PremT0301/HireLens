import React from 'react';
import PlanCard from './PlanCard';

const PricingPlans = ({ plans, currentPlan, onPlanAction }) => {
    return (
        <div className="pricing-section">
            <div className="section-header">
                <h2 className="section-title">Choose your plan</h2>
                <p className="section-subtitle">Unlock advanced AI tools and unlimited capacity</p>
            </div>

            <div className="plans-grid">
                {plans.map((plan) => (
                    <div key={plan.name} className="plan-item">
                        <PlanCard
                            plan={plan}
                            isCurrent={currentPlan === plan.name}
                            onAction={onPlanAction}
                            isPopular={plan.name === 'PRO'}
                        />
                    </div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .pricing-section {
                    margin-top: 64px;
                }
                .section-header {
                    text-align: center;
                    margin-bottom: 48px;
                }
                .section-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 12px;
                }
                .section-subtitle {
                    font-size: 16px;
                    color: #64748b;
                }
                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 32px;
                    max-width: 1100px;
                    margin: 0 auto;
                }
                @media (min-width: 768px) {
                    .plans-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .plans-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}} />
        </div>
    );
};

export default PricingPlans;
