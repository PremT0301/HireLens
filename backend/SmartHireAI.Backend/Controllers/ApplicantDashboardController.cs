using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;
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
    private readonly IAIService _aiService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(ApplicationDbContext context, IAIService aiService, ILogger<DashboardController> logger)
    {
        _context = context;
        _aiService = aiService;
        _logger = logger;
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

        // ── 1. Fetch latest resume (single source of truth) ────────────────
        var latestResume = user.ApplicantProfile != null
            ? await _context.Resumes
                .Where(r => r.ApplicantId == user.ApplicantProfile.ApplicantId)
                .OrderByDescending(r => r.ParsedAt)
                .FirstOrDefaultAsync()
            : null;

        var hasResume = latestResume != null && !string.IsNullOrWhiteSpace(latestResume.ResumeText);

        var applicationsCount = await _context.JobApplications
            .CountAsync(a => a.ApplicantId == user.ApplicantProfile!.ApplicantId);

        // ── 2. Build base summary ───────────────────────────────────────────
        var summary = new ApplicantDashboardSummaryDto
        {
            HasResume = hasResume,
            // Surface the latest resumeId so the frontend can use it for Gap Analysis
            ResumeId = latestResume?.ResumeId,
            ResumeHealth = new ResumeHealthDto
            {
                AtsScore = user.ResumeAnalysis?.AtsScore ?? 0,
                SectionCompleteness = new Dictionary<string, bool>
                {
                    { "Contact", true },
                    { "Skills",  user.ResumeAnalysis != null },
                    { "Experience", user.ApplicantProfile?.ExperienceYears > 0 },
                    { "Education", await _context.Education.AnyAsync(e => e.ApplicantId == user.ApplicantProfile!.ApplicantId) }
                },
                ImprovementTips = user.ResumeAnalysis != null
                    ? JsonSerializer.Deserialize<List<string>>(user.ResumeAnalysis.Feedback ?? "[]") ?? new()
                    : new List<string> { "Upload your resume to get AI tips." }
            },
            // Detected skills always come from the stored AI analysis
            SkillGapInsights = new SkillGapInsightsDto
            {
                DetectedSkills = user.ResumeAnalysis != null
                    ? JsonSerializer.Deserialize<List<string>>(user.ResumeAnalysis.DetectedSkills ?? "[]") ?? new()
                    : new(),
                MissingSkills = new List<string>() // populated below from AI
            }
        };

        // ── 3. Fetch active jobs for recommendations ────────────────────────
        var activeJobs = await _context.JobDescriptions
            .Include(j => j.Recruiter)
            .Where(j => j.Status == "Active")
            .Take(4)
            .ToListAsync();

        // ── 4. Compute AI match scores (single source of truth) ────────────
        var matchPercentages = new List<float>();

        if (hasResume)
        {
            foreach (var job in activeJobs)
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(job.Description))
                    {
                        // No description provided — skip AI call, score = 0
                        summary.RecommendedJobs.Add(new RecommendedJobDto
                        {
                            JobId      = job.JobId,
                            Title      = job.Title,
                            CompanyName = job.Recruiter?.CompanyName ?? "HireLens Partner",
                            Location   = job.Location ?? "Remote",
                            MatchPercentage = 0
                        });
                        continue;
                    }

                    var matchResult = await _aiService.MatchJobAsync(latestResume!.ResumeText!, job.Description);
                    var score = matchResult != null
                        ? (int)Math.Round(matchResult.MatchSummary.MatchPercentage)
                        : 0;

                    matchPercentages.Add(score);

                    // Populate missing skills from the first successful AI result
                    if (matchResult != null && summary.SkillGapInsights.MissingSkills.Count == 0
                        && matchResult.SkillAnalysis?.MissingSkills != null)
                    {
                        summary.SkillGapInsights.MissingSkills = matchResult.SkillAnalysis.MissingSkills;
                    }

                    summary.RecommendedJobs.Add(new RecommendedJobDto
                    {
                        JobId       = job.JobId,
                        Title       = job.Title,
                        CompanyName = job.Recruiter?.CompanyName ?? "HireLens Partner",
                        Location    = job.Location ?? "Remote",
                        MatchPercentage = score   // ← AI-derived, not random
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "AI match failed for job {JobId}; using score 0", job.JobId);
                    summary.RecommendedJobs.Add(new RecommendedJobDto
                    {
                        JobId       = job.JobId,
                        Title       = job.Title,
                        CompanyName = job.Recruiter?.CompanyName ?? "HireLens Partner",
                        Location    = job.Location ?? "Remote",
                        MatchPercentage = 0
                    });
                }
            }
        }
        else
        {
            // No resume — surface jobs with 0 match so UI can prompt upload
            foreach (var job in activeJobs)
            {
                summary.RecommendedJobs.Add(new RecommendedJobDto
                {
                    JobId       = job.JobId,
                    Title       = job.Title,
                    CompanyName = job.Recruiter?.CompanyName ?? "HireLens Partner",
                    Location    = job.Location ?? "Remote",
                    MatchPercentage = 0
                });
            }
        }

        // ── 5. Derive RoleMatchPercentage from real AI data ─────────────────
        var avgMatchPct = matchPercentages.Count > 0
            ? (int)Math.Round(matchPercentages.Average())
            : 0;

        summary.QuickStats = new QuickStatsDto
        {
            ProfileCompletion  = user.ProfileCompletionPercentage,
            AtsScore           = user.ResumeAnalysis?.AtsScore ?? 0,
            RoleMatchPercentage = avgMatchPct,   // ← AI-derived average, not hardcoded 85
            ApplicationsSent   = applicationsCount,
            ProfileViews       = 0               // No tracking yet — accurate placeholder
        };

        // ── 6. Activity timeline ────────────────────────────────────────────
        summary.ActivityTimeline.Add(new ActivityTimelineDto
        {
            Event = "Logged in",
            Date  = DateTime.UtcNow.AddHours(-1),
            Icon  = "login"
        });
        if (user.ResumeUploadedAt != null)
            summary.ActivityTimeline.Add(new ActivityTimelineDto
            {
                Event = "Resume uploaded",
                Date  = user.ResumeUploadedAt.Value,
                Icon  = "upload"
            });

        // ── 7. Weekly progress ──────────────────────────────────────────────
        var last7Days = Enumerable.Range(0, 7)
            .Select(offset => DateTime.UtcNow.Date.AddDays(-offset))
            .Reverse()
            .ToList();

        var applicationsActivity = await _context.JobApplications
            .Where(a => a.ApplicantId == user.ApplicantProfile!.ApplicantId
                     && a.AppliedAt >= last7Days.First())
            .GroupBy(a => a.AppliedAt.Date)
            .Select(g => new { Day = g.Key, Count = g.Count() })
            .ToListAsync();

        foreach (var date in last7Days)
        {
            var activity = applicationsActivity.FirstOrDefault(a => a.Day == date);
            int strength = Math.Min(100, 40 + (activity?.Count ?? 0) * 15);
            summary.WeeklyProgress.Add(new WeeklyProgressDto
            {
                Day      = date.ToString("ddd"),
                Strength = strength
            });
        }

        return Ok(summary);
    }
}
