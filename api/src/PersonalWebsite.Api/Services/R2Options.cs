namespace PersonalWebsite.Api.Services;

public class R2Options
{
    public const string SectionName = "R2";

    /// <summary>S3 API endpoint, e.g. https://ACCOUNTID.r2.cloudflarestorage.com</summary>
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string Bucket { get; set; } = string.Empty;

    /// <summary>Public CDN/custom-domain base URL used to build asset links.</summary>
    public string PublicBaseUrl { get; set; } = string.Empty;
}
