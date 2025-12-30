using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Services;

public enum VerificationResult
{
    Success,
    AlreadyVerified,
    InvalidToken,
    TokenExpired,
    UserNotFound,
    Failure
}

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(UserRegisterRequest request);
    Task<AuthResponseDto> LoginAsync(UserLoginDto request);
    Task<VerificationResult> VerifyEmailAsync(string userId, string token);
    Task<bool> ResendVerificationEmailAsync(string email);
    Task<bool> ResendVerificationEmailByUserIdAsync(string userId);
}

