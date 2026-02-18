# CyberGuardians

「攻撃者の目線で学ぶ、サイバーセキュリティ体験学習」をコンセプトとした体験型セキュリティ教育ゲーム。
一般の会社員・主婦・学生を対象に、攻撃者側を体験することで実践的なセキュリティリテラシーを身につけることを目的とする。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript 5.9 |
| UI | React 19 + Tailwind CSS v4 |
| アニメーション | Framer Motion |
| AI | Google Gemini API (`@google/generative-ai`) |
| バリデーション | Zod |
| デプロイ | Google Cloud Run (Docker) |

## セットアップ

### 前提条件

- Node.js 20+
- npm
- Google Gemini API キー

### インストール

```bash
npm install
```

### 環境変数

`.env.local` を作成し、以下を設定:

```
GEMINI_API_KEY=your_gemini_api_key
```

### 開発サーバー起動

```bash
npm run dev
```

`http://localhost:3000` でプレイできます。

### ビルド

```bash
npm run build
npm start
```

## ゲーム構造

ゲームは「ストーリー → フェーズ → コンポーネント」の3層構造:

```
ストーリー（攻撃テーマ）
  └── フェーズ 1: RECONNAISSANCE（情報収集）
  │     └── コンポーネント（例: SNS偵察、ダンプスターダイビング）
  └── フェーズ 2: INITIAL ACCESS（認証窃取）
  │     └── コンポーネント（例: フィッシング、ショルダーサーフィン）
  └── フェーズ 3: LATERAL MOVEMENT（横展開）
  │     └── コンポーネント（例: 権限昇格、ラテラルムーブメント）
  └── フェーズ 4: ACTIONS ON OBJECTIVES（目的達成）
        └── コンポーネント（例: ランサムウェア、データ窃取）
```

各フェーズで1つのコンポーネントがランダムに選ばれ、前フェーズの成果が次フェーズに引き継がれる。

## ゲームモード

- **ストーリーモード**: 事前定義されたストーリーを選び、4フェーズの攻撃チェーンをプレイ
- **ランダムミッション**: コンポーネントをランダムに組み合わせ、Gemini API がストーリーを動的生成
- **練習モード**: コンポーネント単体でプレイ可能

## 実装済みコンポーネント（全19種）

### Phase 1: RECONNAISSANCE（5種）
| ID | コンポーネント | 概要 |
|----|--------------|------|
| recon_01 | SNS偵察 | SNSプロフィールから個人情報を収集 |
| recon_02 | ダンプスターダイビング | 廃棄書類から有用な情報を探索 |
| recon_03 | 漏洩クレデンシャル検索 | 過去の情報漏洩からの認証情報を発見 |
| recon_04 | 企業Webサイト偵察 | 公開情報・求人情報から情報収集 |
| recon_05 | プリテキスティングコール | 電話でのソーシャルエンジニアリング |

### Phase 2: INITIAL ACCESS（6種）
| ID | コンポーネント | 概要 |
|----|--------------|------|
| access_01 | フィッシングメール | 説得力のあるフィッシングメールを作成 |
| access_02 | スミッシング | 偽SMS送信で認証情報を窃取 |
| access_03 | ショルダーサーフィン | 画面を覗き見てパスワードを盗む |
| access_04 | Evil Twin WiFi | 偽Wi-Fiホットスポットで通信傍受 |
| access_05 | クレデンシャルスタッフィング | 漏洩情報を使ったパスワード総当たり |
| access_06 | マルウェア添付 | 偽装したマルウェアファイルを送信 |

### Phase 3: LATERAL MOVEMENT（4種）
| ID | コンポーネント | 概要 |
|----|--------------|------|
| lateral_01 | 権限昇格 | 脆弱性を悪用して管理者権限を取得 |
| lateral_02 | ラテラルムーブメント | 侵害端末から他システムへ横展開 |
| lateral_03 | メールアカウント侵害 | メールアカウントを乗っ取り内部情報を収集 |
| lateral_04 | データ探索 | ファイルサーバー・DBから機密データを発見 |

### Phase 4: ACTIONS ON OBJECTIVES（4種）
| ID | コンポーネント | 概要 |
|----|--------------|------|
| objective_01 | ランサムウェア暗号化 | ファイルを暗号化し身代金を要求 |
| objective_02 | データ窃取 | 機密データを外部サーバーに持ち出し |
| objective_03 | BEC（ビジネスメール詐欺） | CEO偽装メールで送金指示 |
| objective_04 | 二重脅迫 | 暗号化＋データ公開の脅迫 |

## スコアリング

各コンポーネントで 0〜100 点を獲得。ランク判定:

| ランク | スコア |
|-------|--------|
| S | 90 - 100 |
| A | 70 - 89 |
| B | 50 - 69 |
| C | 30 - 49 |
| D | 0 - 29 |

## プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── api/game/           # Gemini API ルート
│   ├── story/[storyId]/    # ストーリー詳細・プレイ画面
│   ├── play/random/        # ランダムミッション
│   ├── component/          # 練習モード
│   └── result/             # 結果画面
├── components/
│   ├── game/components/    # 19種のゲームコンポーネント
│   ├── result/             # 結果表示コンポーネント
│   ├── story/              # ストーリー選択
│   └── ui/                 # 共通UIコンポーネント
├── contexts/               # React Context（ゲーム状態管理）
├── data/                   # JSON定義ファイル
├── lib/
│   ├── prompts/            # Gemini APIプロンプト
│   ├── gemini.ts           # Gemini APIクライアント
│   └── component-registry.ts
└── types/                  # TypeScript型定義
```

## デプロイ

Docker でビルドし、Google Cloud Run にデプロイ:

```bash
docker build -t cyber-security-game .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key cyber-security-game
```

## ドキュメント

- [docs/overview.md](docs/overview.md) - システム概要
- [docs/features.md](docs/features.md) - 機能一覧・ゲーム仕様
- [docs/architecture.md](docs/architecture.md) - アーキテクチャ
- [docs/er-diagram.md](docs/er-diagram.md) - データモデル
- [docs/openapi.yaml](docs/openapi.yaml) - API仕様

## ライセンス

Private
