using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;

namespace SmartHireAI.Backend.Services;

public interface IUsageTrackingService
{
    Task<int> GetUsageAsync(Guid userId, string featureName);
    Task IncrementUsageAsync(Guid userId, string featureName);
    Task<bool> IsLimitReachedAsync(Guid userId, string featureName, int limit);
}

public class UsageTrackingService : IUsageTrackingService
{
    private readonly ApplicationDbContext _context;

    public UsageTrackingService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> GetUsageAsync(Guid userId, string featureName)
    {
        var usage = await GetOrCreateUsage(userId, featureName);
        return usage.UsageCount;
    }

    public async Task IncrementUsageAsync(Guid userId, string featureName)
    {
        var usage = await GetOrCreateUsage(userId, featureName);
        usage.UsageCount++;
        await _context.SaveChangesAsync();
    }

    public async Task<bool> IsLimitReachedAsync(Guid userId, string featureName, int limit)
    {
        if (limit == int.MaxValue) return false;
        var usage = await GetOrCreateUsage(userId, featureName);
        return usage.UsageCount >= limit;
    }

    private async Task<UsageTracking> GetOrCreateUsage(Guid userId, string featureName)
    {
        var usage = await _context.UsageTracking
            .FirstOrDefaultAsync(u => u.UserId == userId && u.FeatureName == featureName);

        if (usage == null)
        {
            usage = new UsageTracking
            {
                UsageId = Guid.NewGuid(),
                UserId = userId,
                FeatureName = featureName,
                UsageCount = 0,
                WeekResetDate = GetStartOfWeek(DateTime.UtcNow)
            };
            _context.UsageTracking.Add(usage);
            await _context.SaveChangesAsync();
        }
        else if (usage.WeekResetDate < GetStartOfWeek(DateTime.UtcNow))
        {
            usage.UsageCount = 0;
            usage.WeekResetDate = GetStartOfWeek(DateTime.UtcNow);
            await _context.SaveChangesAsync();
        }

        return usage;
    }

    private DateTime GetStartOfWeek(DateTime dt)
    {
        int diff = (7 + (dt.DayOfWeek - DayOfWeek.Monday)) % 7;
        return dt.AddDays(-1 * diff).Date;
    }
}
