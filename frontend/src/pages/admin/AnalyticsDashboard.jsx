import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { analyticsService, createSignalRConnection } from '../../services/analyticsService';
import UserGrowthChart from '../../components/admin/charts/UserGrowthChart';
import ApplicationTrendChart from '../../components/admin/charts/ApplicationTrendChart';
import JobStatusChart from '../../components/admin/charts/JobStatusChart';
import HiringFunnelChart from '../../components/admin/charts/HiringFunnelChart';
import TopSkillsChart from '../../components/admin/charts/TopSkillsChart';
import MatchScoreChart from '../../components/admin/charts/MatchScoreChart';
import RecruiterPerformanceChart from '../../components/admin/charts/RecruiterPerformanceChart';

const AnalyticsDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('light'); // Could be from context
    const [period, setPeriod] = useState('monthly');

    const [data, setData] = useState({
        userGrowth: [],
        applicationTrends: [],
        jobStatus: [],
        funnelStats: {},
        topSkills: [],
        matchDistribution: [],
        recruiterPerformance: [],
        summary: {}
    });

    const fetchData = async () => {
        try {
            const results = await Promise.all([
                analyticsService.getUserGrowth(period),
                analyticsService.getApplicationTrends('daily'),
                analyticsService.getJobStatus(),
                analyticsService.getFunnelStats(),
                analyticsService.getTopSkills(10),
                analyticsService.getMatchDistribution(),
                analyticsService.getRecruiterPerformance(5),
                analyticsService.getSummary()
            ]);

            setData({
                userGrowth: results[0],
                applicationTrends: results[1],
                jobStatus: results[2],
                funnelStats: results[3],
                topSkills: results[4],
                matchDistribution: results[5],
                recruiterPerformance: results[6],
                summary: results[7]
            });
        } catch (error) {
            console.error("Failed to fetch analytics data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // SignalR Setup
        let isMounted = true;
        const connection = createSignalRConnection();

        const startConnection = async () => {
            try {
                await connection.start();
                if (isMounted) {
                    console.log("Connected to Analytics Hub");
                    connection.on("ReceiveAnalyticsUpdate", (updateType) => {
                        console.log("Received update:", updateType);
                        fetchData();
                    });
                    connection.invoke("JoinAdminGroup").catch(err => console.error(err));
                } else {
                    await connection.stop();
                }
            } catch (err) {
                // Ignore AbortError caused by stopping during negotiation (common in React Dev Mode)
                if (isMounted && err.name !== 'AbortError' && !err.message?.includes('stopped during negotiation')) {
                    console.error("SignalR Connection Failed", err);
                }
            }
        };

        startConnection();

        return () => {
            isMounted = false;
            if (connection.state === 'Connected') {
                connection.stop();
            }
        };
    }, [period]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
                <RefreshCw className="animate-spin" size={48} style={{ color: '#3b82f6', margin: '0 auto' }} />
                <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: '500' }}>Analyzing platform data...</p>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em' }}>Analytics Dashboard</h2>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Deep-dive into system growth and performance metrics</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#475569', fontSize: '0.875rem', fontWeight: '600', outline: 'none' }}
                    >
                        <option value="weekly">Weekly View</option>
                        <option value="monthly">Monthly View</option>
                        <option value="yearly">Yearly View</option>
                    </select>
                </div>
            </div>

            {/* KPI Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <KPICard title="New Users" value={data.summary.newUsers || 0} />
                <KPICard title="Applications" value={data.summary.totalApplications || 0} />
                <KPICard title="Active Jobs" value={data.summary.activeJobs || 0} />
                <KPICard title="Avg Match" value={`${(data.summary.averageMatchScore * 100 || 0).toFixed(1)}%`} />
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <ChartCard title="User Growth Trends">
                    <UserGrowthChart data={data.userGrowth} />
                </ChartCard>
                <ChartCard title="Application Volume">
                    <ApplicationTrendChart data={data.applicationTrends} />
                </ChartCard>
                <ChartCard title="Hiring Funnel Efficiency">
                    <HiringFunnelChart data={data.funnelStats} />
                </ChartCard>
                <ChartCard title="Job Status Distribution">
                    <JobStatusChart data={data.jobStatus} />
                </ChartCard>
                <ChartCard title="Top Skills in Demand">
                    <TopSkillsChart data={data.topSkills} />
                </ChartCard>
                <ChartCard title="Match Score Distribution">
                    <MatchScoreChart data={data.matchDistribution} />
                </ChartCard>
                <ChartCard title="Recruiter Performance" className="col-span-2">
                    <RecruiterPerformanceChart data={data.recruiterPerformance} />
                </ChartCard>
            </div>
        </div>
    );
};

const KPICard = ({ title, value }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderLeft: '4px solid #3b82f6' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
        <p style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', marginTop: '0.5rem' }}>{value}</p>
    </div>
);

const ChartCard = ({ title, children, className = '' }) => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', gridColumn: className.includes('col-span-2') ? 'span 2' : 'auto' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#334155', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
        </h3>
        <div style={{ height: '320px', width: '100%' }}>
            {children}
        </div>
    </div>
);

export default AnalyticsDashboard;
