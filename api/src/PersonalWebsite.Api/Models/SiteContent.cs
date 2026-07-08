namespace PersonalWebsite.Api.Models;

/// <summary>
/// Free-form site copy editable from the admin panel — e.g. "resume" (markdown),
/// "home.title", "home.stats" (JSON). Keeps personal content out of the codebase.
/// </summary>
public class SiteContent
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
