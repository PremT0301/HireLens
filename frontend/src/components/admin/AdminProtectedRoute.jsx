import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../../api/authService';

const AdminProtectedRoute = ({ children }) => {
    const isAuthenticated = AuthService.isAuthenticated();
    const userRole = (sessionStorage.getItem('userRole') || '').toUpperCase();
    const location = useLocation();

    // Check if user is logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user has 'ADMIN' role
    if (userRole !== 'ADMIN') {
        // Redirect non-admins to their respective dashboards or home
        if (userRole === 'RECRUITER') {
            return <Navigate to="/recruiter/dashboard" replace />;
        } else if (userRole === 'APPLICANT') {
            return <Navigate to="/applicant/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default AdminProtectedRoute;
