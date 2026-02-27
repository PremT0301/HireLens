namespace SmartHireAI.Backend.Services;

public interface IUserPlanService
{
    bool HasCopilotAccess(string plan);
    bool HasUnlimitedMatches(string plan);
    bool HasAdvancedGapAnalysis(string plan);
    bool HasPriorityInbox(string plan);
    bool HasSmartReply(string plan);
    bool HasUnlimitedReadinessChecks(string plan);
    int GetMaxMatches(string plan);
    int GetMaxCopilotSessionsPerWeek(string plan);
    int GetMaxReadinessChecksPerWeek(string plan);
    int GetMaxJobPostings(string plan);
}


public class UserPlanService : IUserPlanService
{
    public const string FREE = "FREE";
    public const string PRO = "PRO";
    public const string ELITE_PLUS = "ELITE_PLUS";

    public bool HasCopilotAccess(string plan) => plan != FREE;

    public bool HasUnlimitedMatches(string plan) => plan != FREE;

    public bool HasAdvancedGapAnalysis(string plan) => plan == PRO || plan == ELITE_PLUS;

    public bool HasPriorityInbox(string plan) => plan == ELITE_PLUS;

    public bool HasSmartReply(string plan) => plan == PRO || plan == ELITE_PLUS;

    public bool HasUnlimitedReadinessChecks(string plan) => plan != FREE;

    public int GetMaxMatches(string plan) => plan == FREE ? 5 : int.MaxValue;

    public int GetMaxCopilotSessionsPerWeek(string plan) => plan == FREE ? 2 : int.MaxValue;

    public int GetMaxReadinessChecksPerWeek(string plan) => plan == FREE ? 3 : int.MaxValue;

    public int GetMaxJobPostings(string plan) => plan == FREE ? 3 : int.MaxValue;
}

