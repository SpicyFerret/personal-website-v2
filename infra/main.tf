# ---------------------------------------------------------------------------
# Cloudflare Tunnel (remotely managed — ingress rules live here, in git)
# ---------------------------------------------------------------------------

resource "random_id" "tunnel_secret" {
  byte_length = 32
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "k3s" {
  account_id = var.cloudflare_account_id
  name       = "personal-website-k3s"
  secret     = random_id.tunnel_secret.b64_std
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "k3s" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.k3s.id

  config {
    # API origin — only the Cloudflare Pages worker proxies to this hostname.
    ingress_rule {
      hostname = "${var.api_internal_subdomain}.${var.domain}"
      service  = "http://api.personal-website.svc.cluster.local:80"
    }

    # k3s API server as raw TCP — kubectl keeps end-to-end TLS.
    # CI bridges it locally: cloudflared access tcp --hostname k8s.<domain> --url 127.0.0.1:6443
    ingress_rule {
      hostname = "${var.k8s_subdomain}.${var.domain}"
      service  = "tcp://kubernetes.default.svc:443"
    }

    # Observability UIs (Observability repo) — behind Zero Trust Access below.
    ingress_rule {
      hostname = "grafana.${var.domain}"
      service  = "http://kps-grafana.observability.svc.cluster.local:80"
    }
    ingress_rule {
      hostname = "portainer.${var.domain}"
      service  = "http://portainer.observability.svc.cluster.local:9000"
    }
    ingress_rule {
      hostname = "prometheus.${var.domain}"
      service  = "http://kps-prometheus.observability.svc.cluster.local:9090"
    }

    # Catch-all (required last rule)
    ingress_rule {
      service = "http_status:404"
    }
  }
}

# ---------------------------------------------------------------------------
# DNS — proxied CNAMEs pointing at the tunnel
# ---------------------------------------------------------------------------

resource "cloudflare_record" "api_internal" {
  zone_id = var.cloudflare_zone_id
  name    = var.api_internal_subdomain
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.k3s.id}.cfargotunnel.com"
  proxied = true
}

resource "cloudflare_record" "k8s" {
  zone_id = var.cloudflare_zone_id
  name    = var.k8s_subdomain
  type    = "CNAME"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.k3s.id}.cfargotunnel.com"
  proxied = true
}

resource "cloudflare_record" "observability" {
  for_each = toset(["grafana", "portainer", "prometheus"])
  zone_id  = var.cloudflare_zone_id
  name     = each.key
  type     = "CNAME"
  content  = "${cloudflare_zero_trust_tunnel_cloudflared.k3s.id}.cfargotunnel.com"
  proxied  = true
}

# ---------------------------------------------------------------------------
# Zero Trust Access — lock the k3s API hostname behind a service token
# ---------------------------------------------------------------------------

resource "cloudflare_zero_trust_access_service_token" "ci" {
  account_id = var.cloudflare_account_id
  name       = "github-actions-k3s-deploy"
}

resource "cloudflare_zero_trust_access_application" "k8s" {
  account_id                = var.cloudflare_account_id
  name                      = "k3s API server"
  domain                    = "${var.k8s_subdomain}.${var.domain}"
  type                      = "self_hosted"
  session_duration          = "24h"
  auto_redirect_to_identity = false
}

resource "cloudflare_zero_trust_access_policy" "k8s_ci" {
  application_id = cloudflare_zero_trust_access_application.k8s.id
  account_id     = var.cloudflare_account_id
  name           = "CI service token"
  precedence     = 1
  decision       = "non_identity" # the decision type for service tokens

  include {
    service_token = [cloudflare_zero_trust_access_service_token.ci.id]
  }
}

# Admin UIs (Grafana/Portainer): email one-time-PIN gate before the apps' own logins.
resource "cloudflare_zero_trust_access_application" "observability" {
  for_each         = toset(["grafana", "portainer", "prometheus"])
  account_id       = var.cloudflare_account_id
  name             = each.key
  domain           = "${each.key}.${var.domain}"
  type             = "self_hosted"
  session_duration = "168h" # 7 days between OTP prompts
}

resource "cloudflare_zero_trust_access_policy" "observability_admin" {
  for_each       = cloudflare_zero_trust_access_application.observability
  application_id = each.value.id
  account_id     = var.cloudflare_account_id
  name           = "admin emails"
  precedence     = 1
  decision       = "allow"

  include {
    email = var.admin_emails
  }
}

# ---------------------------------------------------------------------------
# R2 bucket for site assets
# ---------------------------------------------------------------------------

resource "cloudflare_r2_bucket" "assets" {
  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
  location   = "ENAM" # East North America (closest region to Brazil this provider offers)
}

# ---------------------------------------------------------------------------
# Cloudflare Pages project (direct-upload; web.yml deploys with wrangler)
# ---------------------------------------------------------------------------

resource "cloudflare_pages_project" "site" {
  account_id        = var.cloudflare_account_id
  name              = var.pages_project_name
  production_branch = "main"
}

# Custom domain — only when var.site_domain (repo variable SITE_DOMAIN) is set.
# While empty, existing DNS (e.g. the old hosting on the apex) stays untouched
# and the site is served from <project>.pages.dev.
resource "cloudflare_pages_domain" "site" {
  count        = var.site_domain != "" ? 1 : 0
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.site.name
  domain       = var.site_domain
}

resource "cloudflare_record" "site" {
  count   = var.site_domain != "" ? 1 : 0
  zone_id = var.cloudflare_zone_id
  name    = var.site_domain
  type    = "CNAME"
  content = cloudflare_pages_project.site.subdomain # e.g. personal-website-ei1.pages.dev
  proxied = true
}
