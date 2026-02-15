variable "region" {
  description = "GCP region for the artifact registry"
  type        = string
}

variable "repository_id" {
  description = "Repository ID"
  type        = string
}

variable "description" {
  description = "Repository description"
  type        = string
  default     = ""
}

variable "labels" {
  description = "Labels to apply to the repository"
  type        = map(string)
  default     = {}
}
