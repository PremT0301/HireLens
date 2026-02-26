#nullable enable
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.DTOs.Analytics;

namespace SmartHireAI.Backend.Services;

public interface IAdminService
{
    Task<AdminDashboardDto> GetDashboardStatsAsync();
    Task<IEnumerable<AdminUserDto>> GetAllUsersAsync(string? email = null, string? role = null, int page = 1, int pageSize = 10);
    Task<bool> ToggleUserStatusAsync(Guid userId);
    Task<bool> UpdateUserRoleAsync(Guid userId, string newRole);
    Task<bool> DeleteUserAsync(Guid userId);
    Task<IEnumerable<AdminJobDto>> GetAllJobsAsync(string? status = null, string? recruiter = null, int page = 1, int pageSize = 10);
    Task<bool> ToggleJobStatusAsync(Guid jobId);
    Task<SystemHealthDto> GetSystemHealthAsync();
}
