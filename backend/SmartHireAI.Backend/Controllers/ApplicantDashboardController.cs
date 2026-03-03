using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text.Json;

namespace SmartHireAI.Backend.Controllers;

[Authorize(Roles = "APPLICANT")]
[ApiController]
[Route("api/applicant/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<ApplicantDashboardSummaryDto>> GetSummary()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users
            .Include(u => u.ApplicantProfile)
            .Include(u => u.ResumeAnalysis)
            .FirstOrDefaultAsync(u => u.UserId == userId);

        if (user == null) return NotFound("User not found.");

        var applicationsCount = await _context.JobApplications.CountAsync(a => a.ApplicantId == user.ApplicantProfile!.ApplicantId);

        var summary = new ApplicantDashboardSummaryDto
        {
            HasResume = user.ResumeAnalysis != null,
            QuickStats = new QuickStatsDto
            {
                ProfileCompletion = user.ProfileCompletionPercentage,
                AtsScore = user.ResumeAnalysis?.AtsScore ?? 0,
                RoleMatchPercentage = 85, // Placeholder/Calculated later
                ApplicationsSent = applicationsCount,
                ProfileViews = 12 // Placeholder
            },
            ResumeHealth = new ResumeHealthDto
            {
                AtsScore = user.ResumeAnalysis?.AtsScore ?? 0,
                SectionCompleteness = new Dictionary<string, bool>
                {
                    { "Contact", true },
                    { "Skills", user.ResumeAnalysis != null },
                    { "Experience", user.ApplicantProfile?.ExperienceYears > 0 },
                    { "Education", await _context.Education.AnyAsync(e => e.ApplicantId == user.ApplicantProfile!.ApplicantId) }
                },
                ImprovementTips = user.ResumeAnalysis != null 
                    ? JsonSerializer.Deserialize<List<string>>(user.ResumeAnalysis.Feedback ?? "[]") ?? new() 
                    : new List<string> { "Upload your resume to get AI tips." }
            },
            SkillGapInsights = new SkillGapInsightsDto
            {
                DetectedSkills = user.ResumeAnalysis != null 
                    ? JsonSerializer.Deserialize<List<string>>(user.ResumeAnalysis.DetectedSkills ?? "[]") ?? new() 
                    : new(),
                MissingSkills = new List<string> { "Docker", "Kubernetes", "AWS" }, // Placeholder
            }
        };

        // Recommended Jobs (Mock logic for now: top 4 active jobs)
        var jobs = await _context.JobDescriptions
            .Where(j => j.Status == "Active")
            .Take(4)
            .ToListAsync();

        foreach (var job in jobs)
        {
            summary.RecommendedJobs.Add(new RecommendedJobDto
            {
                JobId = job.JobId,
                Title = job.Title,
                CompanyName = "HireLens Partners", // Need Recruiter Join for real
                Location = job.Location ?? "Remote",
                MatchPercentage = new Random().Next(70, 95)
            });
        }

        // Timeline
        summary.ActivityTimeline.Add(new ActivityTimelineDto { Event = "Logged in", Date = DateTime.UtcNow.AddHours(-1), Icon = "login" });
        if (user.ResumeUploadedAt != null)
            summary.ActivityTimeline.Add(new ActivityTimelineDto { Event = "Resume uploaded", Date = user.ResumeUploadedAt.Value, Icon = "upload" });
        
        // Weekly Progress (Calculated from job applications activity)
        var last7Days = Enumerable.Range(0, 7)
            .Select(offset => DateTime.UtcNow.Date.AddDays(-offset))
            .Reverse()
            .ToList();

        var applicationsActivity = await _context.JobApplications
            .Where(a => a.ApplicantId == user.ApplicantProfile!.ApplicantId && a.AppliedAt >= last7Days.First())
            .GroupBy(a => a.AppliedAt.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .ToListAsync();

        foreach (var date in last7Days)
        {
            var activity = applicationsActivity.FirstOrDefault(a => a.Day == date);
            // Scaling strength: each application adds 25 points, baseline is 40 (for simulated profile "existence")
            int strength = 40 + (activity?.Count ?? 0) * 15;
            if (strength > 100) strength = 100;

            summary.WeeklyProgress.Add(new WeeklyProgressDto 
            { 
                Day = date.ToString("ddd"), 
                Strength = strength 
            });
        }

        return Ok(summary);
    }
}
