using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace PersonalWebsite.Api.Services;

/// <summary>
/// Uploads assets to Cloudflare R2 via the S3-compatible API.
/// Returns the public URL (served through PublicBaseUrl / CDN).
/// </summary>
public class R2StorageService
{
    private readonly R2Options _options;
    private readonly IAmazonS3? _client;

    public R2StorageService(IOptions<R2Options> options)
    {
        _options = options.Value;

        if (!string.IsNullOrWhiteSpace(_options.Endpoint) &&
            !string.IsNullOrWhiteSpace(_options.AccessKey))
        {
            var config = new AmazonS3Config
            {
                ServiceURL = _options.Endpoint,
                ForcePathStyle = true,
                // R2 ignores regions but the SDK requires one.
                AuthenticationRegion = "auto",
            };
            _client = new AmazonS3Client(_options.AccessKey, _options.SecretKey, config);
        }
    }

    public bool IsConfigured => _client is not null;

    public async Task<string> UploadAsync(Stream content, string fileName, string contentType, string prefix = "uploads")
    {
        if (_client is null)
            throw new InvalidOperationException("R2 storage is not configured. Set the R2 section in configuration.");

        var key = $"{prefix.Trim('/')}/{Guid.NewGuid():N}{Path.GetExtension(fileName)}";

        await _client.PutObjectAsync(new PutObjectRequest
        {
            BucketName = _options.Bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
            DisablePayloadSigning = true, // required for R2 streaming uploads
        });

        var baseUrl = _options.PublicBaseUrl.TrimEnd('/');
        return $"{baseUrl}/{key}";
    }
}
