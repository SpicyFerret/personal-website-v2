using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Data;
using PersonalWebsite.Api.Dtos;
using PersonalWebsite.Api.Models;
using PersonalWebsite.Api.Services;

namespace PersonalWebsite.Api.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectsController(AppDbContext db) : ControllerBase
{
    // ---------- Public ----------

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll([FromQuery] bool? featured)
    {
        var query = db.Projects.AsQueryable();
        if (featured == true)
            query = query.Where(p => p.IsFeatured);

        var projects = await query
            .OrderBy(p => p.SortOrder)
            .ThenByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects.Select(ToDto));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<ProjectDto>> GetBySlug(string slug)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Slug == slug);
        return project is null ? NotFound() : Ok(ToDto(project));
    }

    // ---------- Admin ----------

    [HttpGet("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectDto>> GetById(Guid id)
    {
        var project = await db.Projects.FindAsync(id);
        return project is null ? NotFound() : Ok(ToDto(project));
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectDto>> Create(SaveProjectRequest request)
    {
        var project = new Project();
        Apply(project, request);
        db.Projects.Add(project);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, ToDto(project));
    }

    [HttpPut("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ProjectDto>> Update(Guid id, SaveProjectRequest request)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return NotFound();

        Apply(project, request);
        project.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Ok(ToDto(project));
    }

    [HttpDelete("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var project = await db.Projects.FindAsync(id);
        if (project is null) return NotFound();
        db.Projects.Remove(project);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---------- Helpers ----------

    private static void Apply(Project project, SaveProjectRequest request)
    {
        project.Title = request.Title;
        project.Summary = request.Summary;
        project.Description = request.Description;
        project.RepoUrl = request.RepoUrl;
        project.LiveUrl = request.LiveUrl;
        project.CoverImageUrl = request.CoverImageUrl;
        project.TechStack = request.TechStack?.Select(t => t.Trim()).Where(t => t.Length > 0).ToList() ?? new();
        project.IsFeatured = request.IsFeatured;
        project.SortOrder = request.SortOrder;
        project.Slug = string.IsNullOrWhiteSpace(request.Slug)
            ? SlugGenerator.Generate(request.Title)
            : SlugGenerator.Generate(request.Slug);
    }

    private static ProjectDto ToDto(Project p) => new(
        p.Id, p.Title, p.Slug, p.Summary, p.Description, p.RepoUrl, p.LiveUrl,
        p.CoverImageUrl, p.TechStack, p.IsFeatured, p.SortOrder);
}
