import React from 'react';
import { Outlet } from 'react-router-dom';

const ApplicantLayout = () => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Main Content */}
            <main style={{
                flex: 1,
                width: '100%',
                padding: '0 20px',
                margin: '0 auto',
                maxWidth: '1400px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
            }}>
                <div className="page-transition" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ApplicantLayout;
