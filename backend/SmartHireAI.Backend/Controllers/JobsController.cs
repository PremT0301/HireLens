using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public JobsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/jobs
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobDto>>> GetJobs()
    {
        var jobs = await _context.JobDescriptions
            .Include(j => j.Recruiter)
            .ThenInclude(r => r.User)
            .Select(j => new JobDto
            {
                JobId = j.JobId,
                Title = j.Title,
                RequiredSkills = j.RequiredSkills,
                ExperienceRequired = j.ExperienceRequired,
                SalaryMin = j.SalaryMin,
                SalaryMax = j.SalaryMax,
                ProbableSalary = j.ProbableSalary,
                CreatedAt = j.CreatedAt,
                RecruiterId = j.RecruiterId,
                CompanyName = j.Recruiter.CompanyName,
                Status = j.Status,
                Description = j.Description,
                Department = j.Department,
                EmploymentType = j.EmploymentType,
                Location = j.Location,
                LocationType = j.LocationType,
                NumberOfOpenings = j.NumberOfOpenings,
                RoleOverview = j.RoleOverview,
                KeyResponsibilities = j.KeyResponsibilities,
                Technologies = j.Technologies,
                ExperienceMin = j.ExperienceMin,
                ExperienceMax = j.ExperienceMax,
                PerksAndBenefits = j.PerksAndBenefits,
                GrowthOpportunities = j.GrowthOpportunities,
                AssessmentRequired = j.AssessmentRequired,
                AssessmentType = j.AssessmentType,
                InterviewRounds = j.InterviewRounds,
                InterviewMode = j.InterviewMode,
                MandatorySkills = j.JobSkills.Select(s => new JobSkillDto
                {
                    SkillName = s.SkillName,
                    Category = s.Category,
                    ProficiencyLevel = s.ProficiencyLevel,
                    Weight = s.Weight
                }).ToList()
            })
            .ToListAsync();

        return Ok(jobs);
    }

    // GET: api/jobs/posted
    [HttpGet("posted")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<JobDto>>> GetPostedJobs()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.User.UserId == userId);
        if (recruiter == null) return NotFound("Recruiter profile not found");

        var jobs = await _context.JobDescriptions
            .Where(j => j.RecruiterId == recruiter.RecruiterId)
            .Select(j => new JobDto
            {
                JobId = j.JobId,
                Title = j.Title,
                RequiredSkills = j.RequiredSkills,
                ExperienceRequired = j.ExperienceRequired,
                SalaryMin = j.SalaryMin,
                SalaryMax = j.SalaryMax,
                ProbableSalary = j.ProbableSalary,
                CreatedAt = j.CreatedAt,
                RecruiterId = j.RecruiterId,
                CompanyName = j.Recruiter.CompanyName,
                Status = j.Status,
                ApplicantCount = _context.JobApplications.Count(a => a.JobId == j.JobId),
                Description = j.Description,
                Department = j.Department,
                EmploymentType = j.EmploymentType,
                Location = j.Location,
                LocationType = j.LocationType,
                NumberOfOpenings = j.NumberOfOpenings,
                RoleOverview = j.RoleOverview,
                KeyResponsibilities = j.KeyResponsibilities,
                Technologies = j.Technologies,
                ExperienceMin = j.ExperienceMin,
                ExperienceMax = j.ExperienceMax,
                PerksAndBenefits = j.PerksAndBenefits,
                GrowthOpportunities = j.GrowthOpportunities,
                AssessmentRequired = j.AssessmentRequired,
                AssessmentType = j.AssessmentType,
                InterviewRounds = j.InterviewRounds,
                InterviewMode = j.InterviewMode,
                MandatorySkills = j.JobSkills.Select(s => new JobSkillDto
                {
                    SkillName = s.SkillName,
                    Category = s.Category,
                    ProficiencyLevel = s.ProficiencyLevel,
                    Weight = s.Weight
                }).ToList()
            })
            .ToListAsync();

        return Ok(jobs);
    }

    // GET: api/jobs/5
    [HttpGet("{id}")]
    public async Task<ActionResult<JobDto>> GetJob(Guid id)
    {
        var job = await _context.JobDescriptions
            .Include(j => j.Recruiter)
            .ThenInclude(r => r.User)
            .Include(j => j.JobSkills)
            .FirstOrDefaultAsync(j => j.JobId == id);

        if (job == null)
        {
            return NotFound();
        }

        return new JobDto
        {
            JobId = job.JobId,
            Title = job.Title,
            RequiredSkills = job.RequiredSkills,
            ExperienceRequired = job.ExperienceRequired,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            ProbableSalary = job.ProbableSalary,
            CreatedAt = job.CreatedAt,
            RecruiterId = job.RecruiterId,
            CompanyName = job.Recruiter.CompanyName,
            Status = job.Status,
            Description = job.Description,
            Department = job.Department,
            EmploymentType = job.EmploymentType,
            Location = job.Location,
            LocationType = job.LocationType,
            NumberOfOpenings = job.NumberOfOpenings,
            RoleOverview = job.RoleOverview,
            KeyResponsibilities = job.KeyResponsibilities,
            Technologies = job.Technologies,
            ExperienceMin = job.ExperienceMin,
            ExperienceMax = job.ExperienceMax,
            PerksAndBenefits = job.PerksAndBenefits,
            GrowthOpportunities = job.GrowthOpportunities,
            AssessmentRequired = job.AssessmentRequired,
            AssessmentType = job.AssessmentType,
            InterviewRounds = job.InterviewRounds,
            InterviewMode = job.InterviewMode,
            MandatorySkills = job.JobSkills.Select(s => new JobSkillDto
            {
                SkillName = s.SkillName,
                Category = s.Category,
                ProficiencyLevel = s.ProficiencyLevel,
                Weight = s.Weight
            }).ToList()
        };
    }

    // GET: api/jobs/{jobId}/interview-rounds
    [HttpGet("{jobId}/interview-rounds")]
    public async Task<IActionResult> GetInterviewRounds(Guid jobId)
    {
        var job = await _context.JobDescriptions.FindAsync(jobId);
        if (job == null) return NotFound("Job not found");

        if (string.IsNullOrEmpty(job.InterviewRounds))
        {
            return Ok(new List<object>());
        }

        return Content(job.InterviewRounds, "application/json");
    }

    // POST: api/jobs
    [HttpPost]
    [Authorize] // Ideally specific to Recruiter role
    public async Task<ActionResult<JobDto>> CreateJob(CreateJobDto request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        // Find Recruiter Profile for this User
        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.User.UserId == userId);
        if (recruiter == null)
        {
            // Auto-create recruiter profile if missing (simplified for prototype)
            recruiter = new Recruiter
            {
                RecruiterId = Guid.NewGuid(),
                User = await _context.Users.FindAsync(userId) ?? throw new Exception("User not found"),
                CompanyName = "My Company" // Placeholder
            };
            _context.Recruiters.Add(recruiter);
            await _context.SaveChangesAsync();
        }

        var job = new JobDescription
        {
            JobId = Guid.NewGuid(),
            Title = request.Title,
            RequiredSkills = request.RequiredSkills,
            ExperienceRequired = request.ExperienceRequired,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            ProbableSalary = request.ProbableSalary,
            CreatedAt = DateTime.UtcNow,
            Status = request.Status,
            RecruiterId = recruiter.RecruiterId,
            Description = request.Description,
            Department = request.Department,
            EmploymentType = request.EmploymentType,
            Location = request.Location,
            LocationType = request.LocationType,
            NumberOfOpenings = request.NumberOfOpenings,

            // New Fields
            RoleOverview = request.RoleOverview,
            KeyResponsibilities = request.KeyResponsibilities,
            Technologies = request.Technologies,
            ExperienceMin = request.ExperienceMin,
            ExperienceMax = request.ExperienceMax,
            PerksAndBenefits = request.PerksAndBenefits,
            GrowthOpportunities = request.GrowthOpportunities,
            AssessmentRequired = request.AssessmentRequired,
            AssessmentType = request.AssessmentType,
            InterviewRounds = request.InterviewRounds,
            InterviewMode = request.InterviewMode
        };

        if (request.MandatorySkills != null && request.MandatorySkills.Any())
        {
            foreach (var skillDto in request.MandatorySkills)
            {
                job.JobSkills.Add(new JobSkill
                {
                    SkillId = Guid.NewGuid(),
                    SkillName = skillDto.SkillName,
                    Category = skillDto.Category,
                    ProficiencyLevel = skillDto.ProficiencyLevel,
                    Weight = skillDto.Weight
                });
            }
        }

        _context.JobDescriptions.Add(job);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetJob), new { id = job.JobId }, new JobDto
        {
            JobId = job.JobId,
            Title = job.Title,
            RecruiterId = recruiter.RecruiterId,
            Status = job.Status,
            Description = job.Description,
            Department = job.Department,
            EmploymentType = job.EmploymentType,
            Location = job.Location,
            LocationType = job.LocationType,
            NumberOfOpenings = job.NumberOfOpenings
        });
    }

    // PUT: api/jobs/5
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateJob(Guid id, UpdateJobDto request)
    {
        var job = await _context.JobDescriptions.FindAsync(id);
        if (job == null)
        {
            return NotFound();
        }

        // Verify ownership (simplified)
        // In real app, check if current user matches job.Recruiter.UserId

        job.Title = request.Title;
        job.RequiredSkills = request.RequiredSkills;
        job.ExperienceRequired = request.ExperienceRequired;
        job.SalaryMin = request.SalaryMin;
        job.SalaryMax = request.SalaryMax;
        job.ProbableSalary = request.ProbableSalary;
        job.Status = request.Status;
        job.Description = request.Description;
        job.Department = request.Department;
        job.EmploymentType = request.EmploymentType;
        job.Location = request.Location;
        job.LocationType = request.LocationType;
        job.NumberOfOpenings = request.NumberOfOpenings;

        job.RoleOverview = request.RoleOverview;
        job.KeyResponsibilities = request.KeyResponsibilities;
        job.Technologies = request.Technologies;
        job.ExperienceMin = request.ExperienceMin;
        job.ExperienceMax = request.ExperienceMax;
        job.PerksAndBenefits = request.PerksAndBenefits;
        job.GrowthOpportunities = request.GrowthOpportunities;
        job.AssessmentRequired = request.AssessmentRequired;
        job.AssessmentType = request.AssessmentType;
        job.InterviewRounds = request.InterviewRounds;
        job.InterviewMode = request.InterviewMode;

        // Update Skills (Clear and Replace for simplicity)
        var existingSkills = _context.Database.ExecuteSqlRaw("DELETE FROM job_skills WHERE job_id = {0}", id);

        if (request.MandatorySkills != null)
        {
            foreach (var skillDto in request.MandatorySkills)
            {
                var newSkill = new JobSkill
                {
                    SkillId = Guid.NewGuid(),
                    JobId = id,
                    SkillName = skillDto.SkillName,
                    Category = skillDto.Category,
                    ProficiencyLevel = skillDto.ProficiencyLevel,
                    Weight = skillDto.Weight
                };
                // We can't just Add to job.JobSkills if we deleted via SQL Raw and EF context isn't fully aware or if we want to add directly.
                // Better approach:
                _context.Add(newSkill);
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/jobs/5
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        var job = await _context.JobDescriptions.FindAsync(id);
        if (job == null)
        {
            return NotFound();
        }

        _context.JobDescriptions.Remove(job);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PATCH: api/jobs/5/status
    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateJobStatus(Guid id, [FromBody] string status)
    {
        var job = await _context.JobDescriptions.FindAsync(id);
        if (job == null) return NotFound();

        job.Status = status;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
