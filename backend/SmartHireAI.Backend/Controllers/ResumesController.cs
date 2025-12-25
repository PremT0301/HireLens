using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;
using SmartHireAI.Backend.Data;

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

            // 1. Parse Text from PDF/DOCX
            var text = await _parserService.ParseResumeAsync(file);

            if (string.IsNullOrWhiteSpace(text) || text.Length < 50)
            {
                return BadRequest("Could not extract sufficient text from the resume. Please ensure it's a valid PDF containing text.");
            }

            // 2. Send to AI Microservice
            var analysisResult = await _aiService.AnalyzeResumeAsync(text);

            if (analysisResult == null)
            {
                return StatusCode(503, "AI Service is currently unavailable.");
            }

            _logger.LogInformation($"AI Result: Role={analysisResult.Classification?.PredictedRole}, " +
                                   $"SkillsCount={analysisResult.NerResults?.Skills?.Count ?? 0}, " +
                                   $"DesignationsCount={analysisResult.NerResults?.Designations?.Count ?? 0}, " +
                                   $"AtsScore={analysisResult.AtsScore}");

            // 3. Save to Database
            _logger.LogInformation($"Saving resume for ApplicantId: {applicant.ApplicantId}");

            var resume = new Resume
            {
                ResumeId = Guid.NewGuid(),
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
