variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "pool_id" {
  description = "Workload Identity Pool ID"
  type        = string
  default     = "github-pool"
}

variable "pool_display_name" {
  description = "Workload Identity Pool display name"
  type        = string
  default     = "GitHub Actions Pool"
}

variable "provider_id" {
  description = "Workload Identity Pool Provider ID"
  type        = string
  default     = "github-provider"
}

variable "github_repository" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
}

variable "service_account_id" {
  description = "Service Account ID"
  type        = string
  default     = "github-actions"
}

variable "service_account_roles" {
  description = "IAM roles to grant to the service account"
  type        = list(string)
  default = [
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser"
  ]
}
