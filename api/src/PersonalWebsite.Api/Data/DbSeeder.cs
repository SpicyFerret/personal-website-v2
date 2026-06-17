using Microsoft.EntityFrameworkCore;
using PersonalWebsite.Api.Models;
using PersonalWebsite.Api.Services;

namespace PersonalWebsite.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, IConfiguration config)
    {
        await db.Database.MigrateAsync();

        // --- Admin user ---
        if (!await db.AdminUsers.AnyAsync())
        {
            var email = config["Admin:Email"] ?? "danilo@neumannmarques.com";
            var password = config["Admin:Password"] ?? "ChangeMe123!";
            db.AdminUsers.Add(new AdminUser
            {
                Email = email,
                DisplayName = "Danilo Marques",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            });
        }

        // --- Sample projects (from portfolio) ---
        if (!await db.Projects.AnyAsync())
        {
            db.Projects.AddRange(
                new Project
                {
                    Title = "Sistema de Gestão Institucional",
                    Slug = SlugGenerator.Generate("Sistema de Gestao Institucional"),
                    Summary = "Plataforma corporativa fullstack com OAuth 2.0 (Google) e múltiplos módulos sob uma única base Angular com lazy loading.",
                    Description = "Arquitetou e desenvolveu uma plataforma corporativa com módulos de Eventos Institucionais (integração bidirecional com a Google Agenda API), Procurações (fluxo de requisição/aprovação) e Ofícios (geração e numeração automática). Toda a solução containerizada com Docker.",
                    TechStack = ["NET", "Angular", "PostgreSQL", "Docker", "OAuth 2.0"],
                    IsFeatured = true,
                    SortOrder = 1,
                },
                new Project
                {
                    Title = "Sistema de Votações Personalizadas",
                    Slug = SlugGenerator.Generate("Sistema de Votacoes Personalizadas"),
                    Summary = "Votações totalmente customizáveis com anonimato garantido por design.",
                    Description = "Separação arquitetural entre identidade do votante e voto registrado, painel administrativo para configuração de enquetes, controle de elegibilidade e resultados em tempo real. Integridade garantida por regras de unicidade no ASP.NET Core + PostgreSQL.",
                    TechStack = ["NET", "Angular", "PostgreSQL", "Docker"],
                    IsFeatured = true,
                    SortOrder = 2,
                },
                new Project
                {
                    Title = "Sistema de Ponto de Venda (PDV)",
                    Slug = SlugGenerator.Generate("Sistema de Ponto de Venda PDV"),
                    Summary = "Aplicação de PDV com gestão de estoque integrada, construída do zero.",
                    Description = "Cadastro de produtos, controle de entradas/saídas, alertas de estoque mínimo, fluxo de vendas completo com cálculo de troco, descontos e impressão térmica. API REST em camadas (Controller/Service/Repository) com Clean Code.",
                    TechStack = ["NET", "Angular", "MySQL"],
                    IsFeatured = false,
                    SortOrder = 3,
                });
        }

        // --- Welcome blog post ---
        if (!await db.BlogPosts.AnyAsync())
        {
            var tag = new Tag { Name = "Hello", Slug = "hello" };
            db.BlogPosts.Add(new BlogPost
            {
                Title = "Welcome to my new site",
                Slug = "welcome-to-my-new-site",
                Excerpt = "A quick hello and what you'll find here.",
                Content = "# Hello 👋\n\nThis is the first post on my new Angular + .NET site. More soon!",
                IsPublished = true,
                PublishedAt = DateTimeOffset.UtcNow,
                Tags = [tag],
            });
        }

        await db.SaveChangesAsync();
    }
}
