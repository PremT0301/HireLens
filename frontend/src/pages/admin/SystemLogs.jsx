import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Info, XCircle, ChevronLeft, ChevronRight, RefreshCw, Terminal, ArrowDownAZ } from 'lucide-react';
import AdminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';

const SystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLevel, setFilterLevel] = useState('');
    const [filterSource, setFilterSource] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize] = useState(25);
    const [totalCount, setTotalCount] = useState(0);
    const { addToast } = useToast();

    const loadLogs = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                level: filterLevel,
                source: filterSource,
                message: searchTerm,
                page: page,
                pageSize: pageSize
            };
            const result = await AdminService.getSystemLogs(params);
            setLogs(result.data);
            setTotalCount(parseInt(result.totalCount || 0));
        } catch (error) {
            addToast("Failed to load logs", "error");
        } finally {
            setLoading(false);
        }
    }, [filterLevel, filterSource, searchTerm, page, pageSize, addToast]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    const getLevelIcon = (level) => {
        switch (level) {
            case 'Error': return <XCircle size={14} />;
            case 'Warning': return <AlertTriangle size={14} />;
            case 'Info': return <Info size={14} />;
            case 'Success': return <CheckCircle size={14} />;
            default: return <Info size={14} />;
        }
    };

    const getLevelColors = (level) => {
        switch (level) {
            case 'Error': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
            case 'Warning': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
            case 'Info': return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
            case 'Success': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>System Audit Logs</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Detailed history of administrative and system events</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            style={{
                                padding: '0.625rem 1rem 0.625rem 2.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                width: '280px',
                                fontSize: '0.9375rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <select
                        value={filterLevel}
                        onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
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
                        <option value="">All Levels</option>
                        <option value="Info">Info</option>
                        <option value="Warning">Warning</option>
                        <option value="Error">Error</option>
                        <option value="Success">Success</option>
                    </select>

                    <select
                        value={filterSource}
                        onChange={(e) => { setFilterSource(e.target.value); setPage(1); }}
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
                        <option value="">All Sources</option>
                        <option value="Admin">Admin</option>
                        <option value="Auth">Auth</option>
                        <option value="System">System</option>
                        <option value="AI">AI Service</option>
                    </select>
                </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid #1e293b' }}>
                <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Terminal size={18} style={{ color: '#38bdf8' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Audit Stream</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #1e293b', backgroundColor: '#1e293b50' }}>
                                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Timestamp</th>
                                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Level</th>
                                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Source</th>
                                <th style={{ padding: '0.875rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Event Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '5rem', textAlign: 'center' }}>
                                        <RefreshCw className="animate-spin" size={32} style={{ color: '#38bdf8', margin: '0 auto' }} />
                                        <p style={{ marginTop: '1rem', color: '#64748b' }}>Querying system logs...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
                                        <ArrowDownAZ size={48} style={{ opacity: 0.1, margin: '0 auto' }} />
                                        <p style={{ marginTop: '1rem' }}>No audit logs found for the selected filters</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const colors = getLevelColors(log.level);
                                    return (
                                        <tr key={log.logId} style={{ borderBottom: '1px solid #1e293b', transition: 'background-color 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e293b80'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                            <td style={{ padding: '1rem 1.5rem', color: '#94a3b8', fontSize: '0.8125rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                                                {new Date(log.timestamp).toLocaleTimeString()} {new Date(log.timestamp).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.375rem',
                                                    padding: '0.25rem 0.625rem',
                                                    borderRadius: '0.375rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    backgroundColor: colors.bg,
                                                    color: colors.text,
                                                    border: `1px solid ${colors.border}`
                                                }}>
                                                    {getLevelIcon(log.level)}
                                                    {log.level.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>{log.source}</span>
                                            </td>
                                            <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#f1f5f9', fontWeight: '400', maxWidth: '600px', lineHeight: '1.5' }}>
                                                {log.message}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '1rem 1.5rem', backgroundColor: '#1e293b80', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        Total events found: <span style={{ color: '#94a3b8', fontWeight: '600' }}>{totalCount}</span>
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
                                border: '1px solid #334155', backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '0.8125rem',
                                cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1
                            }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button
                            disabled={logs.length < pageSize}
                            onClick={() => setPage(page + 1)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
                                border: '1px solid #334155', backgroundColor: '#1e293b', color: '#94a3b8', fontSize: '0.8125rem',
                                cursor: logs.length < pageSize ? 'not-allowed' : 'pointer', opacity: logs.length < pageSize ? 0.5 : 1
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

export default SystemLogs;
