namespace PersonalWebsite.Api.Models;

public class Tag
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;

    public ICollection<BlogPost> Posts { get; set; } = new List<BlogPost>();
}
