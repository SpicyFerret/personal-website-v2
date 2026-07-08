using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Data;
using PersonalWebsite.Api.Models;

namespace PersonalWebsite.Api.Controllers;

public record SaveContentRequest([property: Required] string Value);

[ApiController]
[Route("api/content")]
public class ContentController(AppDbContext db) : ControllerBase
{
    /// <summary>All site copy as a key → value map (public: it's the site's own content).</summary>
    [HttpGet]
    public async Task<ActionResult<Dictionary<string, string>>> GetAll()
    {
        var entries = await db.SiteContents.ToDictionaryAsync(c => c.Key, c => c.Value);
        return Ok(entries);
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> Get(string key)
    {
        var entry = await db.SiteContents.FindAsync(key);
        return entry is null
            ? NotFound()
            : Ok(new { entry.Key, entry.Value, entry.UpdatedAt });
    }

    [HttpPut("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Upsert(string key, SaveContentRequest request)
    {
        if (string.IsNullOrWhiteSpace(key) || key.Length > 120)
            return BadRequest(new { message = "Invalid key." });

        var entry = await db.SiteContents.FindAsync(key);
        if (entry is null)
        {
            entry = new SiteContent { Key = key };
            db.SiteContents.Add(entry);
        }
        entry.Value = request.Value;
        entry.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new { entry.Key, entry.Value, entry.UpdatedAt });
    }

    [HttpDelete("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string key)
    {
        var entry = await db.SiteContents.FindAsync(key);
        if (entry is null) return NotFound();
        db.SiteContents.Remove(entry);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
