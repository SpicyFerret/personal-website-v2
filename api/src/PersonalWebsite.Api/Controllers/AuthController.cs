using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Data;
using PersonalWebsite.Api.Dtos;
using PersonalWebsite.Api.Services;

namespace PersonalWebsite.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, TokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        var (token, expiresAt) = tokens.CreateToken(user);
        return Ok(new LoginResponse(token, expiresAt, user.DisplayName, user.Email));
    }
}
