# Cloud Run デプロイ実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Next.js アプリを Cloud Run にデプロイするための Terraform インフラコード、Dockerfile、GitHub Actions ワークフローを作成する

**Architecture:** Terraform モジュール構成で GCP リソース (Artifact Registry, Cloud Run, IAM, Secret Manager, Workload Identity Federation) を管理。GitHub Actions が main ブランチ push 時に Docker イメージをビルドし Cloud Run にデプロイ。

**Tech Stack:** Terraform, Google Cloud Run, Artifact Registry, Secret Manager, Workload Identity Federation, GitHub Actions, Docker (multi-stage build)

---

## Task 1: Terraform モジュール - Artifact Registry

**Files:**
- Create: `terraform/modules/artifact-registry/main.tf`
- Create: `terraform/modules/artifact-registry/variables.tf`
- Create: `terraform/modules/artifact-registry/outputs.tf`

**Step 1: main.tf を作成**

```hcl
resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = var.repository_id
  description   = var.description
  format        = "DOCKER"

  labels = var.labels
}
```

**Step 2: variables.tf を作成**

```hcl
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
```

**Step 3: outputs.tf を作成**

```hcl
output "repository_id" {
  description = "The repository ID"
  value       = google_artifact_registry_repository.main.repository_id
}

output "repository_url" {
  description = "The repository URL for Docker images"
  value       = "${var.region}-docker.pkg.dev/${google_artifact_registry_repository.main.project}/${google_artifact_registry_repository.main.repository_id}"
}
```

---

## Task 2: Terraform モジュール - Cloud Run

**Files:**
- Create: `terraform/modules/cloud-run/main.tf`
- Create: `terraform/modules/cloud-run/variables.tf`
- Create: `terraform/modules/cloud-run/outputs.tf`

**Step 1: main.tf を作成**

```hcl
resource "google_cloud_run_v2_service" "main" {
  name     = var.service_name
  location = var.region

  template {
    service_account = var.service_account_email

    containers {
      image = var.image

      ports {
        container_port = var.container_port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = var.secret_env_vars
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value.secret_id
              version = env.value.version
            }
          }
        }
      }
    }

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  labels = var.labels
}

resource "google_cloud_run_v2_service_iam_member" "invoker" {
  count = var.allow_unauthenticated ? 1 : 0

  project  = google_cloud_run_v2_service.main.project
  location = google_cloud_run_v2_service.main.location
  name     = google_cloud_run_v2_service.main.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
```

**Step 2: variables.tf を作成**

```hcl
variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "image" {
  description = "Container image to deploy"
  type        = string
}

variable "service_account_email" {
  description = "Service account email for the Cloud Run service"
  type        = string
}

variable "container_port" {
  description = "Container port"
  type        = number
  default     = 3000
}

variable "cpu" {
  description = "CPU limit"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory limit"
  type        = string
  default     = "512Mi"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "env_vars" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "secret_env_vars" {
  description = "Secret environment variables from Secret Manager"
  type = map(object({
    secret_id = string
    version   = string
  }))
  default = {}
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access"
  type        = bool
  default     = false
}

variable "labels" {
  description = "Labels to apply to the service"
  type        = map(string)
  default     = {}
}
```

**Step 3: outputs.tf を作成**

```hcl
output "service_url" {
  description = "The URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.main.uri
}

output "service_name" {
  description = "The name of the Cloud Run service"
  value       = google_cloud_run_v2_service.main.name
}

output "service_id" {
  description = "The ID of the Cloud Run service"
  value       = google_cloud_run_v2_service.main.id
}
```

---

## Task 3: Terraform モジュール - IAM

**Files:**
- Create: `terraform/modules/iam/main.tf`
- Create: `terraform/modules/iam/variables.tf`
- Create: `terraform/modules/iam/outputs.tf`

**Step 1: main.tf を作成**

```hcl
resource "google_service_account" "cloud_run" {
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
  description  = var.service_account_description
}

resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  for_each = toset(var.secret_names)

  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run.email}"
}

resource "google_project_iam_member" "artifact_registry_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}
```

**Step 2: variables.tf を作成**

```hcl
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
```

**Step 3: outputs.tf を作成**

```hcl
output "service_account_email" {
  description = "The email of the service account"
  value       = google_service_account.cloud_run.email
}

output "service_account_id" {
  description = "The ID of the service account"
  value       = google_service_account.cloud_run.id
}
```

---

## Task 4: Terraform モジュール - Secret Manager

**Files:**
- Create: `terraform/modules/secret-manager/main.tf`
- Create: `terraform/modules/secret-manager/variables.tf`
- Create: `terraform/modules/secret-manager/outputs.tf`

**Step 1: main.tf を作成**

```hcl
resource "google_secret_manager_secret" "secrets" {
  for_each = toset(var.secret_names)

  secret_id = each.value

  replication {
    auto {}
  }

  labels = var.labels
}

resource "google_secret_manager_secret_version" "versions" {
  for_each = toset(var.secret_names)

  secret      = google_secret_manager_secret.secrets[each.value].id
  secret_data = var.secret_values[each.value]
}
```

**Step 2: variables.tf を作成**

```hcl
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
```

**Step 3: outputs.tf を作成**

```hcl
output "secret_ids" {
  description = "Map of secret names to their resource IDs"
  value       = { for k, v in google_secret_manager_secret.secrets : k => v.id }
}

output "secret_names" {
  description = "Map of secret names to their full resource names"
  value       = { for k, v in google_secret_manager_secret.secrets : k => v.name }
}
```

---

## Task 5: Terraform モジュール - Workload Identity Federation

**Files:**
- Create: `terraform/modules/workload-identity-federation/main.tf`
- Create: `terraform/modules/workload-identity-federation/variables.tf`
- Create: `terraform/modules/workload-identity-federation/outputs.tf`

**Step 1: main.tf を作成**

```hcl
resource "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = var.pool_id
  display_name              = var.pool_display_name
  description               = "Workload Identity Pool for GitHub Actions"
  project                   = var.project_id
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = var.provider_id
  display_name                       = "GitHub Provider"
  project                            = var.project_id

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.repository" = "assertion.repository"
    "attribute.actor"      = "assertion.actor"
    "attribute.ref"        = "assertion.ref"
  }

  attribute_condition = "assertion.repository == '${var.github_repository}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "github_actions" {
  account_id   = var.service_account_id
  display_name = "GitHub Actions Service Account"
  description  = "Service account for GitHub Actions CI/CD"
  project      = var.project_id
}

resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset(var.service_account_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_service_account_iam_member" "workload_identity_user" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repository}"
}
```

**Step 2: variables.tf を作成**

```hcl
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
```

**Step 3: outputs.tf を作成**

```hcl
output "workload_identity_provider" {
  description = "Workload Identity Provider resource name (for GitHub Secrets: GCP_WIF_PROVIDER)"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "service_account_email" {
  description = "Service Account email (for GitHub Secrets: GCP_SERVICE_ACCOUNT)"
  value       = google_service_account.github_actions.email
}

output "pool_name" {
  description = "Workload Identity Pool resource name"
  value       = google_iam_workload_identity_pool.github.name
}
```

---

## Task 6: Terraform 環境 - shared (Workload Identity Federation)

**Files:**
- Create: `terraform/environments/shared/main.tf`
- Create: `terraform/environments/shared/variables.tf`
- Create: `terraform/environments/shared/outputs.tf`
- Create: `terraform/environments/shared/terraform.tfvars.example`

**Step 1: main.tf を作成**

```hcl
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
```

**Step 2: variables.tf を作成**

```hcl
variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "github_repository" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
}

variable "pool_id" {
  description = "Workload Identity Pool ID"
  type        = string
  default     = "github-pool"
}
```

**Step 3: outputs.tf を作成**

```hcl
output "workload_identity_provider" {
  description = "Workload Identity Provider (GitHub Secret: GCP_WIF_PROVIDER)"
  value       = module.workload_identity_federation.workload_identity_provider
}

output "service_account_email" {
  description = "Service Account email (GitHub Secret: GCP_SERVICE_ACCOUNT)"
  value       = module.workload_identity_federation.service_account_email
}

output "github_secrets_summary" {
  description = "Summary of GitHub Secrets to configure"
  value       = <<-EOT
    ============================================
    GitHub Secrets Configuration
    ============================================

    Add the following secrets to your GitHub repository:
    Settings -> Secrets and variables -> Actions -> New repository secret

    GCP_PROJECT_ID:      ${var.project_id}
    GCP_WIF_PROVIDER:    ${module.workload_identity_federation.workload_identity_provider}
    GCP_SERVICE_ACCOUNT: ${module.workload_identity_federation.service_account_email}

    ============================================
  EOT
}
```

**Step 4: terraform.tfvars.example を作成**

```hcl
project_id        = "your-gcp-project-id"
github_repository = "Ai0202/cyber-security-game"
```

---

## Task 7: Terraform 環境 - prod

**Files:**
- Create: `terraform/environments/prod/main.tf`
- Create: `terraform/environments/prod/variables.tf`
- Create: `terraform/environments/prod/outputs.tf`
- Create: `terraform/environments/prod/terraform.tfvars.example`

**Step 1: main.tf を作成**

```hcl
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
```

**Step 2: variables.tf を作成**

```hcl
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
```

**Step 3: outputs.tf を作成**

```hcl
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
```

**Step 4: terraform.tfvars.example を作成**

```hcl
project_id            = "your-gcp-project-id"
region                = "asia-northeast1"
gemini_api_key        = "your-gemini-api-key"
allow_unauthenticated = true
```

---

## Task 8: Dockerfile (Next.js standalone)

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`

**Step 1: Dockerfile を作成**

Next.js 公式推奨のマルチステージビルドを使用:

```dockerfile
FROM node:20-alpine AS base

# --- deps stage ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- build stage ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- runner stage ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Step 2: .dockerignore を作成**

```
.git
.gitignore
node_modules
.next
.env*
docs
backend
frontend
.venv
__pycache__
terraform
.github
.claude
README.md
*.md
```

---

## Task 9: GitHub Actions デプロイワークフロー

**Files:**
- Create: `.github/workflows/deploy.yml`

**Step 1: deploy.yml を作成**

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'
      - 'package-lock.json'
      - 'next.config.ts'
      - 'tailwind.config.ts'
      - 'tsconfig.json'
      - 'Dockerfile'
      - '.github/workflows/deploy.yml'
  workflow_dispatch:

env:
  REGION: asia-northeast1

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.GCP_WIF_PROVIDER }}
          service_account: ${{ secrets.GCP_SERVICE_ACCOUNT }}

      - uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker for Artifact Registry
        run: gcloud auth configure-docker ${REGION}-docker.pkg.dev --quiet

      - name: Build and push Docker image
        run: |
          IMAGE="${REGION}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cyber-security-game-prod/app"
          TAG="${{ github.sha }}"
          docker build --platform linux/amd64 -t ${IMAGE}:${TAG} -t ${IMAGE}:latest .
          docker push ${IMAGE}:${TAG}
          docker push ${IMAGE}:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy cyber-security-game-prod \
            --image=${REGION}-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cyber-security-game-prod/app:${{ github.sha }} \
            --region=${REGION} \
            --quiet

      - name: Show service URL
        run: |
          URL=$(gcloud run services describe cyber-security-game-prod \
            --region=${REGION} --format='value(status.url)')
          echo "::notice::Deployed to: ${URL}"
```

---

## Task 10: next.config.ts に standalone 出力を追加

**Files:**
- Modify: `next.config.ts` (作成済みの場合)

**Step 1: next.config.ts に output: 'standalone' を追加**

Cloud Run でデプロイするために必要な設定:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

> Note: Next.js プロジェクトのセットアップ (別の実装計画) が完了後にこのファイルが存在する前提。まだ存在しない場合はこのタスクはスキップし、Next.js セットアップ時に `output: "standalone"` を含めること。

---

## Task 11: .gitignore に Terraform 関連を追加

**Files:**
- Modify: `.gitignore`

**Step 1: .gitignore に追加**

```
# Terraform
*.tfstate
*.tfstate.*
.terraform/
*.tfvars
!*.tfvars.example
```

---

## Task 12: コミット

**Step 1: 全ファイルをコミット**

```bash
git add terraform/ Dockerfile .dockerignore .github/workflows/deploy.yml docs/plans/2026-02-15-cloud-run-deploy-design.md docs/plans/2026-02-15-cloud-run-deploy-implementation.md .gitignore
git commit -m "feat: add Cloud Run deployment infrastructure

- Terraform modules: artifact-registry, cloud-run, iam, secret-manager, workload-identity-federation
- Terraform environments: shared (WIF), prod (Cloud Run)
- Dockerfile: multi-stage build for Next.js standalone
- GitHub Actions: deploy workflow on main push
- Design and implementation plan docs"
```
