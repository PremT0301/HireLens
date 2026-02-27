#nullable enable
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;

namespace SmartHireAI.Backend.Controllers;

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
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] UserLoginDto request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed for email: {Email}", request.Email);

            if (ex.Message.Contains("Invalid credentials"))
            {
                return Unauthorized(new { message = ex.Message });
            }
            if (ex.Message.Contains("not verified") || ex.Message.Contains("verify-email") || ex.Message.Contains("deactivated"))
            {
                return StatusCode(403, new { message = ex.Message });
            }

            return BadRequest(new { message = ex.Message });
        }
    }
    [HttpPost("send-email-otp")]
    public async Task<IActionResult> SendEmailOtp([FromQuery] string email)
    {
        try
        {
            var result = await _authService.SendEmailOtpAsync(email);
            if (result) return Ok(new { message = "OTP sent to email." });
            return BadRequest(new { message = "Failed to send email OTP." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("verify-email-otp")]
    public async Task<IActionResult> VerifyEmailOtp([FromBody] OtpVerificationDto request)
    {
        try
        {
            var result = await _authService.VerifyEmailOtpAsync(request.Identifier, request.Otp);
            if (result) return Ok(new { message = "Email verified successfully." });
            return BadRequest(new { message = "Invalid or expired OTP." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
