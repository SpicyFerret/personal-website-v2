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

# ---------------------------------------------------------------------------
# R2 bucket for site assets
# ---------------------------------------------------------------------------

resource "cloudflare_r2_bucket" "assets" {
  account_id = var.cloudflare_account_id
  name       = var.r2_bucket_name
  location   = "ENAM" # East North America (closest region to Brazil this provider offers)
}
