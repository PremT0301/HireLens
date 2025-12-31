using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Logging;
using SmartHireAI.Backend.Data;
using SmartHireAI.Backend.Models;
using BCrypt.Net;

namespace SmartHireAI.Backend.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService, ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _logger = logger;
    }


    public async Task<AuthResponseDto> RegisterAsync(UserRegisterRequest request)
    {
        // 1. Check if user exists
        // 1. Check if user exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            if (existingUser.IsEmailVerified)
            {
                throw new Exception("User with this email already exists.");
            }
            else
            {
                // User exists but not verified. Resend verification email and return success.
                // This makes the endpoint idempotent for unverified users and prevents double-submission errors.
                await ResendVerificationEmailAsync(existingUser.Email);

                return new AuthResponseDto
                {
                    FullName = existingUser.FullName ?? string.Empty,
                    Role = existingUser.Role,
                    UserId = existingUser.UserId,
                    Message = "Registration successful! Verification email resent.",
                    RequiresVerification = true
                };
            }
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
            UpdatedAt = DateTime.UtcNow,
            IsEmailVerified = false,
            VerificationToken = Guid.NewGuid().ToString(),
            VerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
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
                CompanyWebsite = request.CompanyWebsite,
                Industry = request.Industry,
                CompanySize = request.CompanySize,
                RecruiterType = request.RecruiterType,
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

                // Enhanced fields
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                CurrentRole = request.CurrentRole,
                ExperienceYears = request.ExperienceYears ?? 0,

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
        _logger.LogInformation("User {Email} registered successfully. Verification token: {Token}", user.Email, user.VerificationToken);

        // 5. Send Verification Email
        try
        {
            var verificationUrl = $"http://localhost:5173/verify-email?userId={user.UserId}&token={user.VerificationToken}";
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;'>
                    <h2 style='color: #4f46e5;'>Welcome to HireLens AI!</h2>
                    <p>Hello {user.FullName},</p>
                    <p>Thank you for registering. Please verify your email address to activate your account:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{verificationUrl}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Verify Email Address</a>
                    </div>
                    <p>If the button doesn't work, you can also click the link below or copy it into your browser:</p>
                    <p><a href='{verificationUrl}'>{verificationUrl}</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #666;'>If you did not create an account, no further action is required.</p>
                </div>
            ";
            await _emailService.SendEmailAsync(user.Email, "Verify Your Email - HireLens AI", emailBody);
        }
        catch (Exception ex)
        {
            // If email fails, we should probably delete the user or at least inform them.
            // For now, let's throw an exception so the user knows why it failed.
            throw new Exception($"Account created, but verification email failed to send: {ex.Message}. Please check your SMTP settings (e.g. Google App Password).");
        }

        // 6. Return response
        return new AuthResponseDto
        {
            FullName = user.FullName ?? string.Empty,
            Role = user.Role,
            UserId = user.UserId,
            Message = "Registration successful! Please check your email to verify your account.",
            RequiresVerification = true
        };
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
            // This might happen if they were a Google user before, or if manual registration failed mid-way
            throw new Exception("This account does not have a password. If you previously used Google, please contact support or reset your password.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid credentials.");
        }

        // 2.1 Check Email Verification
        if (!user.IsEmailVerified)
        {
            throw new Exception("Your email is not verified. Please check your inbox for the verification link.");
        }

        // 3. Generate Token
        return CreateAuthResponse(user);
    }

    public async Task<VerificationResult> VerifyEmailAsync(string userId, string token)
    {
        _logger.LogInformation("Attempting to verify email for user {UserId} with token {Token}", userId, token);

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
        {
            _logger.LogWarning("Verification failed: UserId or Token is null/empty.");
            return VerificationResult.Failure;
        }

        if (!Guid.TryParse(userId, out var userGuid))
        {
            _logger.LogWarning("Verification failed: Invalid UserId format {UserId}", userId);
            return VerificationResult.Failure;
        }

        var user = await _context.Users.FindAsync(userGuid);

        if (user == null)
        {
            _logger.LogWarning("Verification failed: No user found with id {UserId}", userId);
            return VerificationResult.UserNotFound;
        }

        if (user.IsEmailVerified)
        {
            _logger.LogInformation("User {Email} is already verified.", user.Email);
            return VerificationResult.AlreadyVerified;
        }

        // Token Validation
        if (user.VerificationToken != token)
        {
            _logger.LogWarning("Verification failed: Token mismatch for user {Email}. Expected {Expected}, Got {Actual}", user.Email, user.VerificationToken, token);
            return VerificationResult.InvalidToken;
        }

        if (user.VerificationTokenExpiry < DateTime.UtcNow)
        {
            _logger.LogWarning("Verification failed: Token expired for user {Email}. Expiry: {Expiry}, Current UTC: {Now}",
                user.Email, user.VerificationTokenExpiry, DateTime.UtcNow);
            return VerificationResult.TokenExpired;
        }

        _logger.LogInformation("Token valid. Verifying email for user: {Email}", user.Email);
        user.IsEmailVerified = true;
        user.VerificationToken = null; // Clear token after verification
        user.VerificationTokenExpiry = null;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Email verified successfully for user: {Email}", user.Email);
        return VerificationResult.Success;
    }

    public async Task<bool> ResendVerificationEmailAsync(string email)
    {
        _logger.LogInformation("Attempting to resend verification email to: {Email}", email);
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            _logger.LogWarning("Resend failed: No user found with email {Email}", email);
            return false;
        }

        if (user.IsEmailVerified)
        {
            _logger.LogInformation("Resend skipped: User {Email} is already verified.", email);
            return true;
        }

        // Generate new token
        user.VerificationToken = Guid.NewGuid().ToString();
        user.VerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        _logger.LogInformation("New verification token generated for {Email}: {Token}", email, user.VerificationToken);

        // Send Email
        try
        {
            var verificationUrl = $"http://localhost:5173/verify-email?userId={user.UserId}&token={user.VerificationToken}";
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                    <h2 style='color: #4f46e5;'>New Verification Link - HireLens AI</h2>
                    <p>Hello {user.FullName},</p>
                    <p>You requested a new verification link. Please click below to activate your account:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{verificationUrl}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Verify Email Address</a>
                    </div>
                    <p>If the button doesn't work, you can also copy this link into your browser:</p>
                    <p><a href='{verificationUrl}'>{verificationUrl}</a></p>
                    <p>This link will expire in 24 hours.</p>
                    <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;' />
                    <p style='font-size: 12px; color: #666;'>If you did not request this, you can safely ignore this email.</p>
                </div>
            ";
            await _emailService.SendEmailAsync(user.Email, "New Verification Link - HireLens AI", emailBody);
            _logger.LogInformation("Verification email resent to {Email}", email);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resend verification email to {Email}", email);
            throw new Exception($"Failed to send verification email: {ex.Message}");
        }
    }

    public async Task<bool> ResendVerificationEmailByUserIdAsync(string userId)
    {
        if (!Guid.TryParse(userId, out var userGuid)) return false;

        var user = await _context.Users.FindAsync(userGuid);
        if (user == null) return false;

        return await ResendVerificationEmailAsync(user.Email);
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
