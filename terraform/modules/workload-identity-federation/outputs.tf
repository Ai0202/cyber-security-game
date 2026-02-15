output "workload_identity_provider" {
  description = "Workload Identity Provider resource name (for GitHub Secrets: GCP_WIF_PROVIDER)"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "service_account_email" {
  description = "Service Account email (for GitHub Secrets: GCP_SERVICE_ACCOUNT)"
  value       = google_service_account.github_actions.email
}

output "pool_name" {
  description = "Workload Identity Pool resource name"
  value       = google_iam_workload_identity_pool.github.name
}
