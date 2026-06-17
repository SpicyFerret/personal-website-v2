namespace PersonalWebsite.Api.Services;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "personal-website";
    public string Audience { get; set; } = "personal-website";
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 720;
}
