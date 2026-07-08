output "tunnel_id" {
  value = cloudflare_zero_trust_tunnel_cloudflared.k3s.id
}

output "tunnel_token" {
  description = "GitHub secret CLOUDFLARE_TUNNEL_TOKEN — CI puts it in the cluster for cloudflared."
  value       = cloudflare_zero_trust_tunnel_cloudflared.k3s.tunnel_token
  sensitive   = true
}

output "cf_access_client_id" {
  description = "GitHub secret CF_ACCESS_CLIENT_ID."
  value       = cloudflare_zero_trust_access_service_token.ci.client_id
  sensitive   = true
}

output "cf_access_client_secret" {
  description = "GitHub secret CF_ACCESS_CLIENT_SECRET."
  value       = cloudflare_zero_trust_access_service_token.ci.client_secret
  sensitive   = true
}

output "k8s_api_hostname" {
  description = "GitHub variable K8S_API_HOSTNAME."
  value       = "${var.k8s_subdomain}.${var.domain}"
}

output "api_internal_url" {
  description = "GitHub variable API_INTERNAL_URL (Nitro /api proxy target)."
  value       = "https://${var.api_internal_subdomain}.${var.domain}"
}

output "r2_bucket" {
  description = "GitHub secret R2_BUCKET."
  value       = cloudflare_r2_bucket.assets.name
}

output "pages_project" {
  description = "GitHub variable CF_PAGES_PROJECT."
  value       = cloudflare_pages_project.site.name
}

output "site_url" {
  description = "Where the site is being served."
  value = var.site_domain != "" ? "https://${var.site_domain}" : "https://${cloudflare_pages_project.site.subdomain}"
}

output "r2_endpoint" {
  description = "GitHub secret R2_ENDPOINT (S3 API)."
  value       = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
}

output "next_steps" {
  value = <<-EOT
    1. Reveal secrets:  tofu output tunnel_token / cf_access_client_id / cf_access_client_secret
    2. Set them in GitHub → ${var.github_repo} → Settings → Secrets and variables → Actions
    3. R2 S3 keys are NOT created here — create an R2 API token in the dashboard
       (R2 → Manage R2 API Tokens) and set R2_ACCESS_KEY / R2_SECRET_KEY.
  EOT
}
