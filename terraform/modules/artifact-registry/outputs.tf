output "repository_id" {
  description = "The repository ID"
  value       = google_artifact_registry_repository.main.repository_id
}

output "repository_url" {
  description = "The repository URL for Docker images"
  value       = "${var.region}-docker.pkg.dev/${google_artifact_registry_repository.main.project}/${google_artifact_registry_repository.main.repository_id}"
}
