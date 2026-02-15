"""ランサムウェア攻撃チェーン シナリオデータ"""

TARGET_PROFILE = {
    "name": "田中太郎",
    "department": "経理部",
    "company": "サイバーコーポレーション",
    "sns_posts": [
        {
            "id": "post1",
            "type": "photo",
            "text": "愛犬ポチとお散歩🐕 今日も元気いっぱい！ #犬のいる生活",
            "clue": "pet_name",
            "clue_value": "pochi",
        },
        {
            "id": "post2",
            "type": "text",
            "text": "誕生日にケーキもらった🎂 もう40歳か〜早いなぁ。1985年生まれが信じられない",
            "clue": "birth_year",
            "clue_value": "1985",
        },
        {
            "id": "post3",
            "type": "photo",
            "text": "新しいオフィスに引っ越し完了！ホワイトボードに書いた目標達成するぞ💪",
            "clue": "office_hint",
            "clue_value": "whiteboard_url",
            "hidden_detail": "写真の背景のホワイトボードに 'mail.cyberco.jp' と書かれている",
        },
        {
            "id": "post4",
            "type": "text",
            "text": "パスワード変えろって言われたけど、覚えやすいのがいいんだよな〜",
            "clue": "password_habit",
            "clue_value": "easy_password",
        },
        {
            "id": "post5",
            "type": "text",
            "text": "今日は経理部の飲み会！上司の鈴木部長、いつも奢ってくれるんだよな〜",
            "clue": "boss_name",
            "clue_value": "suzuki",
        },
    ],
    "correct_passwords": ["pochi1985", "Pochi1985", "pochi85"],
    "email_domain": "cyberco.jp",
}

NETWORK_NODES = [
    {
        "id": "pc_tanaka",
        "name": "田中のPC",
        "type": "pc",
        "visible": True,
        "x": 1, "y": 1,
        "files": ["経費申請.xlsx", "議事録.docx"],
        "has_admin": False,
    },
    {
        "id": "file_server",
        "name": "ファイルサーバー",
        "type": "server",
        "visible": True,
        "x": 3, "y": 1,
        "files": ["顧客リスト.csv", "売上データ.xlsx", "社員名簿.xlsx"],
        "has_admin": False,
    },
    {
        "id": "mail_server",
        "name": "メールサーバー",
        "type": "server",
        "visible": True,
        "x": 2, "y": 0,
        "files": [],
        "has_admin": False,
    },
    {
        "id": "admin_pc",
        "name": "管理者端末",
        "type": "pc",
        "visible": False,
        "x": 4, "y": 2,
        "files": ["admin_password.txt", "network_config.yaml"],
        "has_admin": True,
        "discovery_hint": "田中のPCのログに 'maintenance@admin-pc' のSSH接続記録がある",
    },
    {
        "id": "backup_server",
        "name": "バックアップサーバー",
        "type": "backup",
        "visible": False,
        "x": 5, "y": 1,
        "files": ["backup_20240101.tar.gz", "backup_20240201.tar.gz"],
        "has_admin": False,
        "discovery_hint": "管理者端末の network_config.yaml にバックアップサーバーのIPが記載されている",
    },
    {
        "id": "firewall",
        "name": "ファイアウォール (マモル)",
        "type": "firewall",
        "visible": True,
        "x": 0, "y": 1,
        "files": [],
        "has_admin": False,
    },
]

PHASE_CONFIG = {
    "phase1": {
        "name": "偵察 & フィッシング",
        "description": "ターゲットのSNSを調査し、フィッシングメールを作成せよ",
        "stealth_penalty_per_retry": 5,
        "phishing_success_threshold": 60,
    },
    "phase2": {
        "name": "パスワード突破",
        "description": "収集した情報からパスワードを推理せよ",
        "max_attempts": 5,
        "stealth_penalty_per_attempt": 10,
    },
    "phase3": {
        "name": "社内ネットワーク侵入",
        "description": "ネットワークを探索し、管理者権限を奪取せよ",
        "detection_increase_per_action": 8,
        "detection_threshold": 100,
    },
    "phase4": {
        "name": "ランサムウェア展開",
        "description": "ファイルを暗号化し、身代金を要求せよ",
        "encryption_speed_slow": 3,
        "encryption_speed_fast": 1,
        "fast_detection_penalty": 20,
    },
}
