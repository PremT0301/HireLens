using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Filters;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;


namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly SmartHireAI.Backend.Services.IUsageTrackingService _usageService;
    private readonly ILogger<AnalysisController> _logger;

    public AnalysisController(IAIService aiService, SmartHireAI.Backend.Services.IUsageTrackingService usageService, ILogger<AnalysisController> logger)
    {
        _aiService = aiService;
        _usageService = usageService;
        _logger = logger;
    }

    [HttpPost("analyze-resume")]
    [Authorize]
    [SmartHireAI.Backend.Filters.PlanRequirement("ResumeAnalysis")]

    public async Task<ActionResult<AnalyzeResumeOutput>> AnalyzeResume([FromBody] ResumeInput input)
    {
        try
        {
            var result = await _aiService.AnalyzeResumeAsync(input.Text);
            if (result == null) return StatusCode(503, "AI Service Unavailable");
            
            // Increment Usage
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdString, out var userId))
            {
                await _usageService.IncrementUsageAsync(userId, "ResumeAnalysis");
            }

            return Ok(result);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing resume");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("match-job")]
    [Authorize]
    [SmartHireAI.Backend.Filters.PlanRequirement("GapAnalysis")]

    public async Task<ActionResult<GapAnalysisOutput>> MatchJob([FromBody] ResumeJobInput input)
    {
        try
        {
            var result = await _aiService.MatchJobAsync(input.ResumeText, input.JobDescription);
            if (result == null) return StatusCode(503, "AI Service Unavailable");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error matching job");
            return StatusCode(500, ex.Message);
        }
    }
}
