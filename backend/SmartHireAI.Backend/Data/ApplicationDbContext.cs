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
        public DbSet<Recruiter> Recruiters { get; set; }
        public DbSet<Resume> Resumes { get; set; }
        public DbSet<JobDescription> JobDescriptions { get; set; }
        public DbSet<JobApplication> JobApplications { get; set; }
        public DbSet<ResumeEmbedding> ResumeEmbeddings { get; set; }
        public DbSet<JobEmbedding> JobEmbeddings { get; set; }
        public DbSet<ResumeEntity> ResumeEntities { get; set; }
        public DbSet<MatchResult> MatchResults { get; set; }
        public DbSet<ApplicationMessage> ApplicationMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and indexes here if needed, 
            // but Data Annotations in Entities.cs cover most of it.
            // Unique index for User Email
            modelBuilder.Entity<User>()
               .HasIndex(u => u.Email)
               .IsUnique();
        }
    }
}
