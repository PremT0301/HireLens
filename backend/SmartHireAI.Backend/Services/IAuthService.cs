using SmartHireAI.Backend.Models;

namespace SmartHireAI.Backend.Services;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(UserRegisterRequest request);
    Task<AuthResponseDto> LoginAsync(UserLoginDto request);
}
