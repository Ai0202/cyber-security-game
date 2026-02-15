output "workload_identity_provider" {
  description = "Workload Identity Provider (GitHub Secret: GCP_WIF_PROVIDER)"
  value       = module.workload_identity_federation.workload_identity_provider
}

output "service_account_email" {
  description = "Service Account email (GitHub Secret: GCP_SERVICE_ACCOUNT)"
  value       = module.workload_identity_federation.service_account_email
}

output "github_secrets_summary" {
  description = "Summary of GitHub Secrets to configure"
  value       = <<-EOT
    ============================================
    GitHub Secrets Configuration
    ============================================

    Add the following secrets to your GitHub repository:
    Settings -> Secrets and variables -> Actions -> New repository secret

    GCP_PROJECT_ID:      ${var.project_id}
    GCP_WIF_PROVIDER:    ${module.workload_identity_federation.workload_identity_provider}
    GCP_SERVICE_ACCOUNT: ${module.workload_identity_federation.service_account_email}

    ============================================
  EOT
}
