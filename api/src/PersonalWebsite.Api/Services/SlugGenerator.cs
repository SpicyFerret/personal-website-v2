using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace PersonalWebsite.Api.Services;

public static partial class SlugGenerator
{
    public static string Generate(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return Guid.NewGuid().ToString("N")[..8];

        // Strip diacritics (e.g. "Procurações" -> "Procuracoes").
        var normalized = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder();
        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        var slug = sb.ToString().Normalize(NormalizationForm.FormC).ToLowerInvariant();
        slug = NonAlphanumeric().Replace(slug, "-").Trim('-');
        slug = MultiDash().Replace(slug, "-");
        return string.IsNullOrEmpty(slug) ? Guid.NewGuid().ToString("N")[..8] : slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphanumeric();

    [GeneratedRegex("-{2,}")]
    private static partial Regex MultiDash();
}
