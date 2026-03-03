using Microsoft.AspNetCore.Authorization;

namespace SmartHireAI.Backend.Authorization;

public class PlanRequirement : IAuthorizationRequirement
{
    public string MinimumPlan { get; }

    public PlanRequirement(string minimumPlan)
    {
        MinimumPlan = minimumPlan;
    }
}
