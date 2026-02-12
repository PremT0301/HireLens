#nullable enable
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // --- User Management ---

    // GET: api/admin/users
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers()
    {
        var users = await _context.Users
            .Select(u => new AdminUserDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return Ok(users);
    }

    // PATCH: api/admin/users/{id}/toggle
    [HttpPatch("users/{id}/toggle")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (user.Role == "Admin")
        {
            return BadRequest(new { message = "Cannot disable Admin accounts." });
        }

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync();

        var status = user.IsActive ? "Activated" : "Deactivated";
        await LogSystemAction("Admin", $"User {user.Email} was {status}.", user.UserId);

        return Ok(new { message = $"User has been {status}.", isActive = user.IsActive });
    }

    // --- Job Moderation ---

    // GET: api/admin/jobs
    [HttpGet("jobs")]
    public async Task<ActionResult<IEnumerable<AdminJobDto>>> GetAllJobs()
    {
        var jobs = await _context.JobDescriptions
            .Include(j => j.Recruiter)
            .ThenInclude(r => r.User)
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
            .OrderByDescending(j => j.CreatedAt)
            .ToListAsync();

        return Ok(jobs);
    }

    // PATCH: api/admin/jobs/{id}/toggle
    [HttpPatch("jobs/{id}/toggle")]
    public async Task<IActionResult> ToggleJobStatus(Guid id)
    {
        var job = await _context.JobDescriptions.FindAsync(id);
        if (job == null)
        {
            return NotFound(new { message = "Job not found" });
        }

        // Toggle between "Active" and "Closed"
        // If it's something else (e.g., Draft), we might want to handle it, but for now we assume Active/Closed cycle.
        if (job.Status == "Closed")
        {
            job.Status = "Active";
        }
        else
        {
            job.Status = "Closed";
        }

        await _context.SaveChangesAsync();

        await LogSystemAction("Admin", $"Job '{job.Title}' ({job.JobId}) status changed to {job.Status}.");

        return Ok(new { message = $"Job status changed to {job.Status}.", status = job.Status });
    }

    // --- System Logs ---

    // GET: api/admin/logs
    [HttpGet("logs")]
    public async Task<ActionResult<IEnumerable<SystemLog>>> GetSystemLogs(
        [FromQuery] string? level,
        [FromQuery] string? source,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _context.SystemLogs.AsQueryable();

        if (!string.IsNullOrEmpty(level))
        {
            query = query.Where(l => l.Level == level);
        }

        if (!string.IsNullOrEmpty(source))
        {
            query = query.Where(l => l.Source == source);
        }

        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(l => l.User) // Optional: If we want to show user details
            .ToListAsync();

        var totalCount = await query.CountAsync();

        Response.Headers.Append("X-Total-Count", totalCount.ToString());

        return Ok(logs);
    }

    // --- Statistics ---

    // GET: api/admin/stats
    [HttpGet("stats")]
    public async Task<ActionResult<SystemStatsDto>> GetSystemStats()
    {
        var stats = new SystemStatsDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            TotalApplicants = await _context.Applicants.CountAsync(),
            TotalRecruiters = await _context.Recruiters.CountAsync(),
            TotalJobs = await _context.JobDescriptions.CountAsync(),
            TotalApplications = await _context.JobApplications.CountAsync()
        };

        return Ok(stats);
    }

    // --- Helper Methods ---
    private async Task LogSystemAction(string source, string message, Guid? userId = null, string level = "Info")
    {
        var log = new SystemLog
        {
            LogId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            Source = source,
            Level = level,
            Message = message,
            UserId = userId
        };

        _context.SystemLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
