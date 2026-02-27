import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../api/authService';

const ProtectedRoute = ({ children, requiredRole }) => {
    const isAuthenticated = AuthService.isAuthenticated();
    const userRole = (sessionStorage.getItem('userRole') || '').toUpperCase();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // STRICT RBAC:
    // 1. ADMIN is ONLY allowed in /admin routes (handled by AdminProtectedRoute)
    // 2. Cross-portal access between Applicant and Recruiter is forbidden
    if (userRole === 'ADMIN') {
        // Admins should not be in Applicant or Recruiter portals
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (requiredRole && userRole !== requiredRole.toUpperCase()) {
        // Role mismatch
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
