variable "secret_names" {
  description = "List of secret names to create"
  type        = list(string)
}

variable "secret_values" {
  description = "Map of secret names to their values"
  type        = map(string)
  sensitive   = true
}

variable "labels" {
  description = "Labels to apply to secrets"
  type        = map(string)
  default     = {}
}
