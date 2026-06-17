using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Models;

namespace PersonalWebsite.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ContactSubmission> ContactSubmissions => Set<ContactSubmission>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BlogPost>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.Title).HasMaxLength(200);
            e.Property(p => p.Slug).HasMaxLength(200);
            e.Property(p => p.Excerpt).HasMaxLength(500);
            e.HasMany(p => p.Tags)
                .WithMany(t => t.Posts)
                .UsingEntity(j => j.ToTable("BlogPostTags"));
        });

        modelBuilder.Entity<Tag>(e =>
        {
            e.HasIndex(t => t.Slug).IsUnique();
            e.Property(t => t.Name).HasMaxLength(60);
            e.Property(t => t.Slug).HasMaxLength(60);
        });

        modelBuilder.Entity<Project>(e =>
        {
            e.HasIndex(p => p.Slug).IsUnique();
            e.Property(p => p.Title).HasMaxLength(200);
            e.Property(p => p.Slug).HasMaxLength(200);
            e.Property(p => p.Summary).HasMaxLength(500);
        });

        modelBuilder.Entity<ContactSubmission>(e =>
        {
            e.Property(c => c.Name).HasMaxLength(120);
            e.Property(c => c.Email).HasMaxLength(200);
            e.Property(c => c.Subject).HasMaxLength(200);
        });

        modelBuilder.Entity<AdminUser>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(200);
        });
    }
}
