using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SmartHireAI.Backend.Services;
using System.Security.Claims;

namespace SmartHireAI.Backend.Filters;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class PlanRequirementAttribute : TypeFilterAttribute
{
    public PlanRequirementAttribute(string featureName) : base(typeof(PlanRequirementFilter))
    {
        Arguments = new object[] { featureName };
    }
}

public class PlanRequirementFilter : IAsyncActionFilter
{
    private readonly string _featureName;
    private readonly IUserPlanService _planService;
    private readonly IUsageTrackingService _usageService;

    public PlanRequirementFilter(string featureName, IUserPlanService planService, IUsageTrackingService usageService)
    {
        _featureName = featureName;
        _planService = planService;
        _usageService = usageService;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var user = context.HttpContext.User;
        if (!user.Identity?.IsAuthenticated ?? true)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var plan = user.FindFirst("PricingPlan")?.Value ?? "FREE";
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        bool hasAccess = _featureName switch
        {
            "Copilot" => _planService.HasCopilotAccess(plan),
            "GapAnalysis" => _planService.HasAdvancedGapAnalysis(plan),
            "PriorityInbox" => _planService.HasPriorityInbox(plan),
            "SmartReply" => _planService.HasSmartReply(plan),
            "ReadinessCheck" => true, // Everyone has it, but limits apply
            "Matches" => true, // Everyone has it, but limits apply
            "ResumeAnalysis" => true, // Everyone has it, but limits apply
            "JobPosting" => true, // Everyone has it, but limits apply
            _ => true
        };



        if (!hasAccess)
        {
            context.Result = new ObjectResult(new { message = $"Upgrade to Pro or Elite+ to access {_featureName}." }) 
            { 
                StatusCode = 403 
            };
            return;
        }

        // Check Usage Limits
        int limit = _featureName switch
        {
            "Copilot" => _planService.GetMaxCopilotSessionsPerWeek(plan),
            "ReadinessCheck" => _planService.GetMaxReadinessChecksPerWeek(plan),
            "Matches" => _planService.GetMaxMatches(plan),
            "JobPosting" => _planService.GetMaxJobPostings(plan),
            _ => int.MaxValue
        };


        if (limit != int.MaxValue)
        {
            bool isLimitReached = await _usageService.IsLimitReachedAsync(userId, _featureName, limit);
            if (isLimitReached)
            {
                context.Result = new ObjectResult(new { message = $"Weekly limit for {_featureName} reached. Upgrade for more." }) 
                { 
                    StatusCode = 403 
                };
                return;
            }
        }

        await next();
    }
}
