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
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<AnalysisService> _logger;

    public AnalysisService(
        ApplicationDbContext context,
        IResumeParserService resumeParser,
        IHttpClientFactory httpClientFactory,
        ILogger<AnalysisService> logger)
    {
        _context = context;
        _resumeParser = resumeParser;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task AnalyzeResumeAsync(Guid userId, IFormFile resumeFile)
    {
        try
        {
            _logger.LogInformation("Starting resume analysis for user {UserId}", userId);

            // 1. Parse Resume Text
            var resumeText = await _resumeParser.ParseResumeAsync(resumeFile);

            // 2. Call Python AI API
            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync("http://localhost:8000/analyze-resume", new { text = resumeText });

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("AI API failed: {Error}", error);
                throw new Exception("Failed to analyze resume with AI service.");
            }

            var result = await response.Content.ReadFromJsonAsync<JsonElement>();

            // 3. Store Results
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) throw new Exception("User not found.");

            // Remove old analysis if exists
            var existingAnalysis = await _context.ResumeAnalysis.FirstOrDefaultAsync(a => a.UserId == userId);
            if (existingAnalysis != null)
            {
                _context.ResumeAnalysis.Remove(existingAnalysis);
            }

            var analysis = new ResumeAnalysis
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AtsScore = result.GetProperty("ats_score").GetInt32(),
                DetectedSkills = JsonSerializer.Serialize(result.GetProperty("ner_results").GetProperty("skills")),
                MissingSkills = "[]", // Will be populated by job matching later or gap analysis
                Feedback = JsonSerializer.Serialize(result.GetProperty("feedback")),
                ConfidenceScore = result.GetProperty("classification").GetProperty("confidence").GetDouble(),
                CreatedAt = DateTime.UtcNow
            };

            // Update user fields
            user.ResumeUploadedAt = DateTime.UtcNow;
            
            // Calculate Profile Completion % (Simplified logic)
            int completion = 20; // Basic info
            if (!string.IsNullOrEmpty(user.MobileNumber)) completion += 10;
            if (!string.IsNullOrEmpty(user.Location)) completion += 10;
            if (user.ResumeUploadedAt != null) completion += 40;
            // Add other checks if needed
            user.ProfileCompletionPercentage = Math.Min(100, completion);

            _context.ResumeAnalysis.Add(analysis);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Resume analysis completed and saved for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing resume for user {UserId}", userId);
            throw;
        }
    }
}
