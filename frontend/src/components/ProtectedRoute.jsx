import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../api/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
    const isAuthenticated = AuthService.isAuthenticated();
    const userRole = sessionStorage.getItem('userRole'); // Simple role check
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login while saving the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        // Role mismatch - redirect to home or unauthorized page
        // For now, just send to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
