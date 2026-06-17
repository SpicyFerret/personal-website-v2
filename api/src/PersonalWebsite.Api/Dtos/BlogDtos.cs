using System.ComponentModel.DataAnnotations;

namespace PersonalWebsite.Api.Dtos;

public record BlogPostSummaryDto(
    Guid Id,
    string Title,
    string Slug,
    string Excerpt,
    string? CoverImageUrl,
    bool IsPublished,
    DateTimeOffset? PublishedAt,
    IEnumerable<string> Tags);

public record BlogPostDetailDto(
    Guid Id,
    string Title,
    string Slug,
    string Excerpt,
    string Content,
    string? CoverImageUrl,
    bool IsPublished,
    DateTimeOffset? PublishedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IEnumerable<string> Tags);

public record SaveBlogPostRequest(
    [Required, MaxLength(200)] string Title,
    [MaxLength(500)] string Excerpt,
    string Content,
    string? Slug,
    string? CoverImageUrl,
    bool IsPublished,
    IEnumerable<string>? Tags);
