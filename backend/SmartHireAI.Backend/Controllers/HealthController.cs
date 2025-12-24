using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Services;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    private readonly IAIService _aiService;

    public HealthController(IAIService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet]
    public async Task<ActionResult> CheckHealth()
    {
        var pythonHealth = await _aiService.CheckHealthAsync();

        return Ok(new
        {
            Status = "Healthy",
            Architecture = ".NET 10 Gateway",
            Modules = new
            {
                Gateway = "Online",
                AIService = pythonHealth ? "Connected" : "Disconnected"
            }
        });
    }
}
