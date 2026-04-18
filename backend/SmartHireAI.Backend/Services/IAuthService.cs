using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(UserRegisterRequest request);
    Task<AuthResponseDto> LoginAsync(UserLoginDto request);
    Task<bool> SendEmailOtpAsync(string email);
    Task<bool> VerifyEmailOtpAsync(string email, string otp);
    Task<bool> SendMobileOtpAsync(string mobileNumber);
    Task<bool> VerifyMobileOtpAsync(string mobileNumber, string otp);
    Task ForgotPasswordAsync(string email);
    Task<ResetTokenResponseDto> VerifyPasswordResetOtpAsync(string email, string otp);
    Task ResetPasswordAsync(string resetToken, string newPassword, string confirmPassword);
    Task<string> GenerateTokenForUserAsync(Guid userId);
}
