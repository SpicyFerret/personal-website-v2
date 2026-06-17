namespace PersonalWebsite.Api.Models;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    /// <summary>Markdown long-form description.</summary>
    public string Description { get; set; } = string.Empty;
    public string? RepoUrl { get; set; }
    public string? LiveUrl { get; set; }
    public string? CoverImageUrl { get; set; }
    /// <summary>Mapped to a PostgreSQL text[] column by Npgsql.</summary>
    public List<string> TechStack { get; set; } = new();
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
