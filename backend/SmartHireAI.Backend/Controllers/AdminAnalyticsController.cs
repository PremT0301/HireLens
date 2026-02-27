using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SmartHireAI.Backend.Hubs;
using SmartHireAI.Backend.Services;

namespace SmartHireAI.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN")]
    public class AdminAnalyticsController : ControllerBase
    {
        private readonly IAdminAnalyticsService _analyticsService;
        private readonly IHubContext<AnalyticsHub> _hubContext;

        public AdminAnalyticsController(IAdminAnalyticsService analyticsService, IHubContext<AnalyticsHub> hubContext)
        {
            _analyticsService = analyticsService;
            _hubContext = hubContext;
        }

        [HttpGet("user-growth")]
        public async Task<IActionResult> GetUserGrowth([FromQuery] string period = "monthly")
        {
            var data = await _analyticsService.GetUserGrowthAsync(period);
            return Ok(data);
        }

        [HttpGet("application-trends")]
        public async Task<IActionResult> GetApplicationTrends([FromQuery] string period = "daily")
        {
            var data = await _analyticsService.GetApplicationTrendsAsync(period);
            return Ok(data);
        }

        [HttpGet("job-status")]
        public async Task<IActionResult> GetJobStatus()
        {
            var data = await _analyticsService.GetJobStatusDistributionAsync();
            return Ok(data);
        }

        [HttpGet("funnel-stats")]
        public async Task<IActionResult> GetFunnelStats()
        {
            var data = await _analyticsService.GetHiringFunnelStatsAsync();
            return Ok(data);
        }

        [HttpGet("top-skills")]
        public async Task<IActionResult> GetTopSkills([FromQuery] int top = 10)
        {
            var data = await _analyticsService.GetTopSkillsAsync(top);
            return Ok(data);
        }

        [HttpGet("match-distribution")]
        public async Task<IActionResult> GetMatchDistribution()
        {
            var data = await _analyticsService.GetMatchScoreDistributionAsync();
            return Ok(data);
        }

        [HttpGet("recruiter-performance")]
        public async Task<IActionResult> GetRecruiterPerformance([FromQuery] int top = 5)
        {
            var data = await _analyticsService.GetRecruiterPerformanceAsync(top);
            return Ok(data);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var data = await _analyticsService.GetDashboardSummaryAsync();
            return Ok(data);
        }

        // Test Endpoint to trigger SignalR update manually (for demonstration)
        [HttpPost("trigger-update")]
        public async Task<IActionResult> TriggerUpdate([FromBody] string updateType)
        {
            await _hubContext.Clients.Group("Admins").SendAsync("ReceiveAnalyticsUpdate", updateType);
            return Ok(new { Message = "Update triggered" });
        }
    }
}
