using Microsoft.AspNetCore.Identity;
using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Data;

public static class DbSeeder
{
    public static async Task Seed(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await context.Database.EnsureCreatedAsync();

        // 1. Seed Recruiter
        var recruiterUser = context.Users.FirstOrDefault(u => u.Email == "recruiter@hirelens.ai");
        Recruiter? recruiter = null;
        if (recruiterUser == null)
        {
            recruiterUser = new User
            {
                UserId = Guid.NewGuid(),
                Email = "recruiter@hirelens.ai",
                FullName = "Sarah Recruiter",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"), // Use proper hashing in prod
                Role = "Recruiter",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(recruiterUser);

            recruiter = new Recruiter
            {
                RecruiterId = Guid.NewGuid(),
                User = recruiterUser,
                CompanyName = "TechNova Inc.",
                Designation = "Senior Recruiter",
                Location = "San Francisco, CA"
            };
            context.Recruiters.Add(recruiter);
            await context.SaveChangesAsync();
        }
        else
        {
            recruiter = context.Recruiters.FirstOrDefault(r => r.User.UserId == recruiterUser.UserId);
        }

        // 2. Seed Jobs
        if (!context.JobDescriptions.Any())
        {
            var titles = new[] { "Senior React Developer", "Full Stack Engineer", "Backend Specialist", "AI Researcher", "Data Scientist" };
            foreach (var title in titles)
            {
                context.JobDescriptions.Add(new JobDescription
                {
                    JobId = Guid.NewGuid(),
                    Title = title,
                    RecruiterId = recruiter!.RecruiterId,
                    ExperienceRequired = 3,
                    SalaryMin = 100000,
                    SalaryMax = 150000,
                    RequiredSkills = "React, Node.js, C#, Python",
                    CreatedAt = DateTime.UtcNow.AddDays(-new Random().Next(1, 30))
                });
            }
            await context.SaveChangesAsync();
        }

        // 3. Seed Applicant
        var applicantUser = context.Users.FirstOrDefault(u => u.Email == "applicant@hirelens.ai");
        Applicant? applicant = null;
        if (applicantUser == null)
        {
            applicantUser = new User
            {
                UserId = Guid.NewGuid(),
                Email = "applicant@hirelens.ai",
                FullName = "Alex Candidate",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                Role = "Applicant",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(applicantUser);

            applicant = new Applicant
            {
                ApplicantId = Guid.NewGuid(),
                User = applicantUser,
                CurrentRole = "Junior Developer",
                ExperienceYears = 2,
                Location = "New York, NY"
            };
            context.Applicants.Add(applicant);
            await context.SaveChangesAsync();
        }
        else
        {
            applicant = context.Applicants.FirstOrDefault(a => a.User.UserId == applicantUser.UserId);
        }

        // 4. Seed Applications
        if (!context.JobApplications.Any())
        {
            var jobs = context.JobDescriptions.ToList();
            var rand = new Random();
            foreach (var job in jobs.Take(3))
            {
                context.JobApplications.Add(new JobApplication
                {
                    ApplicationId = Guid.NewGuid(),
                    JobId = job.JobId,
                    ApplicantId = applicant!.ApplicantId,
                    Status = rand.Next(0, 2) == 0 ? "Under Review" : "Applied",
                    AppliedAt = DateTime.UtcNow.AddDays(-rand.Next(1, 10)),
                    AtsScore = rand.Next(60, 95)
                });
            }
            await context.SaveChangesAsync();
        }
    }
}
