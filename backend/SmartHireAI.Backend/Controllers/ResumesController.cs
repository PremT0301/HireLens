using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;
using SmartHireAI.Backend.Filters;
using Microsoft.AspNetCore.Mvc;


namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumesController : ControllerBase
{
    private readonly IResumeParserService _parserService;
    private readonly IAIService _aiService;
    private readonly ApplicationDbContext _context;
    private readonly IUsageTrackingService _usageService;
    private readonly IAnalysisService _analysisService;
    private readonly ILogger<ResumesController> _logger;

    public ResumesController(
        IResumeParserService parserService,
        IAIService aiService,
        ApplicationDbContext context,
        IUsageTrackingService usageService,
        IAnalysisService analysisService,
        ILogger<ResumesController> logger)
    {
        _parserService = parserService;
        _aiService = aiService;
        _context = context;
        _usageService = usageService;
        _analysisService = analysisService;
        _logger = logger;
    }


    [HttpPost("upload")]
    [Authorize] // Requires login
    [PlanRequirement("ResumeAnalysis")]


    public async Task<ActionResult<AnalyzeResumeOutput>> UploadResume(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        try
        {
            // 0. Get Current Applicant
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);
            var applicant = _context.Applicants.FirstOrDefault(a => a.ApplicantId == userId); // Assuming 1:1 sharing ID or FK

            // If ApplicantId is different from UserId (likely), we need to query differently.
            // Based on Entities.cs: Applicant.ApplicantId IS the Primary Key, and User is ForeignKey("ApplicantId"). 
            // Wait, Entities.cs says:
            // public Guid ApplicantId { get; set; }
            // [ForeignKey("ApplicantId")] public User User { get; set; }
            // This implies ApplicantId == UserId. Let's verify this assumption is valid or safe. 
            // Actually, in `Entities.cs`, ApplicantId is PK, and User is FK on ApplicantId? 
            // "public Guid ApplicantId { get; set; }" and "[ForeignKey("ApplicantId")] public User User"
            // Yes, this is a 1:1 where ApplicantId == UserId.

            if (applicant == null)
            {
                // Check if user exists but just doesn't have an applicant profile yet
                var userExists = _context.Users.Any(u => u.UserId == userId);
                if (userExists)
                {
                    // Auto-create applicant profile if missing (optional but helpful)
                    applicant = new Applicant { ApplicantId = userId, ExperienceYears = 0, Location = "Unknown" };
                    _context.Applicants.Add(applicant);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    return Unauthorized("User not found.");
                }
            }

            // 1. Process via Unified Analysis Service
            var result = await _analysisService.AnalyzeResumeAsync(userId, file);

            if (result == null)
            {
                return StatusCode(503, "AI Service is currently unavailable.");
            }

            // 2. Increment Usage
            await _usageService.IncrementUsageAsync(userId, "Matches");

            return Ok(new
            {
                message = "Resume uploaded and analyzed successfully.",
                analysis = result
            });

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing resume upload");
            return StatusCode(500, $"Processing failed: {ex.Message}");
        }
    }

    // GET: api/resumes/latest
    // Returns the latest resume metadata for the authenticated applicant.
    // Used by the frontend to get a resumeId for Gap Analysis without
    // going through the full dashboard load.
    [HttpGet("latest")]
    [Authorize]
    public async Task<IActionResult> GetLatestResume()
    {
        var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        // Resolve applicantId (1:1 with userId in this schema)
        var applicant = await _context.Applicants
            .FirstOrDefaultAsync(a => a.ApplicantId == userId);

        if (applicant == null)
            return Ok(new { hasResume = false, resumeId = (Guid?)null });

        var latest = await _context.Resumes
            .Where(r => r.ApplicantId == applicant.ApplicantId)
            .OrderByDescending(r => r.ParsedAt)
            .Select(r => new { r.ResumeId, r.ParsedAt })
            .FirstOrDefaultAsync();

        if (latest == null)
            return Ok(new { hasResume = false, resumeId = (Guid?)null });

        return Ok(new
        {
            hasResume = true,
            resumeId  = latest.ResumeId,
            parsedAt  = latest.ParsedAt
        });
    }

    [HttpGet("download/{id}")]
    [Authorize]
    public async Task<IActionResult> DownloadResume(Guid id)
    {
        try
        {
            // Get authenticated user
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized();
            }

            // Find the resume and verify ownership
            var resume = await _context.Resumes
                .Include(r => r.Applicant)
                .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(r => r.ResumeId == id);

            if (resume == null)
            {
                return NotFound("Resume not found.");
            }

            // Check if user is the applicant who owns this resume
            var isOwner = resume.Applicant?.User?.UserId == userId;

            // Check if user is a recruiter who has access to this candidate
            var isRecruiterWithAccess = false;
            if (!isOwner)
            {
                var recruiter = await _context.Recruiters
                    .FirstOrDefaultAsync(r => r.User.UserId == userId);

                if (recruiter != null)
                {
                    // Recruiter can access resume if the applicant has applied to any of their jobs
                    isRecruiterWithAccess = await _context.JobApplications
                        .AnyAsync(a => a.ApplicantId == resume.ApplicantId &&
                                      a.JobDescription.RecruiterId == recruiter.RecruiterId);
                }
            }

            if (!isOwner && !isRecruiterWithAccess)
            {
                return Forbid(); // User doesn't have permission to access this resume
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "resumes");

            // Try explicit PDF first
            var filePath = Path.Combine(uploadsFolder, id + ".pdf");
            if (!System.IO.File.Exists(filePath))
            {
                // Try DOCX
                filePath = Path.Combine(uploadsFolder, id + ".docx");
                if (!System.IO.File.Exists(filePath))
                {
                    // Fallback: Check if we have the text in DB and generate a text file
                    if (!string.IsNullOrEmpty(resume.ResumeText))
                    {
                        var bytes = System.Text.Encoding.UTF8.GetBytes(resume.ResumeText);
                        return File(bytes, "text/plain", $"Resume_{id}.txt");
                    }

                    return NotFound("Resume file not found.");
                }
            }

            var memory = new MemoryStream();
            using (var stream = new FileStream(filePath, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;

            var contentType = filePath.EndsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            var fileName = filePath.EndsWith(".pdf") ? $"Resume_{id}.pdf" : $"Resume_{id}.docx";

            if (Request.Query.ContainsKey("inline") && bool.TryParse(Request.Query["inline"], out bool isInline) && isInline)
            {
                Response.Headers["Content-Disposition"] = "inline; filename=" + fileName;
                return File(memory, contentType);
            }

            return File(memory, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading resume");
            return StatusCode(500, "Error downloading resume.");
        }
    }
    [HttpPost("match")]
    [Authorize]
    [PlanRequirement("GapAnalysis")]

    public async Task<ActionResult<GapAnalysisOutput>> MatchJob([FromBody] JobMatchRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.JobDescription) || request.ResumeId == Guid.Empty)
        {
            return BadRequest("Invalid request. ResumeId and JobDescription are required.");
        }

        try
        {
            // 1. Get Resume from DB
            var resume = await _context.Resumes.FindAsync(request.ResumeId);
            if (resume == null)
            {
                return NotFound("Resume not found.");
            }

            if (string.IsNullOrWhiteSpace(resume.ResumeText))
            {
                return BadRequest("Resume text is missing for this resume.");
            }

            // 2. Call AI Service
            var matchResult = await _aiService.MatchJobAsync(resume.ResumeText, request.JobDescription);

            if (matchResult == null)
            {
                return StatusCode(503, "AI Service unavailable for matching.");
            }

            return Ok(matchResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing job match");
            return StatusCode(500, $"Match processing failed: {ex.Message}");
        }
    }
}

public class JobMatchRequest
{
    public Guid ResumeId { get; set; }
    public string JobDescription { get; set; } = string.Empty;
}
