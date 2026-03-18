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
                return Unauthorized(new { message = ex.Message });

            if (ex.Message.Contains("not verified") || ex.Message.Contains("verify-email") || ex.Message.Contains("deactivated"))
                return StatusCode(403, new { message = ex.Message });

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

    // ====================================
    // FORGOT PASSWORD — STEP 1
    // ====================================
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
    {
        try
        {
            await _authService.ForgotPasswordAsync(request.Email);
        }
        catch (Exception ex)
        {
            // Log internally but never expose to client (anti-enumeration)
            _logger.LogError(ex, "ForgotPassword internal error for {Email}", request.Email);
        }
        // Always return 200 to prevent email enumeration
        return Ok(new { message = "If this email exists, a reset code was sent." });
    }

    // ====================================
    // FORGOT PASSWORD — STEP 2 (Verify OTP)
    // ====================================
    [HttpPost("verify-reset-otp")]
    public async Task<IActionResult> VerifyResetOtp([FromBody] VerifyResetOtpDto request)
    {
        try
        {
            var result = await _authService.VerifyPasswordResetOtpAsync(request.Email, request.Otp);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            // Too many attempts — 429
            return StatusCode(429, new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ====================================
    // FORGOT PASSWORD — STEP 3 (Reset Password)
    // ====================================
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        // Extract Bearer token manually (short-lived reset JWT, not the main auth JWT)
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            return Unauthorized(new { message = "Reset token is required." });

        var resetToken = authHeader.Substring("Bearer ".Length).Trim();

        try
        {
            await _authService.ResetPasswordAsync(resetToken, request.NewPassword, request.ConfirmPassword);
            return Ok(new { message = "Password updated successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
