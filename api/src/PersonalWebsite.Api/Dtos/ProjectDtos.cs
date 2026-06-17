using System.ComponentModel.DataAnnotations;

namespace PersonalWebsite.Api.Dtos;

public record ProjectDto(
    Guid Id,
    string Title,
    string Slug,
    string Summary,
    string Description,
    string? RepoUrl,
    string? LiveUrl,
    string? CoverImageUrl,
    IEnumerable<string> TechStack,
    bool IsFeatured,
    int SortOrder);

public record SaveProjectRequest(
    [Required, MaxLength(200)] string Title,
    [MaxLength(500)] string Summary,
    string Description,
    string? Slug,
    string? RepoUrl,
    string? LiveUrl,
    string? CoverImageUrl,
    IEnumerable<string>? TechStack,
    bool IsFeatured,
    int SortOrder);
