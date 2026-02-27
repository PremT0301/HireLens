using System.Security.Claims;
using SmartHireAI.Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace SmartHireAI.Backend.Middleware;

public class RoleValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RoleValidationMiddleware> _logger;

    public RoleValidationMiddleware(RequestDelegate next, ILogger<RoleValidationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            var roleClaim = context.User.FindFirst(ClaimTypes.Role);

            if (userIdClaim != null && roleClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                // Fetch current user from DB to verify role
                // We use a simple select to minimize DB load
                var user = await dbContext.Users
                    .AsNoTracking()
                    .Where(u => u.UserId == userId)
                    .Select(u => new { u.Role, u.IsActive })
                    .FirstOrDefaultAsync();

                if (user == null || !user.IsActive || user.Role.ToString() != roleClaim.Value)
                {
                    _logger.LogWarning("Security violation: User {UserId} role mismatch or inactive. DB: {DbRole}, Token: {TokenRole}", 
                        userId, user?.Role.ToString() ?? "None", roleClaim.Value);
                    
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new { message = "Unauthorized: Session invalidated due to role change or account status." });
                    return;
                }
            }
        }

        await _next(context);
    }
}

public static class RoleValidationMiddlewareExtensions
{
    public static IApplicationBuilder UseRoleValidation(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RoleValidationMiddleware>();
    }
}
