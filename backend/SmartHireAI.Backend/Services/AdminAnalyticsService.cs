using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.DTOs.Analytics;
using System.Globalization;

namespace SmartHireAI.Backend.Services
{
    public class AdminAnalyticsService : IAdminAnalyticsService
    {
        private readonly ApplicationDbContext _context;

        public AdminAnalyticsService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<UserGrowthDto>> GetUserGrowthAsync(string period)
        {
            // Simplified to last 30 days for daily, or grouped by month for longer periods if needed.
            // For now, let's return last 6 months monthly growth.
            
            var startDate = DateTime.UtcNow.AddMonths(-6);

            var query = _context.Users
                .Where(u => u.CreatedAt >= startDate)
                .AsNoTracking();

            var grouped = await query
                .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month, u.Role })
                .Select(g => new 
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Role = g.Key.Role,
                    Count = g.Count()
                })
                .ToListAsync();

            var result = grouped
                .GroupBy(x => new { x.Year, x.Month })
                .Select(g => new UserGrowthDto
                {
                    Date = new DateTime(g.Key.Year, g.Key.Month, 1),
                    Applicants = g.Where(x => x.Role == "Applicant").Sum(x => x.Count),
                    Recruiters = g.Where(x => x.Role == "Recruiter").Sum(x => x.Count)
                })
                .OrderBy(x => x.Date)
                .ToList();

            return result;
        }

        public async Task<List<ApplicationTrendDto>> GetApplicationTrendsAsync(string period)
        {
            // Default to Daily for last 30 days
            var startDate = DateTime.UtcNow.AddDays(-30);
            
            var data = await _context.JobApplications
                .Where(a => a.AppliedAt >= startDate)
                .GroupBy(a => a.AppliedAt.Date)
                .Select(g => new ApplicationTrendDto
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(a => a.Date)
                .ToListAsync();

            return data;
        }

        public async Task<List<JobStatusDto>> GetJobStatusDistributionAsync()
        {
            return await _context.JobDescriptions
                .GroupBy(j => j.Status)
                .Select(g => new JobStatusDto
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();
        }

        public async Task<FunnelStatsDto> GetHiringFunnelStatsAsync()
        {
            // Funnel: Applied -> Interview Scheduled -> Interview Completed (implied by accepted/date passed) -> Hired
            // Note: Status strings might vary, adjusting based on Entities.cs
            
            var stats = await _context.JobApplications
                .GroupBy(a => 1) // group all
                .Select(g => new FunnelStatsDto
                {
                    Applied = g.Count(),
                    InterviewScheduled = g.Count(a => a.Status == "InterviewScheduled" || a.InterviewDate != null),
                    InterviewCompleted = g.Count(a => a.InterviewDate < DateTime.UtcNow && (a.Status == "InterviewScheduled" || a.Status == "Offer" || a.Status == "Hired" || a.Status == "Rejected")), // Approx
                    Hired = g.Count(a => a.Status == "Hired" || a.Status == "Offer")
                })
                .FirstOrDefaultAsync();

            return stats ?? new FunnelStatsDto();
        }

        public async Task<List<SkillStatsDto>> GetTopSkillsAsync(int topN = 10)
        {
            // Skill extraction from Applicants.Skills (comma separated string)
            // This is heavy if done in-memory for millions of rows. 
            // For now, we fetch distinct skills string and split in memory. 
            // In production, this should be a normalized table or indexed text search.
            
            var skillsRaw = await _context.Applicants
                .Where(a => a.Skills != null)
                .Select(a => a.Skills)
                .ToListAsync();

            var result = skillsRaw
                .SelectMany(s => s!.Split(',', StringSplitOptions.RemoveEmptyEntries))
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .GroupBy(s => s)
                .Select(g => new SkillStatsDto
                {
                    SkillName = g.Key,
                    Count = g.Count()
                })
                .OrderByDescending(x => x.Count)
                .Take(topN)
                .ToList();

            return result;
        }

        public async Task<List<MatchDistributionDto>> GetMatchScoreDistributionAsync()
        {
            // Histograms: 0-10, 10-20 ... 90-100
            // We can do this via client side or server side. Server side bucketing is cleaner.
            
            var scores = await _context.MatchResults
                .Select(m => m.MatchScore)
                .ToListAsync();

            var buckets = new int[10]; // 0-10 ... 90-100
            foreach (var score in scores)
            {
                // Score is usually 0.0 to 1.0 or 0 to 100. Let's assume 0-100 based on 'int' or float usage.
                // Entities.cs says: float MatchScore. 
                // Usually embedding similarity is 0-1. Let's check ranges. 
                // If 0-1 multiply by 100.
                
                float val = score;
                if (val <= 1.0f && scores.Any(s => s <= 1.0f && s > 0)) val *= 100;

                int index = (int)(val / 10);
                if (index >= 10) index = 9;
                if (index < 0) index = 0;
                buckets[index]++;
            }

            var result = new List<MatchDistributionDto>();
            for (int i = 0; i < 10; i++)
            {
                result.Add(new MatchDistributionDto 
                { 
                    Range = $"{i * 10}-{i * 10 + 10}%", 
                    Count = buckets[i] 
                });
            }

            return result;
        }

        public async Task<List<RecruiterPerformanceDto>> GetRecruiterPerformanceAsync(int topN = 5)
        {
            // Recruiter vs Hires vs Applications
            
            var recruiters = await _context.Recruiters
                .Include(r => r.User)
                .Select(r => new
                {
                    r.RecruiterId,
                    Name = r.User.FullName ?? r.CompanyName ?? "Unknown",
                    JobsPosted = r.JobDescriptions.Count(),
                    ApplicationsReceived = r.JobDescriptions.SelectMany(j => j.Matches).Count(), // Or JobApplications? JobApplications is better.
                    // Wait, Recruiter -> JobDescription -> JobApplication
                })
                .Take(topN) // Just taking arbitrary top N for now, logic should sort by performance
                .ToListAsync();

            // To get applications count properly without massive joins in one query if navigation properties aren't perfect:
            // Let's rely on EF Core fix-up or explicit query.
             
            // Optimized query:
            var refinedStats = await _context.Recruiters
                .Select(r => new RecruiterPerformanceDto
                {
                    RecruiterName = r.User.FullName ?? r.CompanyName ?? "Unknown",
                    JobsPosted = r.JobDescriptions.Count(),
                    ApplicationsReceived = _context.JobApplications.Count(a => a.JobDescription.RecruiterId == r.RecruiterId),
                    HiresMade = _context.JobApplications.Count(a => a.JobDescription.RecruiterId == r.RecruiterId && a.Status == "Hired")
                })
                .OrderByDescending(x => x.HiresMade)
                .Take(topN)
                .ToListAsync();

            return refinedStats;
        }

        public async Task<Dictionary<string, object>> GetDashboardSummaryAsync()
        {
             return new Dictionary<string, object>
             {
                 { "totalUsers", await _context.Users.CountAsync() },
                 { "totalJobs", await _context.JobDescriptions.CountAsync() },
                 { "activeJobs", await _context.JobDescriptions.CountAsync(j => j.Status == "Active") },
                 { "totalApplications", await _context.JobApplications.CountAsync() },
                 { "averageMatchScore", await _context.MatchResults.AnyAsync() ? await _context.MatchResults.AverageAsync(m => m.MatchScore) : 0 }
             };
        }
    }
}
