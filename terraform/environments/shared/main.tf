terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "cyber-security-game-terraform-state"
    prefix = "shared"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

module "workload_identity_federation" {
  source            = "../../modules/workload-identity-federation"
  project_id        = var.project_id
  github_repository = var.github_repository
  pool_id           = var.pool_id
}
