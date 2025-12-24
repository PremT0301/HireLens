import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthService from '../api/authService';

const PublicOnlyRoute = () => {
    const user = AuthService.getCurrentUser();
    const role = sessionStorage.getItem('userRole');

    if (user && role) {
        // Redirect to appropriate dashboard based on role
        if (role === 'recruiter') {
            return <Navigate to="/recruiter/dashboard" replace />;
        } else if (role === 'applicant') {
            return <Navigate to="/applicant/dashboard" replace />;
        }
    }

    return <Outlet />;
};

export default PublicOnlyRoute;
