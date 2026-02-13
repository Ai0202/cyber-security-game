# CyberGuardians

サイバーセキュリティ体験学習ゲーム (React + Vite + FastAPI)

## Setup

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## Running the App

### 1. Start Backend (FastAPI)

```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

### 2. Start Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` to play!

## Features

- **Attack Side Experience**: 6 stages of cyber attack simulation
- **Interactive Demos**:
  - Shoulder Hacking (Find the leak points)
  - Password Cracking (Visualizing strength)
  - Ransomware Attack (Encryption/Restoration)
- **AI Integration** (Backend):
  - Dynamic Character Reactions
  - Social Engineering Chat
  - Phishing Email Evaluation
