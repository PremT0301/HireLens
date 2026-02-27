#nullable enable
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IAdminService adminService, ILogger<AdminController> logger)
    {
        _adminService = adminService;
        _logger = logger;
    }

    // --- Dashboard ---

    [HttpGet("stats")]
    public async Task<ActionResult<AdminDashboardDto>> GetDashboardStats()
    {
        var stats = await _adminService.GetDashboardStatsAsync();
        return Ok(stats);
    }

    [HttpGet("health")]
    public async Task<ActionResult<SystemHealthDto>> GetSystemHealth()
    {
        var health = await _adminService.GetSystemHealthAsync();
        return Ok(health);
    }

    // --- User Management ---

    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers(
        [FromQuery] string? email, 
        [FromQuery] string? role, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var users = await _adminService.GetAllUsersAsync(email, role, page, pageSize);
        return Ok(users);
    }

    [HttpPatch("users/{id}/toggle")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var success = await _adminService.ToggleUserStatusAsync(id);
        if (!success) return NotFound(new { message = "User not found or is an Admin." });

        return Ok(new { message = "User status updated successfully." });
    }

    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] string newRole)
    {
        var success = await _adminService.UpdateUserRoleAsync(id, newRole);
        if (!success) return NotFound(new { message = "User not found or is an Admin." });

        return Ok(new { message = $"User role updated to {newRole}." });
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var success = await _adminService.DeleteUserAsync(id);
        if (!success) return NotFound(new { message = "User not found or is an Admin." });

        return Ok(new { message = "User soft-deleted successfully." });
    }

    // --- Job Moderation ---

    [HttpGet("jobs")]
    public async Task<ActionResult<IEnumerable<AdminJobDto>>> GetAllJobs(
        [FromQuery] string? status, 
        [FromQuery] string? recruiter, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        var jobs = await _adminService.GetAllJobsAsync(status, recruiter, page, pageSize);
        return Ok(jobs);
    }

    [HttpPatch("jobs/{id}/toggle")]
    public async Task<IActionResult> ToggleJobStatus(Guid id)
    {
        var success = await _adminService.ToggleJobStatusAsync(id);
        if (!success) return NotFound(new { message = "Job not found." });

        return Ok(new { message = "Job status updated successfully." });
    }
}
