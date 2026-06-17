using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Data;
using PersonalWebsite.Api.Dtos;
using PersonalWebsite.Api.Models;
using PersonalWebsite.Api.Services;

namespace PersonalWebsite.Api.Controllers;

[ApiController]
[Route("api/posts")]
public class BlogController(AppDbContext db) : ControllerBase
{
    // ---------- Public ----------

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogPostSummaryDto>>> GetPublished([FromQuery] string? tag)
    {
        var query = db.BlogPosts
            .Include(p => p.Tags)
            .Where(p => p.IsPublished);

        if (!string.IsNullOrWhiteSpace(tag))
            query = query.Where(p => p.Tags.Any(t => t.Slug == tag));

        var posts = await query
            .OrderByDescending(p => p.PublishedAt)
            .ToListAsync();

        return Ok(posts.Select(ToSummary));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<BlogPostDetailDto>> GetBySlug(string slug)
    {
        var post = await db.BlogPosts
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsPublished);

        return post is null ? NotFound() : Ok(ToDetail(post));
    }

    // ---------- Admin ----------

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<BlogPostSummaryDto>>> GetAll()
    {
        var posts = await db.BlogPosts
            .Include(p => p.Tags)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();

        return Ok(posts.Select(ToSummary));
    }

    [HttpGet("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BlogPostDetailDto>> GetById(Guid id)
    {
        var post = await db.BlogPosts.Include(p => p.Tags).FirstOrDefaultAsync(p => p.Id == id);
        return post is null ? NotFound() : Ok(ToDetail(post));
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BlogPostDetailDto>> Create(SaveBlogPostRequest request)
    {
        var post = new BlogPost();
        await ApplyAsync(post, request);
        db.BlogPosts.Add(post);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = post.Id }, ToDetail(post));
    }

    [HttpPut("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BlogPostDetailDto>> Update(Guid id, SaveBlogPostRequest request)
    {
        var post = await db.BlogPosts.Include(p => p.Tags).FirstOrDefaultAsync(p => p.Id == id);
        if (post is null) return NotFound();

        await ApplyAsync(post, request);
        post.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();
        return Ok(ToDetail(post));
    }

    [HttpDelete("admin/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var post = await db.BlogPosts.FindAsync(id);
        if (post is null) return NotFound();
        db.BlogPosts.Remove(post);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // ---------- Helpers ----------

    private async Task ApplyAsync(BlogPost post, SaveBlogPostRequest request)
    {
        post.Title = request.Title;
        post.Excerpt = request.Excerpt;
        post.Content = request.Content;
        post.CoverImageUrl = request.CoverImageUrl;
        post.Slug = string.IsNullOrWhiteSpace(request.Slug)
            ? SlugGenerator.Generate(request.Title)
            : SlugGenerator.Generate(request.Slug);

        // Toggle publish timestamp.
        if (request.IsPublished && !post.IsPublished)
            post.PublishedAt = DateTimeOffset.UtcNow;
        else if (!request.IsPublished)
            post.PublishedAt = null;
        post.IsPublished = request.IsPublished;

        post.Tags = await ResolveTagsAsync(request.Tags);
    }

    private async Task<List<Tag>> ResolveTagsAsync(IEnumerable<string>? names)
    {
        var result = new List<Tag>();
        if (names is null) return result;

        foreach (var raw in names.Select(n => n.Trim()).Where(n => n.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var slug = SlugGenerator.Generate(raw);
            var tag = await db.Tags.FirstOrDefaultAsync(t => t.Slug == slug)
                      ?? new Tag { Name = raw, Slug = slug };
            result.Add(tag);
        }
        return result;
    }

    private static BlogPostSummaryDto ToSummary(BlogPost p) => new(
        p.Id, p.Title, p.Slug, p.Excerpt, p.CoverImageUrl, p.IsPublished, p.PublishedAt,
        p.Tags.Select(t => t.Name));

    private static BlogPostDetailDto ToDetail(BlogPost p) => new(
        p.Id, p.Title, p.Slug, p.Excerpt, p.Content, p.CoverImageUrl, p.IsPublished,
        p.PublishedAt, p.CreatedAt, p.UpdatedAt, p.Tags.Select(t => t.Name));
}
