using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;
using System.IO;
using System.Text.Json;

namespace SmartHireAI.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfilesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProfilesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/profiles/me (Applicant)
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApplicantProfileDto>> GetMyProfile()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var applicant = await _context.Applicants
            .Include(a => a.User)
            .Include(a => a.Education)
            .FirstOrDefaultAsync(a => a.User.UserId == userId);

        // ... (lines 37-51 omitted for brevity, logic remains valid if kept same) ...
        if (applicant == null)
        {
            return NotFound("Applicant profile not found.");
        }

        var edu = applicant.Education.FirstOrDefault();

        return new ApplicantProfileDto
        {
            ApplicantId = applicant.ApplicantId,
            UserId = userId,
            FullName = applicant.User.FullName,
            Email = applicant.User.Email,
            CurrentRole = applicant.CurrentRole,
            ExperienceYears = applicant.ExperienceYears,
            Location = applicant.Location,
            CollegeName = edu?.CollegeName,
            CompletionYear = edu?.CompletionYear,
            Grade = edu?.Grade,
            MobileNumber = applicant.MobileNumber ?? applicant.User.MobileNumber
        };
    }

    // PUT: api/profiles/me (Applicant)
    // PUT: api/profiles/me (Applicant)
    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile([FromForm] UpdateApplicantProfileRequest request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound("User not found");

        var applicant = await _context.Applicants
            .Include(a => a.Education)
            .Include(a => a.WorkExperience)
            .FirstOrDefaultAsync(a => a.User.UserId == userId);

        if (applicant == null)
        {
            applicant = new Applicant
            {
                ApplicantId = Guid.NewGuid(),
                User = user,
                ExperienceYears = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Applicants.Add(applicant);
        }

        // Update User Fields
        if (!string.IsNullOrEmpty(request.FullName)) user.FullName = request.FullName;
        if (!string.IsNullOrEmpty(request.MobileNumber)) user.MobileNumber = request.MobileNumber;
        if (!string.IsNullOrEmpty(request.Location)) user.Location = request.Location;
        user.UpdatedAt = DateTime.UtcNow;

        // Profile Image Upload
        if (request.ProfileImage != null && request.ProfileImage.Length > 0)
        {
            var extension = Path.GetExtension(request.ProfileImage.FileName).ToLowerInvariant();
            if (new[] { ".jpg", ".jpeg", ".png" }.Contains(extension))
            {
                var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
                var fileName = $"{Guid.NewGuid()}{extension}";
                using (var stream = new FileStream(Path.Combine(folder, fileName), FileMode.Create))
                {
                    await request.ProfileImage.CopyToAsync(stream);
                }
                user.ProfileImage = $"/uploads/profiles/{fileName}";
            }
        }

        // Update Applicant Specifics
        applicant.Address = request.Address;
        applicant.DateOfBirth = request.DateOfBirth;
        applicant.Gender = request.Gender;
        applicant.Skills = request.Skills;
        applicant.LinkedInUrl = request.LinkedInUrl;
        applicant.PreferredRole = request.PreferredRole;
        applicant.PreferredWorkLocation = request.PreferredWorkLocation;

        if (!string.IsNullOrEmpty(request.CurrentRole)) applicant.CurrentRole = request.CurrentRole;
        applicant.ExperienceYears = request.ExperienceYears;

        // Resume Upload
        if (request.Resume != null && request.Resume.Length > 0)
        {
            var extension = Path.GetExtension(request.Resume.FileName).ToLowerInvariant();
            if (extension == ".pdf")
            {
                var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "resumes");
                if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);
                var fileName = $"{Guid.NewGuid()}{extension}";
                using (var stream = new FileStream(Path.Combine(folder, fileName), FileMode.Create))
                {
                    await request.Resume.CopyToAsync(stream);
                }
                applicant.ResumeUrl = $"/uploads/resumes/{fileName}";
            }
        }

        // Parse and Update Lists (Education)
        if (!string.IsNullOrEmpty(request.EducationJson))
        {
            try
            {
                var eduList = JsonSerializer.Deserialize<List<EducationDto>>(request.EducationJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (eduList != null)
                {
                    _context.Education.RemoveRange(applicant.Education);
                    foreach (var item in eduList)
                    {
                        _context.Education.Add(new Education
                        {
                            EducationId = Guid.NewGuid(),
                            ApplicantId = applicant.ApplicantId,
                            CollegeName = item.CollegeName,
                            Degree = item.Degree,
                            Specialization = item.Specialization,
                            CompletionYear = item.CompletionYear,
                            Grade = item.Grade
                        });
                    }
                }
            }
            catch { /* Ignore JSON errors for now */ }
        }

        // Parse and Update Lists (Work Experience)
        if (!string.IsNullOrEmpty(request.WorkExperienceJson))
        {
            try
            {
                var expList = JsonSerializer.Deserialize<List<WorkExperienceDto>>(request.WorkExperienceJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (expList != null)
                {
                    _context.WorkExperience.RemoveRange(applicant.WorkExperience);
                    foreach (var item in expList)
                    {
                        _context.WorkExperience.Add(new WorkExperience
                        {
                            ExperienceId = Guid.NewGuid(),
                            ApplicantId = applicant.ApplicantId,
                            CompanyName = item.CompanyName,
                            Role = item.Role,
                            Duration = item.Duration,
                            Description = item.Description
                        });
                    }
                }
            }
            catch { /* Ignore JSON errors */ }
        }

        applicant.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully" });
    }

    // GET: api/profiles/recruiter/me
    [HttpGet("recruiter/me")]
    [Authorize(Roles = "Recruiter,recruiter")]
    public async Task<ActionResult<RecruiterProfileDto>> GetRecruiterProfile()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var recruiter = await _context.Recruiters
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.User.UserId == userId);

        if (recruiter == null)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            return Ok(new RecruiterProfileDto
            {
                UserId = userId,
                Email = user.Email,
                FullName = user.FullName,
                CompanyName = "",
                CompanyLogo = "",
                Designation = "",
                MobileNumber = user.MobileNumber,
                Location = user.Location
            });
        }

        return new RecruiterProfileDto
        {
            RecruiterId = recruiter.RecruiterId,
            UserId = userId,
            FullName = recruiter.User.FullName,
            Email = recruiter.User.Email,
            CompanyName = recruiter.CompanyName,
            CompanyLogo = recruiter.CompanyLogo,
            Designation = recruiter.Designation,
            Location = recruiter.Location,
            MobileNumber = recruiter.MobileNumber ?? recruiter.User.MobileNumber
        };
    }

    // PUT: api/profiles/recruiter/me
    [HttpPut("recruiter/me")]
    [Authorize(Roles = "Recruiter,recruiter")]
    public async Task<IActionResult> UpdateRecruiterProfile(UpdateRecruiterProfileDto request)
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return Unauthorized();
        }

        var recruiter = await _context.Recruiters
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.User.UserId == userId);

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (recruiter == null)
        {
            recruiter = new Recruiter
            {
                RecruiterId = Guid.NewGuid(),
                User = user,
                CompanyName = request.CompanyName,
                CompanyLogo = request.CompanyLogo,
                Designation = request.Designation,
                Location = request.Location,
                MobileNumber = request.MobileNumber,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Recruiters.Add(recruiter);
        }
        else
        {
            recruiter.CompanyName = request.CompanyName;
            recruiter.CompanyLogo = request.CompanyLogo;
            recruiter.Designation = request.Designation;
            recruiter.Location = request.Location;
            recruiter.MobileNumber = request.MobileNumber;
            recruiter.UpdatedAt = DateTime.UtcNow;
        }

        // Sync common fields to User table
        if (!string.IsNullOrEmpty(request.Location)) user.Location = request.Location;
        if (!string.IsNullOrEmpty(request.MobileNumber)) user.MobileNumber = request.MobileNumber;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/profiles/recruiter/logo
    [HttpPost("recruiter/logo")]
    [Authorize(Roles = "Recruiter,recruiter")]
    public async Task<ActionResult<string>> UploadLogo(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var validExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!validExtensions.Contains(extension))
            return BadRequest("Invalid image format. Only JPG, PNG, and GIF are allowed.");

        // Create wwwroot/uploads/logos if not exists
        var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsFolder = Path.Combine(webRootPath, "uploads", "logos");

        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return relative URL
        var fileUrl = $"/uploads/logos/{fileName}";
        // Optionally prepend Request.Scheme + "://" + Request.Host if full URL is needed, 
        // but relative is better for storage usually, can be resolved by frontend.
        // But backend is 5000/5001 usually, frontend 5173. 
        // If I return /uploads/..., frontend needs to prepend backend URL.
        // Let's return just path and let frontend handle or prepend.

        // Actually best to return object { url: ... }
        return Ok(new { url = fileUrl });
    }
}
