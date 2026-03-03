import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(AuthService.getCurrentUser());
    const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());

    useEffect(() => {
        const handleStorageChange = () => {
            setUser(AuthService.getCurrentUser());
            setIsAuthenticated(AuthService.isAuthenticated());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (email, password) => {
        const data = await AuthService.login(email, password);
        setUser(AuthService.getCurrentUser());
        setIsAuthenticated(true);
        return data;
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const updatePlan = (newPlan) => {
        AuthService.updateLocalPlan(newPlan);
        setUser(AuthService.getCurrentUser());
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updatePlan }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
