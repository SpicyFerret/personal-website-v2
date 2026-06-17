using System.ComponentModel.DataAnnotations;

namespace PersonalWebsite.Api.Dtos;

public record CreateContactRequest(
    [Required, MaxLength(120)] string Name,
    [Required, EmailAddress, MaxLength(200)] string Email,
    [MaxLength(200)] string? Subject,
    [Required, MaxLength(5000)] string Message);

public record ContactSubmissionDto(
    Guid Id,
    string Name,
    string Email,
    string? Subject,
    string Message,
    bool IsRead,
    DateTimeOffset CreatedAt);
