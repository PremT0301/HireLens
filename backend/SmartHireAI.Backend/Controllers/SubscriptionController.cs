using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using System.Security.Claims;

namespace SmartHireAI.Backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SubscriptionController> _logger;

    public SubscriptionController(ApplicationDbContext context, ILogger<SubscriptionController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("current")]
    public async Task<IActionResult> GetCurrentSubscription()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);

        if (user == null) return NotFound();

        return Ok(new
        {
            plan = user.SubscriptionPlan,
            expiry = user.SubscriptionExpiry
        });
    }

    [HttpPost("upgrade")]
    public async Task<IActionResult> UpgradePlan([FromBody] PlanUpdateRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);

        if (user == null) return NotFound();

        var oldPlan = user.SubscriptionPlan;
        user.SubscriptionPlan = request.Plan;
        user.PricingPlan = request.Plan; // Keep in sync for now
        user.SubscriptionExpiry = DateTime.UtcNow.AddMonths(1);
        user.UpdatedAt = DateTime.UtcNow;

        // Log the action
        var log = new SystemLog
        {
            LogId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            Level = "Info",
            Source = "Subscription",
            Message = $"User {user.Email} upgraded from {oldPlan} to {request.Plan}",
            UserId = userId
        };
        _context.SystemLogs.Add(log);

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Successfully upgraded to {request.Plan}", plan = request.Plan });
    }

    [HttpPost("downgrade")]
    public async Task<IActionResult> DowngradePlan([FromBody] PlanUpdateRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _context.Users.FindAsync(userId);

        if (user == null) return NotFound();

        var oldPlan = user.SubscriptionPlan;
        user.SubscriptionPlan = request.Plan;
        user.PricingPlan = request.Plan;
        user.UpdatedAt = DateTime.UtcNow;

        var log = new SystemLog
        {
            LogId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            Level = "Info",
            Source = "Subscription",
            Message = $"User {user.Email} downgraded from {oldPlan} to {request.Plan}",
            UserId = userId
        };
        _context.SystemLogs.Add(log);

        await _context.SaveChangesAsync();

        return Ok(new { message = $"Successfully downgraded to {request.Plan}", plan = request.Plan });
    }
}

public class PlanUpdateRequest
{
    public string Plan { get; set; } = "FREE";
}
