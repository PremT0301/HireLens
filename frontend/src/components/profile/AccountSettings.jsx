import React from 'react';
import { Shield, CreditCard, Calendar } from 'lucide-react';

const AccountSettings = ({ userData }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Jan 2026'; // Fallback
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="profile-card">
            <h3 className="card-title">Account Settings</h3>
            <div className="account-details-grid">
                <div className="account-item">
                    <div className="item-icon">
                        <Shield size={20} />
                    </div>
                    <div className="item-content">
                        <span className="item-label">Account Type</span>
                        <span className="item-value">{userData?.role || 'Applicant'}</span>
                    </div>
                </div>
                <div className="account-item">
                    <div className="item-icon">
                        <CreditCard size={20} />
                    </div>
                    <div className="item-content">
                        <span className="item-label">Current Plan</span>
                        <span className="item-value" style={{ color: '#2563EB' }}>
                            {userData?.subscriptionPlan?.replace('_', ' ') || 'FREE'}
                        </span>
                    </div>
                </div>
                <div className="account-item">
                    <div className="item-icon">
                        <Calendar size={20} />
                    </div>
                    <div className="item-content">
                        <span className="item-label">Member Since</span>
                        <span className="item-value">{formatDate(userData?.createdAt)}</span>
                    </div>
                </div>
            </div>
            <div className="account-actions" style={{ marginTop: '24px' }}>
                <button className="btn-secondary-outline" style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px' }}>
                    Change Password
                </button>
            </div>
        </div>
    );
};

export default AccountSettings;
