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
| Cloudflare infra | **OpenTofu** ([`infra/`](infra/)) | Tunnel + remote ingress rules, DNS CNAMEs, Zero Trust Access app + CI service token, R2 bucket. |
| Exposure  | **Cloudflare Zero Trust tunnel** | [`k8s/cloudflared.yaml`](k8s/cloudflared.yaml) runs the connector with the token from OpenTofu (CI creates the secret). |

### Provisioning (one-time)

```bash
# 1. Bootstrap k3s on the Pis (server = the Pi with the LARGER disk):
#    put "SSHPASS=<pi password>" in a pi.env file (never commit it), then:
docker run --rm --env-file pi.env -v "$PWD/scripts:/s" alpine:3.20 sh -c \
  "apk add -q openssh-client sshpass && SERVER_IP=<big-disk-pi> AGENT_IP=<other-pi> SSH_USER=zion sh /s/k3s-bootstrap.sh"
#    → prints the base64 KUBE_CONFIG for the GitHub secret at the end

# 2. Provision Cloudflare (tunnel, DNS, Access, R2) — runs IN CI, no local tofu needed:
#    a. Set the bootstrap secrets below (CLOUDFLARE_API_TOKEN, ..., GH_PAT)
#    b. Run the "Infra (OpenTofu)" workflow (or push a change under infra/)
#       → creates the tfstate bucket if missing, applies everything AND
#         auto-syncs the derived secrets/variables to the repo
```

(Prefer local? `cd infra && cp terraform.tfvars.example terraform.tfvars && tofu init -backend=false && tofu apply` still works.)

Everything is served from **one domain** — the Pages worker proxies `/api/**` to the API tunnel,
so there is no CORS:

```
Browser ─▶ neumannmarques.com (Cloudflare Pages / Analog SSR)
   ├─ /*        → SSR app
   └─ /api/**   → (Nitro proxy) ─▶ Cloudflare Tunnel ─▶ cloudflared (k3s) ─▶ api ─▶ Postgres
```

> **k3s reachability:** the `deploy` job reaches your private API server through the tunnel.
> OpenTofu routes `k8s.yourdomain.com → tcp://kubernetes.default.svc:443` (remote-managed ingress);
> CI runs `cloudflared access tcp` with a Zero Trust **service token** to bridge it to
> `127.0.0.1:6443`. So your stored `KUBE_CONFIG` must use (the bootstrap script emits exactly this):
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

**Set manually, once** (Settings → Secrets and variables → Actions → *Secrets*):

| Secret | Used by | Where it comes from |
|--------|---------|---------------------|
| `CLOUDFLARE_API_TOKEN` | infra + web | custom token — Account: Cloudflare Tunnel:Edit, Access: Apps and Policies:Edit, Access: Service Tokens:Edit, Workers R2 Storage:Edit, Cloudflare Pages:Edit · Zone: DNS:Edit (specific zone) |
| `CLOUDFLARE_ACCOUNT_ID` | infra + web | dashboard → zone overview, right sidebar |
| `CLOUDFLARE_ZONE_ID` | infra | dashboard → zone overview, right sidebar |
| `R2_ACCESS_KEY` / `R2_SECRET_KEY` | infra + api | dashboard → R2 → Manage R2 API Tokens (state backend + asset uploads) |
| `GH_PAT` | infra | fine-grained PAT on this repo with **Secrets: RW + Variables: RW** (lets the infra workflow sync outputs) |
| `KUBE_CONFIG` | api | printed (base64) at the end of `scripts/k3s-bootstrap.sh` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | api | you choose |
| `JWT_KEY` | api | any random string ≥ 32 chars |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | api | seeded admin login |
| `R2_PUBLIC_BASE_URL` | api | your assets custom domain (e.g. `https://assets.yourdomain.com`) |
| `GHCR_PULL_TOKEN` | api | *optional* — only if the GHCR package is private |

**Auto-managed by the [Infra workflow](.github/workflows/infra.yml)** — do not set by hand:

| Secret / Variable | Source |
|-------------------|--------|
| `CLOUDFLARE_TUNNEL_TOKEN` (secret) | `tofu output tunnel_token` |
| `CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET` (secrets) | Zero Trust service token |
| `R2_ENDPOINT` / `R2_BUCKET` (secrets) | R2 outputs |
| `K8S_API_HOSTNAME` / `API_INTERNAL_URL` / `CF_PAGES_PROJECT` (variables) | tunnel hostnames + Pages project (created by tofu; site served at `<project>.pages.dev` until you attach the custom domain) |

`GITHUB_TOKEN` (automatic) pushes images to GHCR — no secret needed. OpenTofu state lives in the
R2 bucket `personal-website-tfstate` — the infra workflow creates it automatically if missing
(name defined once, as `TF_STATE_BUCKET` in [`infra.yml`](.github/workflows/infra.yml)).

## TODO / next steps

- [ ] Drop a real CV at `web/public/Danilo_Marques_CV.pdf` (the Resume page links to it).
- [ ] Wire AWS SES email notification on contact submit (`ContactController` has the hook).
- [ ] Set real social handles in `web/src/app/core/config.ts`.
- [ ] Populate the bootstrap secrets above, then run the Infra workflow (Pages project + R2 buckets are created automatically).
- [ ] When ready to switch the domain: attach `neumannmarques.com` to the Pages project (dashboard or `cloudflare_pages_domain` in tofu).
