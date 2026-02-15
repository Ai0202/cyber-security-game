# Cloud Run デプロイ設計

## 概要

Next.js フルスタックアプリを Google Cloud Run にデプロイするためのインフラ構成。Terraform でリソース管理し、GitHub Actions で CI/CD を実現する。

## 決定事項

- **デプロイ先**: Cloud Run (単一コンテナ)
- **コンテナ**: Next.js standalone ビルド (Node.js)
- **環境**: prod のみ
- **アクセス**: 公開 (認証なし)
- **IaC**: Terraform (モジュール構成)
- **CI/CD**: GitHub Actions + Workload Identity Federation

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│           Cloud Run (prod)              │
│  ┌───────────────────────────────────┐  │
│  │  Next.js standalone (Node.js)     │  │
│  │  Port: 3000                       │  │
│  │  CPU: 1, Memory: 512Mi           │  │
│  │  min: 0, max: 5                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         ↑
  Artifact Registry (Docker)
         ↑
  GitHub Actions (main push → deploy)
    認証: Workload Identity Federation
```

## Terraform 構成

```
terraform/
├── modules/                            # 再利用可能モジュール
│   ├── artifact-registry/              # Docker リポジトリ
│   ├── cloud-run/                      # Cloud Run サービス
│   ├── iam/                            # サービスアカウント + 権限
│   ├── secret-manager/                 # シークレット管理
│   └── workload-identity-federation/   # GitHub Actions 認証
└── environments/
    ├── shared/                         # WIF 設定 (初回のみ)
    └── prod/                           # 本番環境リソース
```

## シークレット

| シークレット名 | 用途 |
|--------------|------|
| `cyber-security-game-prod-gemini-api-key` | Google Gemini API キー |

## GitHub Actions ワークフロー

- **トリガー**: `main` ブランチへの push + `workflow_dispatch`
- **認証**: Workload Identity Federation (キーレス)
- **フロー**: checkout → GCP認証 → Docker build & push → Cloud Run deploy

## Dockerfile 設計

マルチステージビルド:
1. **deps**: 依存関係インストール
2. **builder**: Next.js standalone ビルド
3. **runner**: 軽量 Node.js イメージで実行

## 参考プロジェクトとの差分

| 項目 | 参考 (aiChatBotSample) | 本プロジェクト |
|------|----------------------|--------------|
| ランタイム | Python (FastAPI) | Node.js (Next.js) |
| ポート | 8000 | 3000 |
| シークレット | DB, OpenAI, Slack, Google | Gemini API Key のみ |
| 環境 | dev + prod | prod のみ |
| CPU/Memory | 2/1Gi (prod) | 1/512Mi |
