namespace PersonalWebsite.Api.Models;

public class ContactSubmission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
