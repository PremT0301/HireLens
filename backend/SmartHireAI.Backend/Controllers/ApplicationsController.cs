using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ApplicationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/applications/my
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetMyApplications()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        // Find ApplicantId
        var applicant = await _context.Applicants.FirstOrDefaultAsync(a => a.User.UserId == userId);
        if (applicant == null) return NotFound("Applicant profile not found");

        var apps = await _context.JobApplications
            .Include(a => a.JobDescription)
            .ThenInclude(j => j.Recruiter)
            .Where(a => a.ApplicantId == applicant.ApplicantId)
            .OrderByDescending(a => a.AppliedAt)
            .Select(a => new
            {
                a.ApplicationId,
                a.JobId, // Added JobId for frontend mapping
                JobTitle = a.JobDescription.Title,
                CompanyName = a.JobDescription.Recruiter.CompanyName,
                AppliedDate = a.AppliedAt.ToString("yyyy-MM-dd"),
                a.Status,
                a.AtsScore,
                a.InterviewDate,
                a.InterviewMode,
                a.MeetingLink
            })
            .ToListAsync();

        return Ok(apps);
    }

    // GET: api/applications/recruiter-stats
    [HttpGet("recruiter-stats")]
    [Authorize]
    public async Task<ActionResult<object>> GetRecruiterStats()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.User.UserId == userId);
        if (recruiter == null) return NotFound("Recruiter profile not found");

        var totalCandidates = await _context.JobApplications
            .Include(a => a.JobDescription)
            .CountAsync(a => a.JobDescription.RecruiterId == recruiter.RecruiterId);

        var activeJobs = await _context.JobDescriptions
            .CountAsync(j => j.RecruiterId == recruiter.RecruiterId);

        // Calculate placement rate (Mock logic: "Offer" status count / Total applications)
        var offers = await _context.JobApplications
             .Include(a => a.JobDescription)
             .CountAsync(a => a.JobDescription.RecruiterId == recruiter.RecruiterId && a.Status == "Offer");

        var placementRate = totalCandidates > 0 ? (offers * 100 / totalCandidates) : 0;

        return Ok(new
        {
            TotalCandidates = totalCandidates,
            ActiveJobs = activeJobs,
            PlacementRate = $"{placementRate}%",
            Trend = "+12%" // Mock
        });
    }

    // GET: api/applications/recent
    [HttpGet("recent")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetRecentApplications()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.User.UserId == userId);
        if (recruiter == null) return NotFound("Recruiter profile not found");

        var rawApps = await _context.JobApplications
            .Include(a => a.JobDescription)
            .Include(a => a.Applicant)
            .ThenInclude(app => app.User)
            .Where(a => a.JobDescription.RecruiterId == recruiter.RecruiterId)
            .OrderByDescending(a => a.AppliedAt)
            .Take(10)
            .Select(a => new
            {
                Name = a.Applicant.User.FullName ?? "Unknown",
                Role = a.JobDescription.Title,
                Score = (int)a.AtsScore,
                a.AppliedAt,
                a.Status
            })
            .ToListAsync();

        var recentApps = rawApps.Select(a => new
        {
            a.Name,
            a.Role,
            a.Score,
            Label = a.Score >= 90 ? "Highly Suitable" : a.Score >= 70 ? "Suitable" : "Needs Improvement",
            Time = (DateTime.UtcNow - a.AppliedAt).TotalHours < 24
                    ? $"{(int)(DateTime.UtcNow - a.AppliedAt).TotalHours}h ago"
                    : $"{(int)(DateTime.UtcNow - a.AppliedAt).TotalDays}d ago",
            a.Status
        });

        return Ok(recentApps);
    }

    // POST: api/applications/apply
    [HttpPost("apply")]
    [Authorize]
    public async Task<IActionResult> Apply(Guid jobId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var applicant = await _context.Applicants.FirstOrDefaultAsync(a => a.User.UserId == userId);
        if (applicant == null) return BadRequest("Must be an applicant profile to apply");

        // Check if already applied
        var exists = await _context.JobApplications.AnyAsync(a => a.JobId == jobId && a.ApplicantId == applicant.ApplicantId);
        if (exists) return BadRequest("Already applied to this job");

        var stats = new Random(); // Mock ATS score for now
        var app = new JobApplication
        {
            ApplicationId = Guid.NewGuid(),
            JobId = jobId,
            ApplicantId = applicant.ApplicantId,
            Status = "Applied",
            AppliedAt = DateTime.UtcNow,
            AtsScore = stats.Next(60, 99)
        };

        _context.JobApplications.Add(app);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Application submitted successfully" });
    }

    // GET: api/applications/talent-pool
    [HttpGet("talent-pool")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetTalentPool()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.User.UserId == userId);
        if (recruiter == null) return NotFound("Recruiter profile not found");

        var rawCandidates = await _context.JobApplications
            .Include(a => a.Applicant)
            .ThenInclude(app => app.User)
            .Include(a => a.JobDescription)
            .Where(a => a.JobDescription.RecruiterId == recruiter.RecruiterId)
            .Select(a => new
            {
                a.ApplicationId,
                Name = a.Applicant.User.FullName ?? "Unknown",
                Role = a.JobDescription.Title,
                Score = (int)a.AtsScore,
                a.Status,
                Email = a.Applicant.User.Email,
                Phone = a.Applicant.User.MobileNumber,
                Experience = a.Applicant.ExperienceYears,
                a.Applicant.Location,
                College = a.Applicant.CollegeName,
                CurrentRole = a.Applicant.CurrentRole,
                // Grade = a.Applicant.Grade,
                a.InterviewDate,
                a.InterviewMode,
                a.MeetingLink,
                a.AppliedAt
            })
            .ToListAsync();

        // Separate projection to add mocked skills for the chart
        var candidates = rawCandidates.Select(c => new
        {
            Id = c.ApplicationId,
            c.Name,
            c.Role, // Job applied for
            c.CurrentRole, // Actual current role
            c.Score,
            c.Status,
            c.Email,
            c.Phone,
            c.Experience,
            c.Location,
            c.College,
            Label = c.Score >= 90 ? "Highly Suitable" : c.Score >= 70 ? "Suitable" : "Average",
            Time = c.AppliedAt.ToString("MMM dd"), // Simple format for frontend
            c.InterviewDate,
            c.InterviewMode,
            c.MeetingLink,
            // Mock skills based on role for the radar chart
            Skills = MockSkills(c.Role)
        });

        return Ok(candidates);
    }

    private object MockSkills(string role)
    {
        var random = new Random();
        if (role.Contains("Python") || role.Contains("Data") || role.Contains("Machine"))
        {
            return new { Python = random.Next(80, 100), AWS = random.Next(60, 90), SQL = random.Next(70, 95), Docker = random.Next(50, 85), React = random.Next(30, 60) };
        }
        else if (role.Contains("React") || role.Contains("Front") || role.Contains("Web"))
        {
            return new { React = random.Next(85, 100), JavaScript = random.Next(80, 95), CSS = random.Next(70, 90), Node = random.Next(60, 85), Design = random.Next(50, 80) };
        }
        else
        {
            return new { Communication = random.Next(70, 95), ProblemSolving = random.Next(75, 95), Technical = random.Next(60, 90), Leadership = random.Next(50, 80), Teamwork = random.Next(80, 100) };
        }
    }

    // GET: api/applications/pipeline-health
    [HttpGet("pipeline-health")]
    [Authorize]
    public async Task<ActionResult<object>> GetPipelineHealth()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.User.UserId == userId);
        if (recruiter == null) return NotFound("Recruiter profile not found");

        var health = await _context.JobApplications
            .Where(a => a.JobDescription.RecruiterId == recruiter.RecruiterId)
            .GroupBy(a => a.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var result = new
        {
            Screening = health.FirstOrDefault(h => h.Status == "Applied" || h.Status == "UnderReview")?.Count ?? 0,
            Interview = health.FirstOrDefault(h => h.Status == "InterviewScheduled")?.Count ?? 0,
            Offer = health.FirstOrDefault(h => h.Status == "Offer")?.Count ?? 0
        };

        return Ok(result);
    }

    // DELETE: api/applications/withdraw/{jobId}
    [HttpDelete("withdraw/{jobId}")]
    [Authorize]
    public async Task<IActionResult> Withdraw(Guid jobId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var applicant = await _context.Applicants.FirstOrDefaultAsync(a => a.User.UserId == userId);
        if (applicant == null) return BadRequest("Must be an applicant profile to withdraw");

        var app = await _context.JobApplications.FirstOrDefaultAsync(a => a.JobId == jobId && a.ApplicantId == applicant.ApplicantId);
        if (app == null) return NotFound("Application not found");

        _context.JobApplications.Remove(app);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Application withdrawn successfully" });
    }

    // PATCH: api/applications/{id}/status
    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
    {
        var app = await _context.JobApplications.FindAsync(id);
        if (app == null) return NotFound("Application not found");

        app.Status = status;
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Status updated successfully" });
    }

    // POST: api/applications/{id}/schedule
    [HttpPost("{id}/schedule")]
    [Authorize]
    public async Task<IActionResult> ScheduleInterview(Guid id, [FromBody] InterviewDto request)
    {
        var app = await _context.JobApplications.FindAsync(id);
        if (app == null) return NotFound("Application not found");

        app.Status = "Interview Scheduled";
        app.InterviewDate = request.Date;
        app.InterviewMode = request.Mode;
        app.MeetingLink = request.Link ?? "https://meet.google.com/abc-defg-hij"; // Mock link if not provided
        app.InterviewDuration = request.Duration;
        app.InterviewNotes = request.Notes;

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Interview scheduled successfully" });
    }

    // POST: api/applications/{id}/message
    [HttpPost("{id}/message")]
    [Authorize]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] MessageDto request)
    {
        var app = await _context.JobApplications.FindAsync(id);
        if (app == null) return NotFound("Application not found");

        var message = new ApplicationMessage
        {
            MessageId = Guid.NewGuid(),
            ApplicationId = id,
            SenderRole = "Recruiter", // Assuming recruiter context for now
            Subject = request.Subject,
            Body = request.Message,
            SentAt = DateTime.UtcNow
        };

        _context.ApplicationMessages.Add(message);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Message sent successfully" });
    }

    public record InterviewDto(DateTime Date, string Mode, string? Link, int? Duration, string? Notes);
    public record MessageDto(string Subject, string Message);
}
