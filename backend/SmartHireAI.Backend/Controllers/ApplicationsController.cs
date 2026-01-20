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
    private readonly Services.IAIService _aiService;
    private readonly Services.IEmailService _emailService;

    public ApplicationsController(ApplicationDbContext context, Services.IAIService aiService, Services.IEmailService emailService)
    {
        _context = context;
        _aiService = aiService;
        _emailService = emailService;
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
                a.MeetingLink,
                a.RoundId
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

        // Calculate placement rate (Based on Hired status)
        var hiredCount = await _context.JobApplications
             .Include(a => a.JobDescription)
             .CountAsync(a => a.JobDescription.RecruiterId == recruiter.RecruiterId && a.Status == "Hired");

        var placementRate = totalCandidates > 0 ? (hiredCount * 100 / totalCandidates) : 0;

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
            .Where(a => a.JobDescription.RecruiterId == recruiter.RecruiterId && a.Status != "Rejected")
            .OrderByDescending(a => a.AppliedAt)
            .Take(10)
            .Select(a => new
            {
                Name = a.Applicant.User.FullName ?? "Unknown",
                Role = a.JobDescription.Title,
                Score = (int)a.AtsScore,
                a.AppliedAt,
                a.Status,
                a.ApplicationId,
                Email = a.Applicant.User.Email
            })
            .ToListAsync();

        var recentApps = rawApps.Select(a => new
        {
            Id = a.ApplicationId,
            a.Name,
            a.Role,
            a.Score,
            Label = a.Status == "Hired" ? "Hired" : (a.Score >= 90 ? "Highly Suitable" : a.Score >= 70 ? "Suitable" : a.Score < 30 ? "Poor" : "Needs Improvement"),
            Time = (DateTime.UtcNow - a.AppliedAt).TotalHours < 24
                    ? $"{(int)(DateTime.UtcNow - a.AppliedAt).TotalHours}h ago"
                    : $"{(int)(DateTime.UtcNow - a.AppliedAt).TotalDays}d ago",
            a.Status,
            a.Email
        });

        return Ok(recentApps);
    }

    // POST: api/applications/apply
    // POST: api/applications/apply
    [HttpPost("apply")]
    [Authorize]
    public async Task<IActionResult> Apply(Guid jobId)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var applicant = await _context.Applicants
            .Include(a => a.User) // Include User for Name/Email
            .FirstOrDefaultAsync(a => a.User.UserId == userId);

        if (applicant == null) return BadRequest("Must be an applicant profile to apply");

        // Check if already applied
        var existingApp = await _context.JobApplications
            .FirstOrDefaultAsync(a => a.JobId == jobId && a.ApplicantId == applicant.ApplicantId);

        if (existingApp != null && !existingApp.Status.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest($"Already applied to this job. Status is: {existingApp.Status}");
        }

        // Get Job Description with Recruiter info
        var job = await _context.JobDescriptions
            .Include(j => j.Recruiter)
            .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(j => j.JobId == jobId);

        if (job == null) return NotFound("Job not found");

        // Get Latest Resume
        var latestResume = await _context.Resumes
            .Where(r => r.ApplicantId == applicant.ApplicantId)
            .OrderByDescending(r => r.ParsedAt)
            .FirstOrDefaultAsync();

        float finalScore = 0;

        if (latestResume != null && !string.IsNullOrWhiteSpace(latestResume.ResumeText) && !string.IsNullOrWhiteSpace(job.Description))
        {
            var matchResult = await _aiService.MatchJobAsync(latestResume.ResumeText, job.Description);
            if (matchResult != null)
            {
                finalScore = matchResult.MatchSummary.MatchPercentage;
            }
        }

        if (existingApp != null)
        {
            // Reapply logic
            existingApp.Status = "Reapplied";
            existingApp.AppliedAt = DateTime.UtcNow;
            existingApp.AtsScore = finalScore;
            existingApp.InterviewDate = null;
            existingApp.InterviewMode = null;
            existingApp.MeetingLink = null;

            await _context.SaveChangesAsync();

            // Send Notification for Re-application as well? Requirement says "When an applicant completes an application". 
            // Reuse logic below or extract to method. For now, assuming "new applicant" focus, but re-application is also an "application".
            // Let's include it for completeness, or just duplicate the logic briefly since it's cleaner than refactoring the whole method right now.
            // Actually, requirements say "New applicant has applied". I'll treat re-apply as apply.
            // But strict requirement: "application submission". Reapply is a submission.
        }
        else
        {
            var app = new JobApplication
            {
                ApplicationId = Guid.NewGuid(),
                JobId = jobId,
                ApplicantId = applicant.ApplicantId,
                Status = "Applied",
                AppliedAt = DateTime.UtcNow,
                AtsScore = finalScore
            };

            _context.JobApplications.Add(app);
            await _context.SaveChangesAsync();
        }

        // --- Send Email Notification to Recruiter ---
        if (job.Recruiter?.User?.Email != null)
        {
            try
            {
                var recruiterEmail = job.Recruiter.User.Email;
                var jobTitle = job.Title;
                var candidateName = applicant.User?.FullName ?? "Unknown Candidate";
                var candidateEmail = applicant.User?.Email ?? "No Email";
                var candidateExperience = $"{applicant.ExperienceYears} years";
                var matchScore = (int)finalScore;

                string subject = $"New Job Application Received – {jobTitle}";
                string body = $@"
                    <div style='font-family: Arial, sans-serif;'>
                        <p>Hi Team,</p>
                        <p>A new applicant has applied for the position of <strong>{jobTitle}</strong>.</p>
                        <br/>
                        <p><strong>Applicant Details:</strong></p>
                        <p>Name: {candidateName}</p>
                        <p>Email: {candidateEmail}</p>
                        <p>Experience: {candidateExperience}</p>
                        <p>Match Score: {matchScore}%</p>
                        <br/>
                        <p>You can review the applicant profile and resume from the recruiter dashboard.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p>SmartHireAI Team</p>
                    </div>";

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await _emailService.SendEmailAsync(recruiterEmail, subject, body);
                        Console.WriteLine($"[{DateTime.UtcNow}] [Notification] New Application email sent to {recruiterEmail} (JobId: {jobId}, ApplicantId: {applicant.ApplicantId})");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Error] Failed to send new application email: {ex.Message}");
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Recruiter notification logic failed: {ex.Message}");
            }
        }

        return Ok(new { Message = "Application submitted successfully", Score = finalScore });
    }

    // GET: api/applications/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<object>> GetApplicationById(Guid id)
    {
        try
        {
            var application = await _context.JobApplications
                .Include(a => a.Applicant)
                .ThenInclude(app => app.User)
                .Include(a => a.Applicant.Education) // Include Education
                .Include(a => a.JobDescription)
                .ThenInclude(j => j.Recruiter)
                .Include(a => a.Applicant.WorkExperience)
                .Include(a => a.Applicant.Resumes)
                .FirstOrDefaultAsync(a => a.ApplicationId == id);

            if (application == null) return NotFound("Application not found");

            // Track First View & Send Email
            if (!application.IsViewedByRecruiter)
            {
                application.IsViewedByRecruiter = true;
                _context.Entry(application).Property(x => x.IsViewedByRecruiter).IsModified = true;
                await _context.SaveChangesAsync();

                var applicantUser = application.Applicant?.User;
                if (!string.IsNullOrEmpty(applicantUser?.Email))
                {
                    try
                    {
                        string subject = "Your application is under review";
                        string body = $@"
                            <div style='font-family: Arial, sans-serif;'>
                                <h2>Application Update</h2>
                                <p>Dear {applicantUser.FullName},</p>
                                <p>We are writing to let you know that your application for the position of <strong>{application.JobDescription?.Title}</strong> at <strong>{application.JobDescription?.Recruiter?.CompanyName ?? "the company"}</strong> is now being reviewed by our recruitment team.</p>
                                <p>We will get back to you with further updates.</p>
                                <br/>
                                <p>Best Regards,</p>
                                <p><strong>HireLens Team</strong></p>
                            </div>";

                        // Run in background to not block response
                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                await _emailService.SendEmailAsync(applicantUser.Email, subject, body);
                                Console.WriteLine($"[Notification] First-view email sent to {applicantUser.Email}");
                            }
                            catch (Exception emailEx)
                            {
                                Console.WriteLine($"[Error] Failed to send email: {emailEx.Message}");
                            }
                        });
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[Error] Email logic failed: {ex.Message}");
                    }
                }
            }

            // Safe navigation for Applicant
            var applicant = application.Applicant;
            if (applicant == null) return NotFound("Applicant profile not found for this application");

            // Get the latest resume safely
            var latestResume = applicant.Resumes?
                .OrderByDescending(r => r.ParsedAt)
                .FirstOrDefault();

            var user = applicant.User;
            var edu = applicant.Education.FirstOrDefault();

            var response = new
            {
                application.ApplicationId,
                application.JobId, // Added JobId
                Name = user?.FullName ?? "Unknown",
                Role = application.JobDescription?.Title ?? "Unknown Role",
                Score = (int)application.AtsScore,
                application.Status,
                Email = user?.Email,
                Phone = applicant.MobileNumber ?? user?.MobileNumber ?? "N/A",
                Experience = applicant.ExperienceYears,
                Location = applicant.Location ?? user?.Location ?? "Unknown",
                // CurrentRole moved to be next to Experience for consistency
                CurrentRole = applicant.CurrentRole,
                ProfileImage = user?.ProfileImage,

                // Enhanced details
                LinkedInUrl = applicant.LinkedInUrl,
                Gender = applicant.Gender,
                DateOfBirth = applicant.DateOfBirth,
                PreferredRole = applicant.PreferredRole,

                // Full lists
                Education = applicant.Education.Select(e => new
                {
                    e.CollegeName,
                    e.Degree,
                    e.Specialization,
                    e.CompletionYear,
                    e.Grade
                }).ToList(),

                WorkExperience = applicant.WorkExperience.Select(w => new
                {
                    w.CompanyName,
                    w.Role,
                    w.Duration,
                    w.Description
                }).ToList(),

                application.InterviewDate,
                application.InterviewMode,
                application.MeetingLink,
                application.AppliedAt,
                // Resume Details
                ResumeId = latestResume?.ResumeId,
                ResumeText = latestResume?.ResumeText ?? "No resume text available.",
                ResumeHealthScore = latestResume?.ResumeHealthScore ?? 0,
                Skills = latestResume?.Entities
                            .Where(e => e.EntityType == "SKILL")
                            .Select(e => e.EntityValue)
                            .Distinct()
                            .ToList() ?? new List<string>(),
                JobDescriptionText = application.JobDescription?.Description
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error fetching application details: {ex}");
            return StatusCode(500, $"Internal Server Error: {ex.Message}");
        }
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
            .Include(a => a.Applicant.Education) // Include Education
            .Include(a => a.JobDescription)
            .Where(a => a.JobDescription.RecruiterId == recruiter.RecruiterId && a.Status != "Rejected")
            .Select(a => new
            {
                a.ApplicationId,
                Name = a.Applicant.User.FullName ?? "Unknown",
                Role = a.JobDescription.Title,
                Score = (int)(a.AtsScore <= 1f ? a.AtsScore * 100 : a.AtsScore),
                a.Status,
                Email = a.Applicant.User.Email,
                Phone = a.Applicant.User.MobileNumber,
                Experience = a.Applicant.ExperienceYears,
                a.Applicant.Location,
                College = a.Applicant.Education.Select(e => e.CollegeName).FirstOrDefault(), // Map first edu
                CurrentRole = a.Applicant.CurrentRole,
                // Grade = a.Applicant.Education.FirstOrDefault().Grade,
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
            Label = c.Score >= 90 ? "Highly Suitable" : c.Score >= 70 ? "Suitable" : c.Score < 30 ? "Poor" : "Average",
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
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] StatusDto request)
    {
        var app = await _context.JobApplications
            .Include(a => a.Applicant).ThenInclude(user => user.User)
            .Include(a => a.JobDescription).ThenInclude(job => job.Recruiter)
            .FirstOrDefaultAsync(a => a.ApplicationId == id); // Include necessary data

        if (app == null) return NotFound("Application not found");

        var oldStatus = app.Status;
        app.Status = request.Status;
        await _context.SaveChangesAsync();

        // Check if transitioning to Rejected
        if (!string.Equals(oldStatus, "Rejected", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(request.Status, "Rejected", StringComparison.OrdinalIgnoreCase))
        {
            var applicantUser = app.Applicant?.User;
            if (applicantUser != null && !string.IsNullOrEmpty(applicantUser.Email))
            {
                try
                {
                    string candidateName = applicantUser.FullName ?? "Candidate";
                    string subject = "Update on Your Application – SmartHireAI";
                    string body = $@"
                        <div style='font-family: Arial, sans-serif;'>
                            <p>Hi {candidateName},</p>
                            <p>Thank you for taking the time to apply. After careful consideration, we’ve decided to move forward with other candidates whose experience more closely matches our current needs.</p>
                            <p>We appreciate your interest and encourage you to apply again in the future.</p>
                            <br/>
                            <p>Best regards,</p>
                            <p>The Hiring Team</p>
                        </div>";

                    // Run in background to not block response
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await _emailService.SendEmailAsync(applicantUser.Email, subject, body);
                            Console.WriteLine($"[{DateTime.UtcNow}] [Notification] Rejection email sent to {applicantUser.Email} (ApplicantId: {app.ApplicantId}, RecruiterId: {app.JobDescription?.RecruiterId})");
                        }
                        catch (Exception emailEx)
                        {
                            Console.WriteLine($"[Error] Failed to send rejection email: {emailEx.Message}");
                        }
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Error] Rejection logic failed: {ex.Message}");
                }
            }
        }

        return Ok(new { Message = "Status updated successfully" });
    }

    // POST: api/applications/{id}/schedule
    [HttpPost("{id}/schedule")]
    [Authorize]
    public async Task<IActionResult> ScheduleInterview(Guid id, [FromBody] InterviewDto request)
    {
        var app = await _context.JobApplications.FindAsync(id);
        if (app == null) return NotFound("Application not found");

        if (!string.IsNullOrEmpty(request.RoundId))
        {
            var job = await _context.JobDescriptions.FindAsync(app.JobId);
            if (job != null && !string.IsNullOrEmpty(job.InterviewRounds))
            {
                // Simple string check or proper JSON parsing
                // Since I don't want to add Newtonsoft.Json dependency if not present, and System.Text.Json requires a typed class, 
                // I'll do a basic check or assumes the caller (frontend) is correct, BUT the requirement stays "Backend must validate".
                // I will try to use System.Text.Json.JsonDocument
                try
                {
                    using (var doc = System.Text.Json.JsonDocument.Parse(job.InterviewRounds))
                    {
                        bool roundFound = false;
                        if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            foreach (var element in doc.RootElement.EnumerateArray())
                            {
                                // Check if the element is a string and matches the request round ID (which is the name)
                                if (element.ValueKind == System.Text.Json.JsonValueKind.String && element.GetString() == request.RoundId)
                                {
                                    roundFound = true;
                                    break;
                                }
                                // Fallback: If it IS an object (legacy/advanced format), look for "id" or "name"
                                else if (element.ValueKind == System.Text.Json.JsonValueKind.Object)
                                {
                                    if ((element.TryGetProperty("id", out var idProp) && idProp.GetString() == request.RoundId) ||
                                        (element.TryGetProperty("name", out var nameProp) && nameProp.GetString() == request.RoundId))
                                    {
                                        roundFound = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (!roundFound)
                        {
                            return BadRequest($"Invalid Interview Round '{request.RoundId}' for this job.");
                        }
                    }
                }
                catch
                {
                    // Fallback or ignore if JSON is malformed
                    return BadRequest("Error validating interview round configuration.");
                }
            }
        }

        if (app.JobDescription == null)
        {
            await _context.Entry(app).Reference(a => a.JobDescription).Query().Include(j => j.Recruiter).LoadAsync();
        }

        if (app.Applicant == null)
        {
            await _context.Entry(app).Reference(a => a.Applicant).Query().Include(a => a.User).LoadAsync();
        }

        if (app.JobDescription == null) return NotFound("Job Description not found");
        var jobDesc = app.JobDescription;

        var applicantUser = app.Applicant?.User;
        if (applicantUser == null) return NotFound("Applicant or User not found");

        app.Status = "Interview Scheduled";
        app.InterviewDate = request.Date;
        app.InterviewMode = request.Mode;
        app.MeetingLink = request.Link ?? "https://meet.google.com/abc-defg-hij"; // Mock link if not provided
        app.InterviewDuration = request.Duration;
        app.InterviewNotes = request.Notes;
        app.RoundId = request.RoundId;

        // 1. Send Email to Applicant
        if (!string.IsNullOrEmpty(applicantUser.Email))
        {
            var roundName = request.RoundId ?? "Interview";
            var emailSubject = $"Interview Scheduled - {jobDesc.Title}";
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2>Interview Scheduled</h2>
                    <p>Dear {applicantUser.FullName},</p>
                    <p>An interview has been scheduled for the position of <strong>{jobDesc.Title}</strong> at <strong>{jobDesc.Recruiter?.CompanyName ?? "the company"}</strong>.</p>
                    <br/>
                    <p><strong>Round:</strong> {roundName}</p>
                    <p><strong>Date & Time:</strong> {request.Date:f}</p>
                    <p><strong>Mode:</strong> {request.Mode}</p>
                    <p><strong>Link/Location:</strong> {app.MeetingLink}</p>
                    <br/>
                    <p>Please check your applicant portal inbox for more details.</p>
                    <p>Best Regards,</p>
                    <p><strong>HireLens Team</strong></p>
                </div>";

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendEmailAsync(applicantUser.Email, emailSubject, emailBody);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending interview email: {ex.Message}");
                }
            });
        }

        // 2 Create or Get Inbox Thread
        var thread = await _context.InboxThreads
            .FirstOrDefaultAsync(t => t.ApplicationId == app.ApplicationId);

        if (thread == null)
        {
            thread = new InboxThread
            {
                ThreadId = Guid.NewGuid(),
                ApplicationId = app.ApplicationId,
                RecruiterId = jobDesc.RecruiterId,
                ApplicantId = app.ApplicantId,
                Subject = $"Interview - {jobDesc.Title}",
                LastMessageAt = DateTime.UtcNow
            };
            _context.InboxThreads.Add(thread);
        }
        else
        {
            thread.LastMessageAt = DateTime.UtcNow;
        }

        // 3. Add System Message
        var systemMessage = new InboxMessage
        {
            MessageId = Guid.NewGuid(),
            ThreadId = thread.ThreadId,
            SenderId = Guid.Empty, // System
            SenderRole = "System",
            Content = $"Interview Scheduled: {request.RoundId ?? "General Round"} on {request.Date:f}. Mode: {request.Mode}.",
            SentAt = DateTime.UtcNow,
            IsRead = false
        };
        _context.InboxMessages.Add(systemMessage);

        // 4. Create Notification for Applicant
        var notification = new Notification
        {
            NotificationId = Guid.NewGuid(),
            UserId = applicantUser!.UserId,
            Title = "Interview Scheduled",
            Message = $"New interview scheduled for {jobDesc.Title}",
            Type = "InterviewScheduled",
            ReferenceId = thread.ThreadId,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Interview scheduled successfully" });
    }

    // POST: api/applications/{id}/message
    [HttpPost("{id}/message")]
    [Authorize]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] MessageDto request)
    {
        var app = await _context.JobApplications
            .Include(a => a.Applicant).ThenInclude(user => user.User)
            .Include(a => a.JobDescription).ThenInclude(job => job.Recruiter).ThenInclude(r => r.User)
            .FirstOrDefaultAsync(a => a.ApplicationId == id);

        if (app == null) return NotFound("Application not found");

        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        // 1. Create or Get Inbox Thread
        var thread = await _context.InboxThreads
            .FirstOrDefaultAsync(t => t.ApplicationId == app.ApplicationId);

        if (thread == null)
        {
            thread = new InboxThread
            {
                ThreadId = Guid.NewGuid(),
                ApplicationId = app.ApplicationId,
                RecruiterId = app.JobDescription.RecruiterId,
                ApplicantId = app.ApplicantId,
                Subject = request.Subject ?? $"Message regarding {app.JobDescription.Title}",
                LastMessageAt = DateTime.UtcNow
            };
            _context.InboxThreads.Add(thread);
        }
        else
        {
            thread.LastMessageAt = DateTime.UtcNow;
            // Update subject if it's generic? No, keep original subject to keep thread context or append? 
            // Let's just update the timestamp.
        }

        // 2. Add Message to Inbox (Unified System)
        var message = new InboxMessage
        {
            MessageId = Guid.NewGuid(),
            ThreadId = thread.ThreadId,
            SenderId = userId,
            SenderRole = "Recruiter", // Since this endpoint is for Recruiter->Candidate contact
            Content = request.Message,
            SentAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.InboxMessages.Add(message);

        // 3. Create Notification for Applicant
        var notification = new Notification
        {
            NotificationId = Guid.NewGuid(),
            UserId = app.Applicant.User.UserId,
            Title = "New Message from Recruiter",
            Message = $"Recruiter for {app.JobDescription.Title} sent you a message.",
            Type = "MessageReceived",
            ReferenceId = thread.ThreadId,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);

        await _context.SaveChangesAsync();

        // 4. Send Email to Applicant with Preview
        var applicantUser = app.Applicant.User;
        if (!string.IsNullOrEmpty(applicantUser?.Email))
        {
            string emailSubject = $"New Message: {request.Subject ?? "Regarding your application"}";
            string emailBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2>New Message from Recruiter</h2>
                    <p>Dear {applicantUser.FullName},</p>
                    <p>You have received a new message regarding your application for <strong>{app.JobDescription.Title}</strong> at <strong>{app.JobDescription.Recruiter.CompanyName}</strong>.</p>
                    <br/>
                    <div style='background-color: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;'>
                        <p style='margin: 0; font-style: italic;'>""{request.Message}""</p>
                    </div>
                    <br/>
                    <p>Please log in to your dashboard to reply.</p>
                    <p>Best Regards,</p>
                    <p><strong>HireLens Team</strong></p>
                </div>";

            _ = Task.Run(async () =>
            {
                try
                {
                    await _emailService.SendEmailAsync(applicantUser.Email, emailSubject, emailBody);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending message notification email: {ex.Message}");
                }
            });
        }

        return Ok(new { Message = "Message sent successfully" });
    }

    // POST: api/applications/{id}/accept-interview
    [HttpPost("{id}/accept-interview")]
    [Authorize]
    public async Task<IActionResult> AcceptInterview(Guid id)
    {
        var app = await _context.JobApplications.FindAsync(id);
        if (app == null) return NotFound("Application not found");

        if (app.Status != "Interview Scheduled")
        {
            return BadRequest($"Cannot accept interview. Current status is: {app.Status}");
        }

        app.Status = "Interview Accepted";
        app.InterviewAcceptedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Interview accepted successfully" });
    }

    // POST: api/applications/{id}/hire
    [HttpPost("{id}/hire")]
    [Authorize]
    public async Task<IActionResult> HireCandidate(Guid id)
    {
        var app = await _context.JobApplications
            .Include(a => a.Applicant)
            .FirstOrDefaultAsync(a => a.ApplicationId == id);

        if (app == null) return NotFound("Application not found");

        // Check if candidate is already hired for ANY active role
        var existingHiredApp = await _context.JobApplications
            .Where(a => a.ApplicantId == app.ApplicantId && a.Status == "Hired")
            .FirstOrDefaultAsync();

        if (existingHiredApp != null)
        {
            return BadRequest("Candidate is already hired for another role. Cannot hire for multiple roles simultaneously.");
        }

        // Check Job Openings & Status
        var job = await _context.JobDescriptions.FindAsync(app.JobId);
        if (job == null) return NotFound("Job not found");

        if (job.Status == "Closed" || job.Status == "Completed")
        {
            return BadRequest($"This job is already closed. No further hiring is allowed.");
        }

        // Count existing hires for this job
        var currentHires = await _context.JobApplications
            .CountAsync(a => a.JobId == app.JobId && a.Status == "Hired");

        if (currentHires >= job.NumberOfOpenings)
        {
            // Should not happen if status was correct, but double check
            return BadRequest($"Vacancy full. {currentHires}/{job.NumberOfOpenings} positions are already filled.");
        }

        app.Status = "Hired";
        app.HiredAt = DateTime.UtcNow;

        // Auto-Close Job if this was the last opening
        if (currentHires + 1 >= job.NumberOfOpenings)
        {
            job.Status = "Closed";
        }

        await _context.SaveChangesAsync();

        return Ok(new { Message = "Candidate hired successfully" });
    }

    public record InterviewDto(DateTime Date, string Mode, string? Link, int? Duration, string? Notes, string? RoundId);
    public record MessageDto(string Subject, string Message);
    public record StatusDto(string Status);
}
