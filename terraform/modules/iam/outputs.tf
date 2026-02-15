output "service_account_email" {
  description = "The email of the service account"
  value       = google_service_account.cloud_run.email
}

output "service_account_id" {
  description = "The ID of the service account"
  value       = google_service_account.cloud_run.id
}
