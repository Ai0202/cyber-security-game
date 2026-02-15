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
    prefix = "prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  environment = "prod"
  labels = {
    environment = local.environment
    managed_by  = "terraform"
    project     = "cyber-security-game"
  }
}

module "artifact_registry" {
  source        = "../../modules/artifact-registry"
  region        = var.region
  repository_id = "cyber-security-game-${local.environment}"
  description   = "Docker repository for Cyber Security Game (${local.environment})"
  labels        = local.labels
}

locals {
  secret_names = [
    "cyber-security-game-${local.environment}-gemini-api-key",
  ]
}

module "secrets" {
  source       = "../../modules/secret-manager"
  secret_names = local.secret_names
  secret_values = {
    "cyber-security-game-${local.environment}-gemini-api-key" = var.gemini_api_key
  }
  labels = local.labels
}

module "iam" {
  source                       = "../../modules/iam"
  project_id                   = var.project_id
  service_account_id           = "cyber-security-game-${local.environment}"
  service_account_display_name = "Cyber Security Game Service Account (${local.environment})"
  service_account_description  = "Service account for Cyber Security Game Cloud Run service"
  allow_unauthenticated        = var.allow_unauthenticated
  secret_names                 = local.secret_names
  depends_on                   = [module.secrets]
}

module "cloud_run" {
  source                = "../../modules/cloud-run"
  service_name          = "cyber-security-game-${local.environment}"
  region                = var.region
  image                 = "${module.artifact_registry.repository_url}/app:latest"
  service_account_email = module.iam.service_account_email
  container_port        = 3000
  cpu                   = "1"
  memory                = "512Mi"
  min_instances         = 0
  max_instances         = 5
  allow_unauthenticated = var.allow_unauthenticated
  labels                = local.labels

  env_vars = {
    ENVIRONMENT = local.environment
    NODE_ENV    = "production"
    HOSTNAME    = "0.0.0.0"
  }

  secret_env_vars = {
    GEMINI_API_KEY = {
      secret_id = module.secrets.secret_ids["cyber-security-game-${local.environment}-gemini-api-key"]
      version   = "latest"
    }
  }
}
