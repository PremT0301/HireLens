using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace SmartHireAI.Backend.Authorization;

public class PlanHandler : AuthorizationHandler<PlanRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PlanRequirement requirement)
    {
        var planClaim = context.User.FindFirst("PricingPlan")?.Value;

        if (string.IsNullOrEmpty(planClaim))
        {
            return Task.CompletedTask;
        }

        // Logic to determine if user plan meets requirement
        // For simplicity, we can do a sequence check or simple equality for now
        // FREE < PRO < ELITE_PLUS
        
        bool isSatisfied = false;
        var userPlan = planClaim.ToUpper();
        var reqPlan = requirement.MinimumPlan.ToUpper();

        if (reqPlan == "FREE") isSatisfied = true;
        else if (reqPlan == "PRO")
        {
            isSatisfied = userPlan == "PRO" || userPlan == "ELITE_PLUS";
        }
        else if (reqPlan == "ELITE_PLUS")
        {
            isSatisfied = userPlan == "ELITE_PLUS";
        }

        if (isSatisfied)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
