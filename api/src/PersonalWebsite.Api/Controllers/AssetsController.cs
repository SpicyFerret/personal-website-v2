using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalWebsite.Api.Services;

namespace PersonalWebsite.Api.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize(Roles = "Admin")]
public class AssetsController(R2StorageService storage) : ControllerBase
{
    private static readonly string[] AllowedContentTypes =
        ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml", "application/pdf"];

    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string prefix = "uploads")
    {
        if (!storage.IsConfigured)
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "Asset storage (R2) is not configured." });

        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { message = $"Unsupported content type: {file.ContentType}" });

        await using var stream = file.OpenReadStream();
        var url = await storage.UploadAsync(stream, file.FileName, file.ContentType, prefix);
        return Ok(new { url });
    }
}
