using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Data;
using PersonalWebsite.Api.Dtos;
using PersonalWebsite.Api.Models;

namespace PersonalWebsite.Api.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(AppDbContext db, ILogger<ContactController> logger) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Submit(CreateContactRequest request)
    {
        var submission = new ContactSubmission
        {
            Name = request.Name,
            Email = request.Email,
            Subject = request.Subject,
            Message = request.Message,
        };

        db.ContactSubmissions.Add(submission);
        await db.SaveChangesAsync();

        // TODO: send notification via AWS SES (Danilo already uses SES).
        logger.LogInformation("New contact submission {Id} from {Email}", submission.Id, submission.Email);

        return Accepted(new { message = "Thanks for reaching out — I'll get back to you soon." });
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<ContactSubmissionDto>>> GetAll()
    {
        var items = await db.ContactSubmissions
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ContactSubmissionDto(
                c.Id, c.Name, c.Email, c.Subject, c.Message, c.IsRead, c.CreatedAt))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPatch("admin/{id:guid}/read")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var item = await db.ContactSubmissions.FindAsync(id);
        if (item is null) return NotFound();
        item.IsRead = true;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var item = await db.ContactSubmissions.FindAsync(id);
        if (item is null) return NotFound();
        db.ContactSubmissions.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
