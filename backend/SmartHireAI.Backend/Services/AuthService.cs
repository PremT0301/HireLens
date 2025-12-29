using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;
using BCrypt.Net;

namespace SmartHireAI.Backend.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(UserRegisterRequest request)
    {
        // 1. Check if user exists
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            throw new Exception("User with this email already exists.");
        }

        // 2. Hash Password
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 2.1 Handle Profile Image Upload (Common for User)
        string? profileImageUrl = null;
        if (request.ProfileImage != null && request.ProfileImage.Length > 0)
        {
            var extension = Path.GetExtension(request.ProfileImage.FileName).ToLowerInvariant();
            var validExtensions = new[] { ".jpg", ".jpeg", ".png" };
            if (validExtensions.Contains(extension))
            {
                var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadsFolder = Path.Combine(webRootPath, "uploads", "profiles");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.ProfileImage.CopyToAsync(stream);
                }
                profileImageUrl = $"/uploads/profiles/{fileName}";
            }
        }

        // 3. Create User
        var user = new User
        {
            UserId = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = passwordHash,
            FullName = request.FullName,
            MobileNumber = request.MobileNumber,
            Location = request.Location,
            Role = request.Role,
            ProfileImage = profileImageUrl, // Set Profile Image
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        // 4. Create Profile based on role
        if (request.Role.Equals("Recruiter", StringComparison.OrdinalIgnoreCase))
        {
            string logoUrl = "";
            if (request.Logo != null && request.Logo.Length > 0)
            {
                var extension = Path.GetExtension(request.Logo.FileName).ToLowerInvariant();
                var validExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                if (validExtensions.Contains(extension))
                {
                    var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var uploadsFolder = Path.Combine(webRootPath, "uploads", "logos");
                    if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                    var fileName = $"{Guid.NewGuid()}{extension}";
                    var filePath = Path.Combine(uploadsFolder, fileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await request.Logo.CopyToAsync(stream);
                    }
                    logoUrl = $"/uploads/logos/{fileName}";
                }
            }

            var recruiter = new Recruiter
            {
                RecruiterId = Guid.NewGuid(),
                User = user,
                CompanyName = request.CompanyName,
                Location = request.Location, // Company Location
                MobileNumber = request.MobileNumber,
                Designation = request.Designation,
                CompanyLogo = logoUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Recruiters.Add(recruiter);
        }
        else if (request.Role.Equals("Applicant", StringComparison.OrdinalIgnoreCase))
        {
            // Resume Upload
            string resumeUrl = "";
            if (request.Resume != null && request.Resume.Length > 0)
            {
                var extension = Path.GetExtension(request.Resume.FileName).ToLowerInvariant();
                if (extension != ".pdf")
                {
                    throw new Exception("Only PDF resumes are allowed.");
                }

                var webRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var uploadsFolder = Path.Combine(webRootPath, "uploads", "resumes");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Resume.CopyToAsync(stream);
                }
                resumeUrl = $"/uploads/resumes/{fileName}";
            }

            var applicant = new Applicant
            {
                ApplicantId = Guid.NewGuid(),
                User = user,
                // CollegeName = request.CollegeName, // Removed
                // CompletionYear = request.CompletionYear, // Removed
                // Grade = request.Grade, // Removed
                Address = request.Address,
                ResumeUrl = resumeUrl,
                Location = request.Location,
                MobileNumber = request.MobileNumber,
                ExperienceYears = 0,

                Skills = request.Skills != null ? string.Join(",", request.Skills) : null,
                LinkedInUrl = request.LinkedInUrl,
                PreferredRole = request.PreferredRole,
                PreferredWorkLocation = request.PreferredWorkLocation,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Applicants.Add(applicant);

            // Add Education
            if (request.Education != null)
            {
                foreach (var eduDto in request.Education)
                {
                    var education = new Education
                    {
                        EducationId = Guid.NewGuid(),
                        ApplicantId = applicant.ApplicantId,
                        CollegeName = eduDto.CollegeName,
                        Degree = eduDto.Degree,
                        Specialization = eduDto.Specialization,
                        CompletionYear = eduDto.CompletionYear,
                        Grade = eduDto.Grade
                    };
                    _context.Education.Add(education);
                }
            }

            // Add Work Experience
            if (request.WorkExperience != null)
            {
                foreach (var expDto in request.WorkExperience)
                {
                    var experience = new WorkExperience
                    {
                        ExperienceId = Guid.NewGuid(),
                        ApplicantId = applicant.ApplicantId,
                        CompanyName = expDto.CompanyName,
                        Role = expDto.Role,
                        Duration = expDto.Duration,
                        Description = expDto.Description
                    };
                    _context.WorkExperience.Add(experience);
                }
            }
        }

        await _context.SaveChangesAsync();

        // 5. Generate Token response
        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto> LoginAsync(UserLoginDto request)
    {
        // 1. Find User
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            throw new Exception("Invalid credentials.");
        }

        // 2. Verify Password
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            throw new Exception("This account is registered via Google. Please use 'Sign in with Google'.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid credentials.");
        }

        // 3. Generate Token
        return CreateAuthResponse(user);
    }

    public async Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            // Register new Google User
            user = new User
            {
                UserId = Guid.NewGuid(),
                Email = request.Email,
                FullName = request.FullName,
                GoogleId = request.GoogleId,
                AuthProvider = "Google",
                IsEmailVerified = true,
                ProfileImage = request.ProfileImage,
                Role = "Applicant", // Default to Applicant
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                PasswordHash = null // Explicitly null
            };
            _context.Users.Add(user);

            // Create Profile
            var applicant = new Applicant
            {
                ApplicantId = Guid.NewGuid(),
                User = user,
                ExperienceYears = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Applicants.Add(applicant);

            await _context.SaveChangesAsync();
        }
        else
        {
            // User exists - Check consistency
            if (user.AuthProvider != "Google" && string.IsNullOrEmpty(user.GoogleId))
            {
                // Optional: Could merge here, but for now strict separation as per initial plan safety
                // Or actually, checking if GoogleId is empty is enough.
                // If email matches but no GoogleId, they registered with password.
                throw new Exception("User exists with password authentication. Please login via password.");
            }
            // Update Google Info if needed
            if (string.IsNullOrEmpty(user.GoogleId))
            {
                user.GoogleId = request.GoogleId;
                user.AuthProvider = "Google"; // Upgrade to Google?
                await _context.SaveChangesAsync();
            }
        }

        return CreateAuthResponse(user);
    }

    private AuthResponseDto CreateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Token = token,
            FullName = user.FullName ?? string.Empty,
            Role = user.Role,
            UserId = user.UserId
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("FullName", user.FullName ?? "")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
