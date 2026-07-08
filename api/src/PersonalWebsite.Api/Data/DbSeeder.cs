using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Models;

namespace PersonalWebsite.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        await db.Database.MigrateAsync();

        // Only the admin user is seeded (required to log in). All site content —
        // projects, posts, resume, home copy — is managed from the admin panel.
        if (!await db.AdminUsers.AnyAsync())
        {
            var email = config["Admin:Email"] ?? "admin@example.com";
            var password = config["Admin:Password"] ?? "ChangeMe123!";
            db.AdminUsers.Add(new AdminUser
            {
                Email = email,
                DisplayName = config["Admin:DisplayName"] ?? "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            });
            await db.SaveChangesAsync();
        }
    }
}
