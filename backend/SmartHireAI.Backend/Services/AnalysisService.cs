#nullable enable
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using SmartHireAI.Backend.Models;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using System;
using System.Threading.Tasks;

namespace SmartHireAI.Backend.Services;

public class AnalysisService : IAnalysisService
{
    private readonly ApplicationDbContext _context;
    private readonly IResumeParserService _resumeParser;
    private readonly IAIService _aiService;
    private readonly ILogger<AnalysisService> _logger;

    public AnalysisService(
        ApplicationDbContext context,
        IResumeParserService resumeParser,
        IAIService aiService,
        ILogger<AnalysisService> logger)
    {
        _context = context;
        _resumeParser = resumeParser;
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<AnalyzeResumeOutput?> AnalyzeResumeAsync(Guid userId, IFormFile resumeFile)
    {
        try
        {
            _logger.LogInformation("Starting comprehensive resume analysis for user {UserId}", userId);

            // 1. Save File to Disk (Moved from ResumesController)
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "resumes");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

            var resumeId = Guid.NewGuid();
            var fileExtension = Path.GetExtension(resumeFile.FileName).ToLowerInvariant();
            var filePath = Path.Combine(uploadsFolder, resumeId + fileExtension);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await resumeFile.CopyToAsync(stream);
            }

            // 2. Parse Resume Text
            var resumeText = await _resumeParser.ParseResumeAsync(resumeFile);
            if (string.IsNullOrWhiteSpace(resumeText) || resumeText.Length < 50)
            {
                throw new Exception("Could not extract sufficient text from the resume.");
            }

            // 3. Call AI Service
            var result = await _aiService.AnalyzeResumeAsync(resumeText);
            if (result == null)
            {
                throw new Exception("AI Service failed to provide analysis.");
            }

            // 4. Update Database
            var user = await _context.Users
                .Include(u => u.ApplicantProfile)
                .FirstOrDefaultAsync(u => u.UserId == userId);
            
            if (user == null) throw new Exception("User not found.");

            // A. Update Dashboard Cache (ResumeAnalysis Table)
            var existingAnalysis = await _context.ResumeAnalysis.FirstOrDefaultAsync(a => a.UserId == userId);
            if (existingAnalysis != null) _context.ResumeAnalysis.Remove(existingAnalysis);

            var dashboardAnalysis = new ResumeAnalysis
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AtsScore = result.AtsScore,
                DetectedSkills = JsonSerializer.Serialize(result.NerResults?.Skills ?? new List<string>()),
                Feedback = JsonSerializer.Serialize(result.Feedback ?? new List<string>()),
                ConfidenceScore = result.Classification?.Confidence ?? 0,
                CreatedAt = DateTime.UtcNow
            };
            _context.ResumeAnalysis.Add(dashboardAnalysis);

            // B. Update History Record (Resumes Table)
            var historyResume = new Resume
            {
                ResumeId = resumeId,
                ApplicantId = user.UserId, // Assuming ApplicantId == UserId
                ParsedAt = DateTime.UtcNow,
                ResumeText = resumeText,
                ResumeHealthScore = result.AtsScore,
                Entities = new List<ResumeEntity>()
            };

            // Map entities for history
            if (result.NerResults?.Skills != null)
            {
                foreach (var skill in result.NerResults.Skills)
                {
                    historyResume.Entities.Add(new ResumeEntity { EntityType = "SKILL", EntityValue = skill, Confidence = 1.0f });
                }
            }

            if (result.Classification != null)
            {
                historyResume.Entities.Add(new ResumeEntity { EntityType = "PREDICTED_ROLE", EntityValue = result.Classification.PredictedRole, Confidence = result.Classification.Confidence });
            }

            _context.Resumes.Add(historyResume);

            // C. Update User Profile
            user.ResumeUploadedAt = DateTime.UtcNow;
            user.ResumePath = $"/uploads/resumes/{resumeId}{fileExtension}";
            
            // Recalculate Profile Completion
            int completion = 20; 
            if (!string.IsNullOrEmpty(user.MobileNumber)) completion += 10;
            if (!string.IsNullOrEmpty(user.Location)) completion += 10;
            if (user.ResumeUploadedAt != null) completion += 40;
            user.ProfileCompletionPercentage = Math.Min(100, completion);

            await _context.SaveChangesAsync();

            // D. Update Scores for Existing Applications (Background-ish)
            try
            {
                var activeApplications = await _context.JobApplications
                    .Include(a => a.JobDescription)
                    .Where(a => a.ApplicantId == user.UserId && a.Status != "Rejected")
                    .ToListAsync();

                foreach (var app in activeApplications)
                {
                    if (!string.IsNullOrWhiteSpace(app.JobDescription?.Description))
                    {
                        var matchResult = await _aiService.MatchJobAsync(resumeText, app.JobDescription.Description);
                        if (matchResult != null)
                        {
                            app.AtsScore = matchResult.MatchSummary.MatchPercentage;
                        }
                    }
                }
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to auto-update application scores during resume sync");
            }

            _logger.LogInformation("Comprehensive resume sync completed for user {UserId}. ResumeId: {ResumeId}", userId, resumeId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in unified resume processing for user {UserId}", userId);
            throw;
        }
    }
}
