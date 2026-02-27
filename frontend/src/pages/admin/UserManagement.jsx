import React, { useEffect, useState, useCallback } from 'react';
import { Search, ShieldOff, AlertCircle, UserPlus, Trash2, Filter, ChevronLeft, ChevronRight, MoreVertical, RefreshCw } from 'lucide-react';
import AdminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const { addToast } = useToast();

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminService.getUsers({
                email: searchTerm,
                role: roleFilter,
                page,
                pageSize
            });
            setUsers(data);
        } catch (error) {
            addToast("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, roleFilter, page, pageSize, addToast]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleToggleUserStatus = async (user) => {
        const action = user.isActive ? "disable" : "enable";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            await AdminService.toggleUserStatus(user.userId);
            addToast(`User ${action}d successfully`, "success");
            loadUsers();
        } catch (error) {
            addToast(error.message || `Failed to ${action} user`, "error");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await AdminService.updateUserRole(userId, newRole);
            addToast(`Role updated to ${newRole}`, "success");
            loadUsers();
        } catch (error) {
            addToast(error.message || "Failed to update role", "error");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to soft-delete this user? They will be disabled and hidden from most views.")) {
            return;
        }

        try {
            await AdminService.deleteUser(userId);
            addToast("User soft-deleted successfully", "success");
            loadUsers();
        } catch (error) {
            addToast(error.message || "Failed to delete user", "error");
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>User Management</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Monitor and manage user access and roles</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search by email..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            style={{
                                padding: '0.625rem 1rem 0.625rem 2.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                width: '320px',
                                fontSize: '0.9375rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        style={{
                            padding: '0.625rem 1rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: '#475569',
                            fontSize: '0.9375rem',
                            outline: 'none'
                        }}
                    >
                        <option value="">All Roles</option>
                        <option value="APPLICANT">Applicant</option>
                        <option value="RECRUITER">Recruiter</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>User Info</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Joined Date</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                                    <RefreshCw className="animate-spin" size={32} style={{ color: '#3b82f6', margin: '0 auto' }} />
                                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Fetching users...</p>
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                                    <div style={{ marginBottom: '1rem' }}><Search size={48} style={{ opacity: 0.2, margin: '0 auto' }} /></div>
                                    No users matching your criteria
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.userId} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{user.fullName || "Unnamed User"}</span>
                                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{user.email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        {user.role === 'ADMIN' ? (
                                            <span style={{ padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#eff6ff', color: '#2563eb' }}>ADMIN</span>
                                        ) : (
                                            <select
                                                value={user.role}
                                                onChange={(e) => {
                                                    const newRole = e.target.value;
                                                    if (newRole === 'ADMIN') {
                                                        if (window.confirm("Grant full admin privileges? This will restrict portal access to Admin only and revoke Applicant/Recruiter portal access.")) {
                                                            handleRoleChange(user.userId, newRole);
                                                        }
                                                    } else {
                                                        handleRoleChange(user.userId, newRole);
                                                    }
                                                }}
                                                style={{ border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                                            >
                                                <option value="APPLICANT">Applicant</option>
                                                <option value="RECRUITER">Recruiter</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.isActive ? '#10b981' : '#ef4444' }}></div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: user.isActive ? '#065f46' : '#991b1b' }}>
                                                {user.isActive ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            {user.role !== 'ADMIN' && (
                                                <>
                                                    <button
                                                        onClick={() => handleToggleUserStatus(user)}
                                                        title={user.isActive ? "Disable User" : "Enable User"}
                                                        style={{ p: '0.5rem', border: 'none', backgroundColor: 'transparent', color: user.isActive ? '#f59e0b' : '#10b981', cursor: 'pointer' }}
                                                    >
                                                        <ShieldOff size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.userId)}
                                                        title="Delete User"
                                                        style={{ p: '0.5rem', border: 'none', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        Showing page {page}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            style={{
                                display: 'flex', alignItems: 'center', p: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                                backgroundColor: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1
                            }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button
                            disabled={users.length < pageSize}
                            onClick={() => setPage(p => p + 1)}
                            style={{
                                display: 'flex', alignItems: 'center', p: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                                backgroundColor: 'white', cursor: users.length < pageSize ? 'not-allowed' : 'pointer', opacity: users.length < pageSize ? 0.5 : 1
                            }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
