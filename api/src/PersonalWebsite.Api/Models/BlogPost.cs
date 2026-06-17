namespace PersonalWebsite.Api.Models;

public class BlogPost
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    /// <summary>Markdown body of the post.</summary>
    public string Content { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public bool IsPublished { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}
