output "cloud_run_url" {
  description = "The URL of the Cloud Run service"
  value       = module.cloud_run.service_url
}

output "artifact_registry_url" {
  description = "The Artifact Registry repository URL"
  value       = module.artifact_registry.repository_url
}

output "service_account_email" {
  description = "The service account email"
  value       = module.iam.service_account_email
}
