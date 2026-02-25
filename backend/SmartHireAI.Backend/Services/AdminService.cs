using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;
using System.Diagnostics;

namespace SmartHireAI.Backend.Services;

public class AdminService : IAdminService
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly IAIService _aiService;
    private readonly ILogger<AdminService> _logger;
    private static readonly DateTime _startTime = DateTime.UtcNow;

    private const string DashboardStatsCacheKey = "AdminDashboardStats";

    public AdminService(
        ApplicationDbContext context, 
        IMemoryCache cache, 
        IAIService aiService,
        ILogger<AdminService> logger)
    {
        _context = context;
        _cache = cache;
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<AdminDashboardDto> GetDashboardStatsAsync()
    {
        if (!_cache.TryGetValue(DashboardStatsCacheKey, out AdminDashboardDto? stats))
        {
            stats = new AdminDashboardDto
            {
                TotalUsers = await _context.Users.CountAsync(),
                TotalApplicants = await _context.Applicants.CountAsync(),
                TotalRecruiters = await _context.Recruiters.CountAsync(),
                TotalJobs = await _context.JobDescriptions.CountAsync(),
                ActiveJobs = await _context.JobDescriptions.CountAsync(j => j.Status == "Active"),
                ClosedJobs = await _context.JobDescriptions.CountAsync(j => j.Status == "Closed"),
                TotalApplications = await _context.JobApplications.CountAsync(),
                TotalHires = await _context.JobApplications.CountAsync(a => a.Status == "Hired"),
                AverageMatchScore = await _context.MatchResults.AnyAsync() 
                    ? await _context.MatchResults.AverageAsync(m => m.MatchScore) 
                    : 0
            };

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromSeconds(30));

            _cache.Set(DashboardStatsCacheKey, stats, cacheEntryOptions);
        }

        return stats!;
    }

    public async Task<IEnumerable<AdminUserDto>> GetAllUsersAsync(string? email = null, string? role = null, int page = 1, int pageSize = 10)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(email))
        {
            query = query.Where(u => u.Email.Contains(email));
        }

        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(u => u.Role == role);
        }

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<bool> ToggleUserStatusAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.Role == "Admin") return false;

        user.IsActive = !user.IsActive;
        await LogActionAsync("Admin", $"User {user.Email} was {(user.IsActive ? "Enabled" : "Disabled")}", userId);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateUserRoleAsync(Guid userId, string newRole)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.Role == "Admin") return false;

        var oldRole = user.Role;
        user.Role = newRole;
        await LogActionAsync("Admin", $"User {user.Email} role changed from {oldRole} to {newRole}", userId);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || user.Role == "Admin") return false;

        // Soft delete recommendation: Implementation depends on schema. 
        // For now, let's just disable as per requirement or actually delete if preferred.
        // User requested "Soft Delete recommended".
        user.IsActive = false; 
        await LogActionAsync("Admin", $"User {user.Email} was soft-deleted (disabled)", userId);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<AdminJobDto>> GetAllJobsAsync(string? status = null, string? recruiter = null, int page = 1, int pageSize = 10)
    {
        var query = _context.JobDescriptions
            .Include(j => j.Recruiter)
            .ThenInclude(r => r.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(j => j.Status == status);
        }

        if (!string.IsNullOrEmpty(recruiter))
        {
            query = query.Where(j => j.Recruiter.User.FullName!.Contains(recruiter) || j.Recruiter.CompanyName!.Contains(recruiter));
        }

        return await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new AdminJobDto
            {
                JobId = j.JobId,
                Title = j.Title,
                CompanyName = j.Recruiter.CompanyName ?? "Unknown",
                RecruiterName = j.Recruiter.User.FullName ?? "Unknown",
                Status = j.Status,
                ApplicationCount = _context.JobApplications.Count(a => a.JobId == j.JobId),
                CreatedAt = j.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<bool> ToggleJobStatusAsync(Guid jobId)
    {
        var job = await _context.JobDescriptions.FindAsync(jobId);
        if (job == null) return false;

        job.Status = job.Status == "Active" ? "Closed" : "Active";
        await LogActionAsync("Admin", $"Job {job.Title} status changed to {job.Status}");
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<SystemHealthDto> GetSystemHealthAsync()
    {
        var health = new SystemHealthDto();
        
        // Database check
        try
        {
            health.Database = await _context.Database.CanConnectAsync() ? "Connected" : "Disconnected";
        }
        catch (Exception ex)
        {
            health.Database = $"Error: {ex.Message}";
        }

        // AI Service check
        try
        {
            health.AIService = await _aiService.CheckHealthAsync() ? "Reachable" : "Unreachable";
        }
        catch (Exception ex)
        {
            health.AIService = $"Error: {ex.Message}";
        }

        // Uptime
        var uptime = DateTime.UtcNow - _startTime;
        health.Uptime = $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m";

        return health;
    }

    private async Task LogActionAsync(string source, string message, Guid? targetUserId = null)
    {
        var log = new SystemLog
        {
            LogId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            Source = source,
            Level = "Info",
            Message = message,
            UserId = targetUserId
        };
        _context.SystemLogs.Add(log);
    }
}
