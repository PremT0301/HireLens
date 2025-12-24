import React from 'react';
import { Outlet } from 'react-router-dom';

const RecruiterLayout = () => {
    return (
        <div style={{ minHeight: '100vh', paddingTop: '80px' }}>
            {/* Main Content */}
            <main style={{
                width: '100%',
                padding: '0 20px',
                margin: '0 auto',
                maxWidth: '1400px'
            }}>
                <div className="page-transition">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default RecruiterLayout;
