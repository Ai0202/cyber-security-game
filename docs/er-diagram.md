# データモデル

## 概要

MVP段階ではデータベースを使用しない。ストーリーとコンポーネントの定義は `src/data/` のJSONファイルで管理し、ゲームの進行状態はクライアントサイドの React Context で管理する。以下は現在のクライアントサイドの型定義と、将来のDB導入時に参考となるデータモデルである。

## クライアントサイドの状態構造

```mermaid
classDiagram
    class GameSession {
        id: string
        storyId: string
        selectedComponents: string[]
        storyContext: StoryContext
        currentPhaseIndex: number
        phaseResults: PhaseResult[]
        status: string
        startedAt: Date
    }

    class StoryContext {
        industry: string
        targetOrg: string
        targetDescription: string
        objective: string
    }

    class PhaseResult {
        componentId: string
        phaseId: string
        score: number
        rank: Rank
        breakdown: ScoreBreakdown[]
        contextOutput: Record
        completedAt: Date
    }

    class ScoreBreakdown {
        category: string
        points: number
        maxPoints: number
        comment: string
    }

    GameSession --> StoryContext
    GameSession --> PhaseResult
    PhaseResult --> ScoreBreakdown
```

## データ定義（JSONファイル）

### stories.json

```mermaid
classDiagram
    class StoryDefinition {
        id: string
        title: string
        description: string
        difficulty: string
        context: StoryContext
        phases: PhaseDefinition[]
    }

    class StoryContext {
        industry: string
        targetOrg: string
        targetDescription: string
        objective: string
    }

    class PhaseDefinition {
        phaseId: string
        componentPool: string[]
        contextOverride: Record
    }

    StoryDefinition --> StoryContext
    StoryDefinition --> PhaseDefinition
```

### components.json

```mermaid
classDiagram
    class ComponentDefinition {
        id: string
        name: string
        displayName: string
        phaseId: string
        description: string
        difficulty: string
        estimatedMinutes: number
        learningPoints: string[]
    }
```

### phases.json

```mermaid
classDiagram
    class PhaseInfo {
        id: string
        name: string
        displayName: string
        description: string
        order: number
    }
```

## 型定義（TypeScript）

```typescript
// フェーズID
type PhaseId = 'recon' | 'credential' | 'intrusion' | 'objective';

// ランク
type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

// 難易度
type Difficulty = 'easy' | 'normal' | 'hard';

// ストーリー定義
interface StoryDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  context: StoryContext;
  phases: PhaseDefinition[];
}

interface StoryContext {
  industry: string;
  targetOrg: string;
  targetDescription: string;
  objective: string;
}

interface PhaseDefinition {
  phaseId: PhaseId;
  componentPool: string[];
  contextOverride?: Record<string, unknown>;
}

// コンポーネント定義
interface ComponentDefinition {
  id: string;
  name: string;
  displayName: string;
  phaseId: PhaseId;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  learningPoints: string[];
}

// セッション状態
interface GameSession {
  id: string;
  storyId: string;
  selectedComponents: string[];
  storyContext: StoryContext;
  currentPhaseIndex: number;
  phaseResults: PhaseResult[];
  status: 'in_progress' | 'completed';
  startedAt: Date;
}

interface PhaseResult {
  componentId: string;
  phaseId: PhaseId;
  score: number;
  rank: Rank;
  breakdown: ScoreBreakdown[];
  contextOutput: Record<string, unknown>;
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
    GAME_SESSION ||--|{ PHASE_RESULT : contains
    GAME_SESSION }o--|| STORY : uses
    STORY ||--|{ STORY_PHASE : defines
    STORY_PHASE }o--o{ COMPONENT : includes_in_pool
    PHASE_RESULT }o--|| COMPONENT : uses
    USER ||--o{ BADGE : earns

    USER {
        uuid id PK
        string nickname
        string email
        timestamp created_at
    }

    STORY {
        uuid id PK
        string slug UK
        string title
        string description
        string difficulty
        json context
        timestamp created_at
    }

    STORY_PHASE {
        uuid id PK
        uuid story_id FK
        string phase_id
        int order
        json context_override
    }

    STORY_PHASE_COMPONENT {
        uuid story_phase_id FK
        uuid component_id FK
    }

    COMPONENT {
        uuid id PK
        string slug UK
        string name
        string display_name
        string phase_id
        string description
        string difficulty
        int estimated_minutes
        json learning_points
        timestamp created_at
    }

    GAME_SESSION {
        uuid id PK
        uuid user_id FK
        uuid story_id FK
        json selected_components
        int current_phase_index
        string status
        int total_score
        timestamp started_at
        timestamp completed_at
    }

    PHASE_RESULT {
        uuid id PK
        uuid session_id FK
        uuid component_id FK
        string phase_id
        int score
        string rank
        json breakdown
        json context_output
        timestamp completed_at
    }

    BADGE {
        uuid id PK
        uuid user_id FK
        string badge_type
        timestamp earned_at
    }
```
