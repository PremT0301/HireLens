#nullable enable
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
    private readonly IAnalysisService _analysisService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(ApplicationDbContext context, IConfiguration configuration, IEmailService emailService, IAnalysisService analysisService, ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
        _analysisService = analysisService;
        _logger = logger;
    }


    public async Task<AuthResponseDto> RegisterAsync(UserRegisterRequest request)
    {
        // 1. Validate OTP verification for both email and mobile
        var emailVerification = await _context.OtpVerifications
            .FirstOrDefaultAsync(v => v.Identifier == request.Email && v.Type == OtpType.Email && v.IsVerified);
        
        if (emailVerification == null)
        {
            throw new Exception("Email has not been verified via OTP.");
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
            Role = Enum.Parse<UserRole>(request.Role.ToUpper()),
            ProfileImage = profileImageUrl,
            SubscriptionPlan = "FREE",
            PricingPlan = "FREE",
            UpdatedAt = DateTime.UtcNow,
            IsEmailVerified = true,
            IsActive = true // Active immediately since verified
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

            // Save changes first to get User/Applicant IDs in DB
            await _context.SaveChangesAsync();

            // Trigger Resume Analysis if resume exists
            if (request.Resume != null && request.Resume.Length > 0)
            {
                try
                {
                    await _analysisService.AnalyzeResumeAsync(user.UserId, request.Resume);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to analyze resume during registration for user {Email}", user.Email);
                    // We don't throw here to avoid failing registration if AI service is down
                }
            }

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

        // Cleanup used OTP records
        _context.OtpVerifications.Remove(emailVerification);
        
        await _context.SaveChangesAsync();

        // 6. Return response
        return new AuthResponseDto
        {
            FullName = user.FullName ?? string.Empty,
            Role = user.Role.ToString(),
            PricingPlan = user.PricingPlan,
            SubscriptionPlan = user.SubscriptionPlan,
            UserId = user.UserId,
            Message = "Registration successful!",
            RequiresVerification = false
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

        if (!user.IsActive)
        {
            throw new Exception("Your account has been deactivated. Please contact support.");
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

        // 2.1 Check Verification
        if (!user.IsEmailVerified || !user.IsActive)
        {
            throw new Exception("Account not fully verified.");
        }

        // 3. Generate Token
        return CreateAuthResponse(user);
    }

    public async Task<bool> SendOtpAsync(string identifier, OtpType type)
    {
        // 1. Check if an active user already has this identifier (Email only)
        if (type == OtpType.Email)
        {
            var existingUser = await _context.Users.AnyAsync(u => u.Email == identifier && u.IsActive);
            if (existingUser) throw new Exception("Account with this email already exists.");
        }

        var verification = await _context.OtpVerifications.FirstOrDefaultAsync(v => v.Identifier == identifier && v.Type == type);
        
        if (verification != null && verification.LockedUntil > DateTime.UtcNow)
        {
            throw new Exception($"Too many attempts. Please try again after {verification.LockedUntil}.");
        }

        if (verification == null)
        {
            verification = new OtpVerification { OtpId = Guid.NewGuid(), Identifier = identifier, Type = type };
            _context.OtpVerifications.Add(verification);
        }

        string otp = new Random().Next(100000, 999999).ToString();
        verification.OtpHash = HashOtp(otp);
        verification.Expiry = DateTime.UtcNow.AddMinutes(5);
        verification.Attempts = 0;
        verification.IsVerified = false;
        verification.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        if (type == OtpType.Email)
        {
            var emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                    <h2 style='color: #4f46e5;'>HireLens Verification Code</h2>
                    <p>Your verification code is: <strong style='font-size: 24px; color: #4f46e5;'>{otp}</strong></p>
                    <p>Valid for 5 minutes. Do not share this code.</p>
                </div>
            ";
            await _emailService.SendEmailAsync(identifier, "HireLens Verification Code", emailBody);
        }

        return true;
    }

    public async Task<bool> VerifyOtpAsync(string identifier, string otp, OtpType type)
    {
        var verification = await _context.OtpVerifications.FirstOrDefaultAsync(v => v.Identifier == identifier && v.Type == type);
        if (verification == null) return false;

        if (verification.LockedUntil > DateTime.UtcNow)
        {
            throw new Exception("Account is locked due to too many failed attempts. Try again later.");
        }

        if (verification.Expiry < DateTime.UtcNow)
        {
            throw new Exception("OTP has expired.");
        }

        if (VerifyOtp(otp, verification.OtpHash))
        {
            verification.IsVerified = true;
            verification.OtpHash = ""; // Clear hash after success
            verification.Attempts = 0;
            await _context.SaveChangesAsync();
            return true;
        }
        else
        {
            verification.Attempts++;
            if (verification.Attempts >= 5)
            {
                verification.LockedUntil = DateTime.UtcNow.AddMinutes(10);
            }
            await _context.SaveChangesAsync();
            return false;
        }
    }

    // Keep legacy signatures for interface compatibility if needed, or update interface
    public Task<bool> SendEmailOtpAsync(string email) => SendOtpAsync(email, OtpType.Email);
    public Task<bool> VerifyEmailOtpAsync(string email, string otp) => VerifyOtpAsync(email, otp, OtpType.Email);
    public Task<bool> SendMobileOtpAsync(string mobileNumber) => Task.FromResult(false);
    public Task<bool> VerifyMobileOtpAsync(string mobileNumber, string otp) => Task.FromResult(false);

    // =====================================
    // FORGOT PASSWORD — STEP 1
    // =====================================
    public async Task ForgotPasswordAsync(string email)
    {
        // Always respond 200 to prevent email enumeration
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !user.IsActive || !user.IsEmailVerified)
        {
            await LogSystemEventAsync("Auth", "ForgotPassword requested for unknown/inactive/unverified email.", null, "Info");
            return;
        }

        // Generate cryptographically secure 6-digit OTP
        int otpInt = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100000, 1000000);
        string otp = otpInt.ToString("D6");
        string otpHash = HashOtp(otp);

        // Upsert OtpVerification record
        var existing = await _context.OtpVerifications.FirstOrDefaultAsync(v =>
            v.Identifier == email && v.Type == OtpType.PasswordReset);

        if (existing != null)
        {
            existing.OtpHash = otpHash;
            existing.Expiry = DateTime.UtcNow.AddMinutes(5);
            existing.Attempts = 0;
            existing.IsVerified = false;
            existing.LockedUntil = null;
            existing.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _context.OtpVerifications.Add(new OtpVerification
            {
                OtpId = Guid.NewGuid(),
                Identifier = email,
                Type = OtpType.PasswordReset,
                OtpHash = otpHash,
                Expiry = DateTime.UtcNow.AddMinutes(5),
                Attempts = 0,
                IsVerified = false,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        // Send branded HTML email
        string emailBody = $@"
            <div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0f172a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);'>
                <div style='text-align:center;margin-bottom:28px;'>
                    <h1 style='font-size:1.6rem;font-weight:800;color:#3b82f6;margin:0;'>HireLens<span style='color:#e5e7eb;'>AI</span></h1>
                </div>
                <h2 style='color:#e5e7eb;font-size:1.3rem;font-weight:700;margin-bottom:12px;'>Password Reset Request</h2>
                <p style='color:#94a3b8;line-height:1.6;margin-bottom:24px;'>
                    We received a request to reset your password. Use the code below to proceed.
                    This code is valid for <strong style='color:#e5e7eb;'>5 minutes</strong>.
                </p>
                <div style='background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;'>
                    <span style='font-size:2.5rem;font-weight:800;letter-spacing:12px;color:#3b82f6;'>{otp}</span>
                </div>
                <p style='color:#64748b;font-size:0.85rem;line-height:1.6;'>
                    If you did not request a password reset, you can safely ignore this email.
                    Never share this code with anyone.
                </p>
                <div style='margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;'>
                    <p style='color:#475569;font-size:0.8rem;margin:0;'>© HireLens AI — AI-Powered Recruitment Platform</p>
                </div>
            </div>";

        await _emailService.SendEmailAsync(email, "HireLens AI — Password Reset Code", emailBody);
        await LogSystemEventAsync("Auth", $"Password reset OTP sent to {email}.", user.UserId, "Info");
    }

    // =====================================
    // FORGOT PASSWORD — STEP 2 (Verify OTP)
    // =====================================
    public async Task<ResetTokenResponseDto> VerifyPasswordResetOtpAsync(string email, string otp)
    {
        var verification = await _context.OtpVerifications.FirstOrDefaultAsync(v =>
            v.Identifier == email && v.Type == OtpType.PasswordReset && !v.IsVerified);

        if (verification == null)
            throw new Exception("No active password reset request found for this email.");

        // Lock check
        if (verification.LockedUntil.HasValue && verification.LockedUntil > DateTime.UtcNow)
        {
            var remaining = (int)(verification.LockedUntil.Value - DateTime.UtcNow).TotalMinutes + 1;
            throw new InvalidOperationException($"Too many failed attempts. Try again in {remaining} minute(s).");
        }

        // Expiry check
        if (verification.Expiry < DateTime.UtcNow)
            throw new Exception("Reset code has expired. Please request a new one.");

        // OTP match check
        if (!VerifyOtp(otp, verification.OtpHash))
        {
            verification.Attempts++;
            if (verification.Attempts >= 5)
                verification.LockedUntil = DateTime.UtcNow.AddMinutes(10);
            await _context.SaveChangesAsync();
            throw new Exception($"Invalid code. {Math.Max(0, 5 - verification.Attempts)} attempt(s) remaining.");
        }

        // Success — mark as verified
        verification.IsVerified = true;
        await _context.SaveChangesAsync();

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) throw new Exception("User not found.");

        var resetToken = GeneratePasswordResetToken(user);
        await LogSystemEventAsync("Auth", $"Password reset OTP verified for {email}.", user.UserId, "Info");

        return new ResetTokenResponseDto
        {
            ResetToken = resetToken,
            Message = "OTP verified. Use the reset token to set your new password."
        };
    }

    // =====================================
    // FORGOT PASSWORD — STEP 3 (Reset)
    // =====================================
    public async Task ResetPasswordAsync(string resetToken, string newPassword, string confirmPassword)
    {
        // Validate the reset token
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);
        var tokenHandler = new JwtSecurityTokenHandler();
        ClaimsPrincipal principal;
        try
        {
            principal = tokenHandler.ValidateToken(resetToken, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ClockSkew = TimeSpan.Zero
            }, out _);
        }
        catch
        {
            throw new UnauthorizedAccessException("Invalid or expired reset token.");
        }

        var purpose = principal.FindFirstValue("purpose");
        if (purpose != "password_reset")
            throw new UnauthorizedAccessException("Invalid reset token purpose.");

        var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            throw new UnauthorizedAccessException("Invalid token claims.");

        // Password validation
        if (newPassword != confirmPassword)
            throw new Exception("Passwords do not match.");
        if (!IsPasswordStrong(newPassword))
            throw new Exception("Password must be at least 8 characters and contain at least one uppercase letter and one number.");

        var user = await _context.Users.FindAsync(userId);
        if (user == null || !user.IsActive)
            throw new Exception("User not found or account is inactive.");

        // Hash and update password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;

        // Invalidate all PasswordReset OTP records for this user (prevent replay)
        var otpRecords = await _context.OtpVerifications
            .Where(v => v.Identifier == user.Email && v.Type == OtpType.PasswordReset)
            .ToListAsync();
        _context.OtpVerifications.RemoveRange(otpRecords);

        await _context.SaveChangesAsync();

        // Send confirmation email
        string confirmBody = $@"
            <div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#0f172a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);'>
                <div style='text-align:center;margin-bottom:28px;'>
                    <h1 style='font-size:1.6rem;font-weight:800;color:#3b82f6;margin:0;'>HireLens<span style='color:#e5e7eb;'>AI</span></h1>
                </div>
                <div style='text-align:center;margin-bottom:20px;'>
                    <div style='display:inline-block;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:2rem;'>✓</div>
                </div>
                <h2 style='color:#e5e7eb;font-size:1.3rem;font-weight:700;text-align:center;margin-bottom:12px;'>Password Updated Successfully</h2>
                <p style='color:#94a3b8;line-height:1.6;text-align:center;margin-bottom:24px;'>
                    Your HireLens AI account password has been reset. You can now log in with your new password.
                </p>
                <p style='color:#64748b;font-size:0.85rem;line-height:1.6;text-align:center;'>
                    If you did not make this change, please contact support immediately.
                </p>
                <div style='margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;'>
                    <p style='color:#475569;font-size:0.8rem;margin:0;'>© HireLens AI — AI-Powered Recruitment Platform</p>
                </div>
            </div>";

        await _emailService.SendEmailAsync(user.Email, "HireLens AI — Password Updated", confirmBody);
        await LogSystemEventAsync("Auth", $"Password successfully reset for user {user.Email}.", user.UserId, "Info");
    }

    // =====================================
    // HELPERS
    // =====================================
    private static bool IsPasswordStrong(string password)
    {
        if (password.Length < 8) return false;
        if (!password.Any(char.IsUpper)) return false;
        if (!password.Any(char.IsDigit)) return false;
        return true;
    }

    private string GeneratePasswordResetToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("purpose", "password_reset")
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(15),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private async Task LogSystemEventAsync(string source, string message, Guid? userId, string level = "Info")
    {
        _context.SystemLogs.Add(new SystemLog
        {
            LogId = Guid.NewGuid(),
            Timestamp = DateTime.UtcNow,
            Source = source,
            Level = level,
            Message = message,
            UserId = userId
        });
        await _context.SaveChangesAsync();
    }


    private string HashOtp(string otp)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(otp));
            return Convert.ToBase64String(bytes);
        }
    }

    private bool VerifyOtp(string otp, string? hashedOtp)
    {
        if (hashedOtp == null) return false;
        return HashOtp(otp) == hashedOtp;
    }


    private AuthResponseDto CreateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Token = token,
            FullName = user.FullName ?? string.Empty,
            Role = user.Role.ToString(),
            PricingPlan = user.PricingPlan,
            SubscriptionPlan = user.SubscriptionPlan,
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
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("FullName", user.FullName ?? ""),
            new Claim("PricingPlan", user.PricingPlan),
            new Claim("subscriptionPlan", user.SubscriptionPlan)
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
