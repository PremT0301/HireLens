using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Services;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IAuthService _authService;

    public SubscriptionsController(ApplicationDbContext context, IAuthService authService)
    {
        _context = context;
        _authService = authService;
    }

    [HttpPost("upgrade")]
    public async Task<IActionResult> UpgradePlan([FromBody] UpgradePlanRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        var validPlans = new[] { "FREE", "PRO", "ELITE_PLUS" };
        if (!validPlans.Contains(request.Plan.ToUpper()))
            return BadRequest("Invalid plan selected.");

        user.PricingPlan = request.Plan.ToUpper();
        user.SubscriptionPlan = request.Plan.ToUpper(); // keep both in sync
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Re-issue JWT so the PricingPlan claim is immediately fresh (avoids stale claims)
        var freshToken = await _authService.GenerateTokenForUserAsync(userId);

        return Ok(new { 
            message = $"Successfully upgraded to {user.PricingPlan} plan.",
            plan = user.PricingPlan,
            token = freshToken   // frontend must store this as the new session token
        });
    }
}

public class UpgradePlanRequest
{
    public string Plan { get; set; } = string.Empty;
}
