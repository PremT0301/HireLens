import React from 'react';
import { CreditCard, Download, ExternalLink } from 'lucide-react';

const BillingManagement = () => {
    const invoices = [
        { id: 'INV-001', date: 'Feb 4, 2026', amount: '₹999', status: 'Paid' },
        { id: 'INV-002', date: 'Jan 4, 2026', amount: '₹999', status: 'Paid' },
    ];

    return (
        <div className="billing-management">
            <h2 className="section-title-small">Billing & Payment</h2>

            <div className="management-grid">
                <div className="management-card">
                    <div className="mgmt-header">
                        <CreditCard size={18} className="icon-blue" />
                        <h3>Payment Method</h3>
                    </div>
                    <div className="mgmt-content">
                        <div className="visa-info">
                            <span className="visa-tag">VISA</span>
                            <span className="card-number">•••• 4242</span>
                        </div>
                        <button className="text-btn">Update method</button>
                    </div>
                </div>

                <div className="management-card">
                    <div className="mgmt-header">
                        <ExternalLink size={18} className="icon-blue" />
                        <h3>Billing Cycle</h3>
                    </div>
                    <div className="mgmt-content">
                        <p className="cycle-text">Monthly billing</p>
                        <button className="text-btn">Switch to annual (save 20%)</button>
                    </div>
                </div>
            </div>

            <div className="invoice-history">
                <div className="invoice-header">
                    <h3>Invoice History</h3>
                    <button className="download-all-btn">
                        <Download size={14} />
                        Download all
                    </button>
                </div>

                <div className="invoice-table">
                    {invoices.map(inv => (
                        <div key={inv.id} className="invoice-row">
                            <div className="inv-main">
                                <span className="inv-id">{inv.id}</span>
                                <span className="inv-date">{inv.date}</span>
                            </div>
                            <div className="inv-details">
                                <span className="inv-amount">{inv.amount}</span>
                                <span className="inv-status">{inv.status}</span>
                                <button className="icon-btn-small">
                                    <Download size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .billing-management {
                    margin-top: 64px;
                    padding-bottom: 64px;
                }
                .section-title-small {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 24px;
                }
                .management-grid {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 24px;
                    margin-bottom: 40px;
                }
                @media (min-width: 640px) {
                    .management-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                .management-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px;
                }
                .mgmt-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .mgmt-header h3 {
                    font-size: 15px;
                    font-weight: 700;
                    color: #475569;
                }
                .icon-blue { color: #2563eb; }
                .visa-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }
                .visa-tag {
                    font-weight: 800;
                    font-style: italic;
                    color: #1e40af;
                    font-size: 14px;
                }
                .card-number {
                    color: #0f172a;
                    font-weight: 600;
                    font-size: 15px;
                }
                .cycle-text {
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 8px;
                }
                .text-btn {
                    background: none;
                    border: none;
                    color: #2563eb;
                    font-size: 14px;
                    font-weight: 600;
                    padding: 0;
                    cursor: pointer;
                }
                .text-btn:hover { text-decoration: underline; }
                
                .invoice-history {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    overflow: hidden;
                }
                .invoice-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .invoice-header h3 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .download-all-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #475569;
                    cursor: pointer;
                }
                .invoice-table {
                    display: flex;
                    flex-direction: column;
                }
                .invoice-row {
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #f1f5f9;
                }
                .invoice-row:last-child { border-bottom: none; }
                .inv-main {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .inv-id {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .inv-date {
                    font-size: 13px;
                    color: #64748b;
                }
                .inv-details {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }
                .inv-amount {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .inv-status {
                    font-size: 12px;
                    font-weight: 600;
                    padding: 4px 10px;
                    background: #f0fdf4;
                    color: #16a34a;
                    border-radius: 100px;
                }
                .icon-btn-small {
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                }
                .icon-btn-small:hover { background: #f1f5f9; color: #0f172a; }
            `}} />
        </div>
    );
};

export default BillingManagement;
