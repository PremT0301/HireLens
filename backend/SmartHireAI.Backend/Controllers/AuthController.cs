using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;


[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }


    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromForm] UserRegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(UserLoginDto request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
    {
        _logger.LogInformation("Received VerifyEmail request for user {UserId} with token: {Token}", userId, token);
        try
        {
            var result = await _authService.VerifyEmailAsync(userId, token);

            return result switch
            {
                VerificationResult.Success => Ok(new { message = "Email verified successfully! You can now login.", status = "success" }),
                VerificationResult.AlreadyVerified => Ok(new { message = "Email already verified. Please login.", status = "already_verified" }),
                VerificationResult.TokenExpired => BadRequest(new { message = "Verification link expired.", status = "expired" }),
                VerificationResult.InvalidToken => BadRequest(new { message = "Invalid verification link.", status = "invalid" }),
                VerificationResult.UserNotFound => BadRequest(new { message = "Invalid verification link.", status = "invalid" }),
                _ => BadRequest(new { message = "Verification failed.", status = "error" })
            };
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification([FromQuery] string? email, [FromQuery] string? userId)
    {
        try
        {
            if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { message = "Email or UserId is required." });
            }

            bool result = false;

            if (!string.IsNullOrEmpty(email))
            {
                result = await _authService.ResendVerificationEmailAsync(email);
            }
            else if (!string.IsNullOrEmpty(userId))
            {
                result = await _authService.ResendVerificationEmailByUserIdAsync(userId);
            }

            if (result)
            {
                return Ok(new { message = "Verification email sent successfully." });
            }
            return BadRequest(new { message = "User not found or already verified." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
