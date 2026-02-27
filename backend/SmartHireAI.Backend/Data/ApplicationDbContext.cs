using Microsoft.EntityFrameworkCore;

namespace SmartHireAI.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Applicant> Applicants { get; set; }
        public DbSet<Education> Education { get; set; }
        public DbSet<WorkExperience> WorkExperience { get; set; }
        public DbSet<Recruiter> Recruiters { get; set; }
        public DbSet<Resume> Resumes { get; set; }
        public DbSet<JobDescription> JobDescriptions { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<ResumeEmbedding> ResumeEmbeddings { get; set; }
        public DbSet<JobEmbedding> JobEmbeddings { get; set; }
        public DbSet<ResumeEntity> ResumeEntities { get; set; }
        public DbSet<MatchResult> MatchResults { get; set; }
        public DbSet<ApplicationMessage> ApplicationMessages { get; set; }
        public DbSet<InboxThread> InboxThreads { get; set; }
        public DbSet<InboxMessage> InboxMessages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SystemLog> SystemLogs { get; set; }
        public DbSet<UsageTracking> UsageTracking { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<OtpVerification> OtpVerifications { get; set; }
        public DbSet<ResumeAnalysis> ResumeAnalysis { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and indexes here if needed, 
            // but Data Annotations in Entities.cs cover most of it.
            // Configure UserRole enum to string conversion
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // Unique index for User MobileNumber
            modelBuilder.Entity<User>()
               .HasIndex(u => u.MobileNumber)
               .IsUnique();
        }
    }
}
