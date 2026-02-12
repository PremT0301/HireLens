import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, LogOut, Shield } from 'lucide-react';
import AuthService from '../api/authService';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout();
    };

    const isActive = (path) => location.pathname.includes(path);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                backgroundColor: '#1f2937',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #374151' }}>
                    <Shield size={24} className="text-blue-400" />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Admin Panel</h1>
                </div>

                <nav style={{ flex: 1, padding: '1rem' }}>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li>
                            <Link to="/admin/dashboard" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                color: isActive('/admin/dashboard') ? 'white' : '#9ca3af',
                                backgroundColor: isActive('/admin/dashboard') ? '#374151' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                                <LayoutDashboard size={20} />
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/users" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                color: isActive('/admin/users') ? 'white' : '#9ca3af',
                                backgroundColor: isActive('/admin/users') ? '#374151' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                                <Users size={20} />
                                <span>Users</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/jobs" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                color: isActive('/admin/jobs') ? 'white' : '#9ca3af',
                                backgroundColor: isActive('/admin/jobs') ? '#374151' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                                <Briefcase size={20} />
                                <span>Job Moderation</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/logs" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                color: isActive('/admin/logs') ? 'white' : '#9ca3af',
                                backgroundColor: isActive('/admin/logs') ? '#374151' : 'transparent',
                                transition: 'all 0.2s'
                            }}>
                                <LayoutDashboard size={20} />
                                <span>System Logs</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid #374151' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.375rem',
                            color: '#ef4444',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                marginLeft: '250px',
                flex: 1,
                padding: '2rem',
                overflowY: 'auto'
            }}>
                <header style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Admin Connected</span>
                    </div>
                </header>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
