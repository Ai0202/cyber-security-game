variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "service_account_id" {
  description = "Service account ID"
  type        = string
}

variable "service_account_display_name" {
  description = "Service account display name"
  type        = string
}

variable "service_account_description" {
  description = "Service account description"
  type        = string
  default     = ""
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access to Cloud Run"
  type        = bool
  default     = false
}

variable "secret_names" {
  description = "List of Secret Manager secret names to grant access to"
  type        = list(string)
  default     = []
}
