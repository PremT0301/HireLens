using SmartHireAI.Backend.DTOs.Analytics;

namespace SmartHireAI.Backend.Services
{
    public interface IAdminAnalyticsService
    {
        Task<List<UserGrowthDto>> GetUserGrowthAsync(string period); // "daily", "weekly", "monthly"
        Task<List<ApplicationTrendDto>> GetApplicationTrendsAsync(string period);
        Task<List<JobStatusDto>> GetJobStatusDistributionAsync();
        Task<FunnelStatsDto> GetHiringFunnelStatsAsync();
        Task<List<SkillStatsDto>> GetTopSkillsAsync(int topN = 10);
        Task<List<MatchDistributionDto>> GetMatchScoreDistributionAsync();
        Task<List<RecruiterPerformanceDto>> GetRecruiterPerformanceAsync(int topN = 5);
        Task<Dictionary<string, object>> GetDashboardSummaryAsync(); // For KPI cards if needed
    }
}
