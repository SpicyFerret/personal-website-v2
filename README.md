# personal-website-v2

Danilo Marques' personal website — a fullstack app showcasing the .NET + Angular stack.

| Layer | Tech |
|-------|------|
| Frontend | **Analog.js** (Angular 22) · Angular Material · SSR/SSG · Vite |
| Backend | **ASP.NET Core 10** Web API · EF Core 10 · JWT auth |
| Database | **PostgreSQL 17** (Docker) |
| Assets | **Cloudflare R2** via the S3 API (`AWSSDK.S3`) |
| Dev infra | Docker Compose (Postgres + Adminer) |

## Structure

```
.
├── web/                      Analog.js frontend (public site + admin panel)
│   └── src/app/
│       ├── core/             config, models, API & auth services, interceptor, guard
│       ├── shared/           header, footer, markdown pipe
│       └── pages/            file-based routes (incl. admin/ CRUD + dynamic [slug]/[id])
├── api/                      ASP.NET Core solution
│   └── src/PersonalWebsite.Api/
│       ├── Models/           BlogPost, Tag, Project, ContactSubmission, AdminUser
│       ├── Data/             AppDbContext, migrations, seeder
│       ├── Dtos/ Services/ Controllers/
├── docker-compose.yml        Postgres + Adminer
└── global.json               pins .NET 10 SDK
```

## Prerequisites

- **.NET 10 SDK**
- **Node.js ≥ 22.12** (Vite 8 / Angular 22 requirement — Node 22.11 will not work)
- **Docker Desktop**

## Run it locally

```bash
# 1. Start Postgres (+ Adminer on http://localhost:8088)
docker compose up -d

# 2. Backend — migrates & seeds on startup, runs on http://localhost:5256
cd api/src/PersonalWebsite.Api
dotnet run
#    API docs (Scalar): http://localhost:5256/scalar/v1

# 3. Frontend — http://localhost:5173
cd web
npm install
npm run dev
```

### Admin

Seeded admin (change in `appsettings.json` → `Admin` section, or via env before first run):

- URL: `http://localhost:5173/admin/login`
- Email: `danilo@neumannmarques.com`
- Password: `ChangeMe123!`  ← **change this**

## Configuration & secrets

`api/src/PersonalWebsite.Api/appsettings.json` holds non-secret defaults. For real secrets use
[user-secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets) or environment variables:

```bash
cd api/src/PersonalWebsite.Api
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "<a long random string ≥ 32 chars>"
dotnet user-secrets set "Admin:Password" "<your password>"
# Cloudflare R2 (S3 API)
dotnet user-secrets set "R2:Endpoint" "https://<accountid>.r2.cloudflarestorage.com"
dotnet user-secrets set "R2:AccessKey" "<key>"
dotnet user-secrets set "R2:SecretKey" "<secret>"
dotnet user-secrets set "R2:Bucket" "<bucket>"
dotnet user-secrets set "R2:PublicBaseUrl" "https://assets.yourdomain.com"
```

Frontend API base URL override: set `VITE_API_URL` (defaults to `http://localhost:5256`).

## Run the whole stack in Docker

```bash
cp .env.example .env   # edit secrets
docker compose up --build
# ► same-origin app (recommended): http://localhost:8080   (Caddy proxy: /api → api, else → web)
# web (direct) → http://localhost:4000   api → http://localhost:5256   adminer → http://localhost:8088
```

Both [`api/Dockerfile`](api/Dockerfile) (cross-compiles to the target arch) and
[`web/Dockerfile`](web/Dockerfile) (Analog SSR node server) are wired into
[`docker-compose.yml`](docker-compose.yml). A [`Caddyfile`](Caddyfile) reverse proxy exposes a
single same-origin entrypoint on **:8080** that mirrors production (so you can test the
no-CORS `/api` path locally).

### Same-origin / no CORS

The frontend calls the API with **relative `/api/...` URLs**, so browser and API share one origin
and there's no CORS at all. `/api` is proxied to the backend:

| Where | Mechanism |
|-------|-----------|
| `npm run dev` | Vite dev-server proxy ([`web/vite.config.ts`](web/vite.config.ts) → `server.proxy`) |
| Docker compose | Caddy ([`Caddyfile`](Caddyfile)) on :8080 |
| Production | Nitro `routeRules` proxy in the Cloudflare Pages worker → API tunnel |

The proxy target is `API_PROXY_TARGET` (defaults to `http://localhost:5256`).

## Deployment

| Component | Target | How |
|-----------|--------|-----|
| Frontend  | **Cloudflare Pages** | [`.github/workflows/web.yml`](.github/workflows/web.yml) builds Analog with the `cloudflare-pages` Nitro preset and `wrangler pages deploy dist/analog`. |
| API + DB  | **k3s on Raspberry Pi 5 (arm64)** | [`.github/workflows/api.yml`](.github/workflows/api.yml) builds a `linux/arm64` image → GHCR, then `kubectl apply` the [`k8s/`](k8s/) manifests and injects secrets. |
| Exposure  | **Cloudflare Zero Trust tunnel** | [`k8s/cloudflared.yaml`](k8s/cloudflared.yaml) runs `cloudflared` in-cluster; route `api-internal.yourdomain.com → http://api:80`. |

Everything is served from **one domain** — the Pages worker proxies `/api/**` to the API tunnel,
so there is no CORS:

```
Browser ─▶ neumannmarques.com (Cloudflare Pages / Analog SSR)
   ├─ /*        → SSR app
   └─ /api/**   → (Nitro proxy) ─▶ Cloudflare Tunnel ─▶ cloudflared (k3s) ─▶ api ─▶ Postgres
```

> **k3s reachability:** the `deploy` job reaches your private API server through the tunnel.
> [`k8s/cloudflared.yaml`](k8s/cloudflared.yaml) routes `k8s.yourdomain.com → tcp://kubernetes.default.svc:443`;
> CI runs `cloudflared access tcp` with a Zero Trust **service token** to bridge it to
> `127.0.0.1:6443`. So your stored `KUBE_CONFIG` must use:
> ```yaml
> clusters:
>   - cluster:
>       server: https://127.0.0.1:6443
>       tls-server-name: kubernetes.default.svc   # cert SAN; avoids an insecure flag
>       certificate-authority-data: <k3s CA>
> ```
> (Alternative: a **self-hosted runner** on a Pi — `runs-on: [self-hosted, k3s]` — then drop the
> cloudflared steps in `api.yml` and use the node's local kubeconfig.)

### GitHub repo secrets & variables

**Secrets** (Settings → Secrets and variables → Actions → *Secrets*):

| Secret | Used by | Notes |
|--------|---------|-------|
| `KUBE_CONFIG` | api | base64 kubeconfig pointing at `https://127.0.0.1:6443` (`base64 -w0 config`) |
| `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` | api | Zero Trust **service token** for the `k8s.yourdomain.com` Access app |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | api | DB credentials (also build the connection string) |
| `JWT_KEY` | api | ≥ 32 chars |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | api | seeded admin login |
| `R2_ENDPOINT` / `R2_ACCESS_KEY` / `R2_SECRET_KEY` / `R2_BUCKET` / `R2_PUBLIC_BASE_URL` | api | Cloudflare R2 |
| `GHCR_PULL_TOKEN` | api | *optional* — only if the GHCR package is private |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | web | Cloudflare Pages deploy |

**Variables** (same screen → *Variables*):

| Variable | Used by | Example |
|----------|---------|---------|
| `K8S_API_HOSTNAME` | api | `k8s.yourdomain.com` (the tunnel hostname for the k3s API) |
| `API_INTERNAL_URL` | web | `https://api-internal.yourdomain.com` (proxy target for `/api/**`) |
| `CF_PAGES_PROJECT` | web | your Cloudflare Pages project name |

`GITHUB_TOKEN` (automatic) pushes images to GHCR — no secret needed.

## TODO / next steps

- [ ] Drop a real CV at `web/public/Danilo_Marques_CV.pdf` (the Resume page links to it).
- [ ] Wire AWS SES email notification on contact submit (`ContactController` has the hook).
- [ ] Set real social handles in `web/src/app/core/config.ts`.
- [ ] Create the Cloudflare Pages project + R2 bucket and populate the secrets above.
