variable "cloudflare_api_token" {
  description = "Cloudflare API token. Needs: Account:Cloudflare Tunnel:Edit, Account:Access: Apps and Policies:Edit, Account:Workers R2 Storage:Edit, Zone:DNS:Edit (on the site zone)."
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID (dashboard → right sidebar on the zone overview)."
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Zone ID of the site domain (dashboard → zone overview, right sidebar). Avoids needing Zone:Read on the token."
  type        = string
}

variable "domain" {
  description = "The site's apex domain (must be a zone in this Cloudflare account)."
  type        = string
  default     = "neumannmarques.com"
}

variable "api_internal_subdomain" {
  description = "Subdomain for the API origin (only the Pages worker calls it)."
  type        = string
  default     = "api-internal"
}

variable "k8s_subdomain" {
  description = "Subdomain for the k3s API server (used by CI kubectl through the tunnel)."
  type        = string
  default     = "k8s"
}

variable "r2_bucket_name" {
  description = "R2 bucket for site assets."
  type        = string
  default     = "personal-website-assets"
}

variable "github_repo" {
  description = "OWNER/REPO of this repository (used only in output hints)."
  type        = string
  default     = "danilonm/personal-website-v2"
}
