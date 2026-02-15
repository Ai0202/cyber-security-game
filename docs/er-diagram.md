# データモデル

## 概要

MVP段階ではデータベースを使用しない。すべてのデータはクライアントサイドの React Context / State で管理する。以下は将来のDB導入時に参考となるデータモデルの概要と、現在のクライアントサイドの型定義である。

## クライアントサイドの状態構造

```mermaid
classDiagram
    class GameState {
        currentStage: StageId | null
        scores: Map~StageId, StageResult~
        isOperationMode: boolean
    }

    class StageResult {
        stageId: StageId
        score: number
        rank: Rank
        breakdown: ScoreBreakdown[]
        learningPoints: string[]
        completedAt: Date
    }

    class ScoreBreakdown {
        category: string
        points: number
        maxPoints: number
        comment: string
    }

    class Scenario {
        stageId: StageId
        content: object
        generatedAt: Date
    }

    GameState --> StageResult
    StageResult --> ScoreBreakdown
    GameState --> Scenario
```

## 型定義（TypeScript）

```typescript
type StageId = 'shoulder-hacking' | 'password-cracking' | 'phishing' | 'ransomware';
type Rank = 'S' | 'A' | 'B' | 'C' | 'D';
type Difficulty = 'easy' | 'normal' | 'hard';

interface StageResult {
  stageId: StageId;
  score: number;        // 0-100
  rank: Rank;
  breakdown: ScoreBreakdown[];
  learningPoints: string[];
  completedAt: Date;
}

interface ScoreBreakdown {
  category: string;
  points: number;
  maxPoints: number;
  comment: string;
}
```

## 将来のDB導入時のER図

```mermaid
erDiagram
    USER ||--o{ GAME_SESSION : plays
    GAME_SESSION ||--|{ STAGE_RESULT : contains
    USER ||--o{ BADGE : earns

    USER {
        uuid id PK
        string nickname
        string email
        timestamp created_at
    }

    GAME_SESSION {
        uuid id PK
        uuid user_id FK
        boolean is_operation_mode
        int total_score
        timestamp started_at
        timestamp completed_at
    }

    STAGE_RESULT {
        uuid id PK
        uuid session_id FK
        string stage_id
        int score
        string rank
        json breakdown
        json learning_points
        timestamp completed_at
    }

    BADGE {
        uuid id PK
        uuid user_id FK
        string badge_type
        timestamp earned_at
    }
```
