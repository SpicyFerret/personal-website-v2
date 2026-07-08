# Remote state in Cloudflare R2 (S3-compatible).
#
# The state bucket is auto-created by the infra workflow if missing (it can't be
# managed by tofu itself — chicken-and-egg). Its name lives in ONE place:
# TF_STATE_BUCKET in .github/workflows/infra.yml, passed via
#   tofu init -backend-config="bucket=$TF_STATE_BUCKET"
#
# Credentials/endpoint come from the environment (set by the infra workflow):
#   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY  → R2 API token keys
#   AWS_ENDPOINT_URL_S3                        → https://<account_id>.r2.cloudflarestorage.com
#
# For a local run instead:  tofu init -backend=false   (or export the same env vars)
terraform {
  backend "s3" {
    key    = "infra.tfstate"
    region = "auto"

    # R2 is not real AWS — skip everything AWS-specific.
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
    use_path_style              = true
  }
}
