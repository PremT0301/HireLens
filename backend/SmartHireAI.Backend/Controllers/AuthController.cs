using Microsoft.AspNetCore.Mvc;
using SmartHireAI.Backend.Models;
using SmartHireAI.Backend.Services;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
    [HttpGet("google-login")]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties { RedirectUri = Url.Action("GoogleCallback") };
        return Challenge(properties, Microsoft.AspNetCore.Authentication.Google.GoogleDefaults.AuthenticationScheme);
    }

    [HttpGet("google-callback")]
    public async Task<ActionResult<AuthResponseDto>> GoogleCallback()
    {
        var result = await HttpContext.AuthenticateAsync(Microsoft.AspNetCore.Authentication.Google.GoogleDefaults.AuthenticationScheme);

        if (!result.Succeeded)
            return BadRequest(new { message = "Google authentication failed" });

        var claims = result.Principal.Identities.FirstOrDefault()?.Claims;
        var email = claims?.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
        var googleId = claims?.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var name = claims?.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Name)?.Value;
        // email_verified is sometimes a custom claim or "true" string
        // Google usually returns "email_verified": true in logic, but standard claim might not be there depending on scope.
        // For simplicity in this step, we trust the AuthenticateAsync result as "Verified" by Google standards, 
        // but explicit check is better if claim exists.

        if (string.IsNullOrEmpty(email))
            return BadRequest(new { message = "Email required" });

        try
        {
            var authResponse = await _authService.GoogleLoginAsync(new GoogleLoginDto
            {
                Email = email,
                GoogleId = googleId ?? string.Empty,
                FullName = name ?? "Google User",
                ProfileImage = claims?.FirstOrDefault(c => c.Type == "picture")?.Value
            });
            return Ok(authResponse); // Returns JWT
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
