variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "gemini_api_key" {
  description = "Google Gemini API key"
  type        = string
  sensitive   = true
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access to Cloud Run"
  type        = bool
  default     = true
}
