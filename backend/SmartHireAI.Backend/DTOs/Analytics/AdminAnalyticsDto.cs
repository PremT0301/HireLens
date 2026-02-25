namespace SmartHireAI.Backend.DTOs.Analytics
{
    public class UserGrowthDto
    {
        public DateTime Date { get; set; }
        public int Applicants { get; set; }
        public int Recruiters { get; set; }
    }

    public class ApplicationTrendDto
    {
        public DateTime Date { get; set; }
        public int Count { get; set; }
    }

    public class JobStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class FunnelStatsDto
    {
        public int Applied { get; set; }
        public int InterviewScheduled { get; set; }
        public int InterviewCompleted { get; set; }
        public int Hired { get; set; }
    }

    public class SkillStatsDto
    {
        public string SkillName { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class MatchDistributionDto
    {
        public string Range { get; set; } = string.Empty; // e.g., "0-10%", "10-20%"
        public int Count { get; set; }
    }

    public class RecruiterPerformanceDto
    {
        public string RecruiterName { get; set; } = string.Empty;
        public int JobsPosted { get; set; }
        public int ApplicationsReceived { get; set; }
        public int HiresMade { get; set; }
    }
}
