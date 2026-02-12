import React, { useEffect, useState } from 'react';
import { Search, ShieldOff, AlertCircle } from 'lucide-react';
import AdminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await AdminService.getUsers();
            setUsers(data);
        } catch (error) {
            addToast("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUserStatus = async (user) => {
        const action = user.isActive ? "disable" : "enable";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
            return;
        }

        try {
            const result = await AdminService.toggleUserStatus(user.userId);
            addToast(result.message, "success");

            setUsers(users.map(u =>
                u.userId === user.userId
                    ? { ...u, isActive: result.isActive }
                    : u
            ));
        } catch (error) {
            addToast(error.message || `Failed to ${action} user`, "error");
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>User Management</h2>

                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #d1d5db',
                            width: '300px'
                        }}
                    />
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Email</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                        {loading ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading users...</td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No users found</td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem', color: '#111827' }}>{user.email}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: user.role === 'Admin' ? '#dbeafe' : user.role === 'Recruiter' ? '#f3e8ff' : '#d1fae5',
                                            color: user.role === 'Admin' ? '#1e40af' : user.role === 'Recruiter' ? '#6b21a8' : '#065f46'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: user.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                            color: user.status === 'Active' ? '#065f46' : '#991b1b'
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {user.role !== 'Admin' && (
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <label style={{
                                                    position: 'relative',
                                                    display: 'inline-block',
                                                    width: '40px',
                                                    height: '24px',
                                                    cursor: 'pointer'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={user.isActive}
                                                        onChange={() => handleToggleUserStatus(user)}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute',
                                                        cursor: 'pointer',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: user.isActive ? '#10b981' : '#ef4444',
                                                        transition: '.4s',
                                                        borderRadius: '24px'
                                                    }}></span>
                                                    <span style={{
                                                        position: 'absolute',
                                                        content: '""',
                                                        height: '16px',
                                                        width: '16px',
                                                        left: user.isActive ? '20px' : '4px',
                                                        bottom: '4px',
                                                        backgroundColor: 'white',
                                                        transition: '.4s',
                                                        borderRadius: '50%'
                                                    }}></span>
                                                </label>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
