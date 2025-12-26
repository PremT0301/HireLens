using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartHireAI.Backend.Data
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public Guid UserId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(150)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("full_name")]
        public string? FullName { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("mobile_number")]
        public string? MobileNumber { get; set; }

        [MaxLength(255)]
        [Column("location")]
        public string? Location { get; set; }

        [MaxLength(255)]
        [Column("profile_image")]
        public string? ProfileImage { get; set; }

        [Required]
        [Column("role")]
        public string Role { get; set; } = string.Empty;

        public Applicant? ApplicantProfile { get; set; }
        public Recruiter? RecruiterProfile { get; set; }
    }

    [Table("applicants")]
    public class Applicant
    {
        [Key]
        [Column("applicant_id")]
        public Guid ApplicantId { get; set; }

        [MaxLength(100)]
        [Column("current_role")]
        public string? CurrentRole { get; set; }

        [Column("experience_years")]
        public int ExperienceYears { get; set; }

        [MaxLength(255)]
        [Column("college_name")]
        public string? CollegeName { get; set; }

        [Column("completion_year")]
        public int? CompletionYear { get; set; }

        [MaxLength(10)]
        [Column("grade")]
        public string? Grade { get; set; }

        [MaxLength(100)]
        [Column("location")]
        public string? Location { get; set; }

        [MaxLength(20)]
        [Column("mobile_number")]
        public string? MobileNumber { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ApplicantId")]
        public User User { get; set; } = null!;

        public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    }

    [Table("recruiters")]
    public class Recruiter
    {
        [Key]
        [Column("recruiter_id")]
        public Guid RecruiterId { get; set; }

        [MaxLength(150)]
        [Column("company_name")]
        public string? CompanyName { get; set; }

        [MaxLength(255)]
        [Column("company_logo")]
        public string? CompanyLogo { get; set; }

        [MaxLength(100)]
        [Column("designation")]
        public string? Designation { get; set; }

        [MaxLength(100)]
        [Column("location")] // Company Location
        public string? Location { get; set; }

        [MaxLength(20)]
        [Column("mobile_number")]
        public string? MobileNumber { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("RecruiterId")]
        public User User { get; set; } = null!;

        public ICollection<JobDescription> JobDescriptions { get; set; } = new List<JobDescription>();
    }

    [Table("resumes")]
    public class Resume
    {
        [Key]
        [Column("resume_id")]
        public Guid ResumeId { get; set; }

        [Column("applicant_id")]
        public Guid ApplicantId { get; set; }

        [Column("parsed_at")]
        public DateTime ParsedAt { get; set; }

        [Column("resume_health_score")]
        public int ResumeHealthScore { get; set; }

        [Column("resume_text")]
        public string? ResumeText { get; set; }

        [ForeignKey("ApplicantId")]
        public Applicant Applicant { get; set; } = null!;

        public ResumeEmbedding? Embedding { get; set; }
        public ICollection<ResumeEntity> Entities { get; set; } = new List<ResumeEntity>();
    }

    [Table("job_descriptions")]
    public class JobDescription
    {
        [Key]
        [Column("job_id")]
        public Guid JobId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("experience_required")]
        public int ExperienceRequired { get; set; }

        [Column("recruiter_id")]
        public Guid RecruiterId { get; set; }

        [Column("required_skills")]
        public string? RequiredSkills { get; set; }

        [Column("salary_max")]
        public int SalaryMax { get; set; }

        [Column("salary_min")]
        public int SalaryMin { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [ForeignKey("RecruiterId")]
        public Recruiter Recruiter { get; set; } = null!;

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Active"; // Active, Closed, Draft

        [Column("description")]
        public string? Description { get; set; }

        [MaxLength(100)]
        [Column("department")]
        public string? Department { get; set; }

        [MaxLength(50)]
        [Column("employment_type")]
        public string? EmploymentType { get; set; } // Full-time, Part-time, Contract

        [MaxLength(100)]
        [Column("location")]
        public string? Location { get; set; }

        [MaxLength(50)]
        [Column("location_type")]
        public string? LocationType { get; set; } // Remote, On-site, Hybrid

        public JobEmbedding? Embedding { get; set; }

        public ICollection<MatchResult> Matches { get; set; } = new List<MatchResult>();
    }

    [Table("resume_embeddings")]
    public class ResumeEmbedding
    {
        [Key]
        [Column("resume_id")]
        public Guid ResumeId { get; set; }

        [Required]
        [Column("embedding")]
        public string EmbeddingJson { get; set; } = string.Empty;

        [ForeignKey("ResumeId")]
        public Resume Resume { get; set; } = null!;
    }

    [Table("jd_embeddings")]
    public class JobEmbedding
    {
        [Key]
        [Column("job_id")]
        public Guid JobId { get; set; }

        [Required]
        [Column("embedding")]
        public string EmbeddingJson { get; set; } = string.Empty;

        [ForeignKey("JobId")]
        public JobDescription JobDescription { get; set; } = null!;
    }

    [Table("resume_entities")]
    public class ResumeEntity
    {
        [Key]
        [Column("entity_id")]
        public int EntityId { get; set; }

        [Column("confidence")]
        public float Confidence { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("entity_type")]
        public string EntityType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [Column("entity_value")]
        public string EntityValue { get; set; } = string.Empty;

        [Column("resume_id")]
        public Guid ResumeId { get; set; }

        [ForeignKey("ResumeId")]
        public Resume Resume { get; set; } = null!;
    }

    [Table("match_results")]
    public class MatchResult
    {
        [Key]
        [Column("match_id")]
        public Guid MatchId { get; set; }

        [Column("job_id")]
        public Guid JobId { get; set; }

        [Column("match_score")]
        public float MatchScore { get; set; }

        [Column("ranked_at")]
        public DateTime RankedAt { get; set; }

        [Column("resume_id")]
        public Guid ResumeId { get; set; }

        [ForeignKey("JobId")]
        public JobDescription JobDescription { get; set; } = null!;

        [ForeignKey("ResumeId")]
        public Resume Resume { get; set; } = null!;
    }
    [Table("job_applications")]
    public class JobApplication
    {
        [Key]
        [Column("application_id")]
        public Guid ApplicationId { get; set; }

        [Column("job_id")]
        public Guid JobId { get; set; }

        [Column("applicant_id")]
        public Guid ApplicantId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "Applied"; // Applied, UnderReview, InterviewScheduled, Offer, Rejected

        [Column("applied_at")]
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        [Column("ats_score")]
        public float AtsScore { get; set; }

        [Column("interview_date")]
        public DateTime? InterviewDate { get; set; }

        [MaxLength(50)]
        [Column("interview_mode")]
        public string? InterviewMode { get; set; } // Online, Offline

        [MaxLength(500)]
        [Column("meeting_link")]
        public string? MeetingLink { get; set; } // URL or Location Address

        // [Column("interview_duration")]
        // public int? InterviewDuration { get; set; } // in minutes

        // [MaxLength(1000)]
        // [Column("interview_notes")]
        // public string? InterviewNotes { get; set; }

        [ForeignKey("JobId")]
        public JobDescription JobDescription { get; set; } = null!;

        [ForeignKey("ApplicantId")]
        public Applicant Applicant { get; set; } = null!;
    }

    [Table("application_messages")]
    public class ApplicationMessage
    {
        [Key]
        [Column("message_id")]
        public Guid MessageId { get; set; }

        [Column("application_id")]
        public Guid ApplicationId { get; set; }

        [Required]
        [Column("sender_role")] // "Recruiter" or "Applicant"
        public string SenderRole { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [Column("subject")]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [Column("body")]
        public string Body { get; set; } = string.Empty;

        [Column("sent_at")]
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("ApplicationId")]
        public JobApplication JobApplication { get; set; } = null!;
    }
}
