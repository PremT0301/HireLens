using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;
using SmartHireAI.Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ResumesController : ControllerBase
{
    private readonly IResumeParserService _parserService;
    private readonly IAIService _aiService;
    private readonly ApplicationDbContext _context;

    private readonly ILogger<ResumesController> _logger;

    public ResumesController(
        IResumeParserService parserService,
        IAIService aiService,
        ApplicationDbContext context,
        ILogger<ResumesController> logger)
    {
        _parserService = parserService;
        _aiService = aiService;
        _context = context;
        _logger = logger;
    }

    [HttpPost("upload")]
    [Authorize] // Requires login
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

            // 1. Save File to Disk
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "resumes");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var resumeId = Guid.NewGuid();
            var fileExtension = Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, resumeId + fileExtension);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 2. Parse Text from PDF/DOCX
            var text = await _parserService.ParseResumeAsync(file);

            if (string.IsNullOrWhiteSpace(text) || text.Length < 50)
            {
                // Clean up file if parsing fails (optional, but good practice)
                if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
                return BadRequest("Could not extract sufficient text from the resume. Please ensure it's a valid PDF containing text.");
            }

            // 3. Send to AI Microservice
            var analysisResult = await _aiService.AnalyzeResumeAsync(text);

            if (analysisResult == null)
            {
                return StatusCode(503, "AI Service is currently unavailable.");
            }

            _logger.LogInformation($"AI Result: Role={analysisResult.Classification?.PredictedRole}, " +
                                   $"SkillsCount={analysisResult.NerResults?.Skills?.Count ?? 0}, " +
                                   $"DesignationsCount={analysisResult.NerResults?.Designations?.Count ?? 0}, " +
                                   $"AtsScore={analysisResult.AtsScore}");

            // 4. Save to Database
            _logger.LogInformation($"Saving resume for ApplicantId: {applicant.ApplicantId}");

            var resume = new Resume
            {
                ResumeId = resumeId, // Use the pre-generated ID
                ApplicantId = applicant.ApplicantId,
                ParsedAt = DateTime.UtcNow,
                ResumeText = text,
                ResumeHealthScore = analysisResult.AtsScore,
                Entities = new List<ResumeEntity>()
            };

            // Map extracted entities
            if (analysisResult.NerResults?.Skills != null)
            {
                foreach (var skill in analysisResult.NerResults.Skills.Where(s => !string.IsNullOrWhiteSpace(s)))
                {
                    resume.Entities.Add(new ResumeEntity
                    {
                        EntityType = "SKILL",
                        EntityValue = skill,
                        Confidence = 1.0f
                    });
                }
            }

            if (analysisResult.NerResults?.Designations != null)
            {
                foreach (var role in analysisResult.NerResults.Designations.Where(r => !string.IsNullOrWhiteSpace(r)))
                {
                    resume.Entities.Add(new ResumeEntity
                    {
                        EntityType = "DESIGNATION",
                        EntityValue = role,
                        Confidence = 1.0f
                    });
                }
            }

            // Add Predicted Role as an entity too
            if (analysisResult.Classification != null && !string.IsNullOrWhiteSpace(analysisResult.Classification.PredictedRole))
            {
                resume.Entities.Add(new ResumeEntity
                {
                    EntityType = "PREDICTED_ROLE",
                    EntityValue = analysisResult.Classification.PredictedRole,
                    Confidence = analysisResult.Classification.Confidence
                });
            }

            _context.Resumes.Add(resume);
            var changes = await _context.SaveChangesAsync();
            _logger.LogInformation($"Resume saved. Changes in DB: {changes}. ResumeId: {resume.ResumeId}");

            // 5. Update Scores for Existing Applications
            try
            {
                var activeApplications = await _context.JobApplications
                    .Include(a => a.JobDescription)
                    .Where(a => a.ApplicantId == applicant.ApplicantId && a.Status != "Rejected")
                    .ToListAsync();

                foreach (var app in activeApplications)
                {
                    if (!string.IsNullOrWhiteSpace(app.JobDescription?.Description))
                    {
                        var matchResult = await _aiService.MatchJobAsync(text, app.JobDescription.Description);
                        if (matchResult != null)
                        {
                            app.AtsScore = matchResult.MatchSummary.MatchPercentage;
                            _logger.LogInformation($"Updated score for AppId: {app.ApplicationId} to {app.AtsScore}");
                        }
                    }
                }
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-update application scores");
                // Don't fail the request, just log it
            }

            return Ok(new
            {
                resumeId = resume.ResumeId,
                analysis = analysisResult
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing resume upload");
            return StatusCode(500, $"Processing failed: {ex.Message}");
        }
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> DownloadResume(Guid id)
    {
        try
        {
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
                    var resume = await _context.Resumes.FindAsync(id);
                    if (resume != null && !string.IsNullOrEmpty(resume.ResumeText))
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
