using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly ILogger<AnalysisController> _logger;

    public AnalysisController(IAIService aiService, ILogger<AnalysisController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    [HttpPost("analyze-resume")]
    public async Task<ActionResult<AnalyzeResumeOutput>> AnalyzeResume([FromBody] ResumeInput input)
    {
        try
        {
            var result = await _aiService.AnalyzeResumeAsync(input.Text);
            if (result == null) return StatusCode(503, "AI Service Unavailable");
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing resume");
            return StatusCode(500, ex.Message);
        }
    }

    [HttpPost("match-job")]
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
