using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubscriptionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SubscriptionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("upgrade")]
    public async Task<IActionResult> UpgradePlan([FromBody] UpgradePlanRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound("User not found.");
        }

        // Validate plan
        var validPlans = new[] { "FREE", "PRO", "ELITE_PLUS" };
        if (!validPlans.Contains(request.Plan.ToUpper()))
        {
            return BadRequest("Invalid plan selected.");
        }

        user.PricingPlan = request.Plan.ToUpper();
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { 
            message = $"Successfully upgraded to {user.PricingPlan} plan.",
            plan = user.PricingPlan
        });
    }
}

public class UpgradePlanRequest
{
    public string Plan { get; set; } = string.Empty;
}
