import React, { useEffect, useState } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import AdminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLevel, setFilterLevel] = useState('');
    const [filterSource, setFilterSource] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        loadLogs();
    }, [filterLevel, filterSource, page]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const params = {
                level: filterLevel,
                source: filterSource,
                page: page,
                pageSize: 50
            };
            const { data, totalCount } = await AdminService.getSystemLogs(params);
            setLogs(data);
            setHasMore(data.length === 50); // Simple pagination check
        } catch (error) {
            addToast("Failed to load logs", "error");
        } finally {
            setLoading(false);
        }
    };

    const getLevelIcon = (level) => {
        switch (level) {
            case 'Error': return <XCircle size={16} color="#ef4444" />;
            case 'Warning': return <AlertTriangle size={16} color="#f59e0b" />;
            case 'Info': return <Info size={16} color="#3b82f6" />;
            default: return <Info size={16} color="#6b7280" />;
        }
    };

    const getLevelStyle = (level) => {
        switch (level) {
            case 'Error': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            case 'Warning': return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'Info': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            default: return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>System Logs</h2>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="">All Levels</option>
                        <option value="Info">Info</option>
                        <option value="Warning">Warning</option>
                        <option value="Error">Error</option>
                    </select>

                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '0.375rem',
                            border: '1px solid #d1d5db',
                            backgroundColor: 'white'
                        }}
                    >
                        <option value="">All Sources</option>
                        <option value="System">System</option>
                        <option value="Auth">Auth</option>
                        <option value="Admin">Admin</option>
                        <option value="AI">AI</option>
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Timestamp</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Level</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Source</th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Message</th>
                        </tr>
                    </thead>
                    <tbody style={{ divideY: '1px solid #e5e7eb' }}>
                        {loading ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading logs...</td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No logs found</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.logId} style={{ borderTop: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            ...getLevelStyle(log.level)
                                        }}>
                                            {getLevelIcon(log.level)}
                                            {log.level}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#374151', fontWeight: '500' }}>
                                        {log.source}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: '#111827', maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        {log.message}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        backgroundColor: page === 1 ? '#f3f4f6' : 'white',
                        color: page === 1 ? '#9ca3af' : '#374151',
                        cursor: page === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    Previous
                </button>
                <button
                    disabled={!hasMore}
                    onClick={() => setPage(page + 1)}
                    style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        backgroundColor: !hasMore ? '#f3f4f6' : 'white',
                        color: !hasMore ? '#9ca3af' : '#374151',
                        cursor: !hasMore ? 'not-allowed' : 'pointer'
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SystemLogs;
