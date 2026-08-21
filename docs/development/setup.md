# ResearchOS Local Development & Setup

## Prerequisites
- Node.js 20+ & npm
- Python 3.11+ (for FastAPI backend)
- Docker & Docker Compose
- PostgreSQL 15+

## Development Options

### Option 1: Docker Compose (Full Stack)
```bash
docker compose up -d
```
Services started:
- PostgreSQL on `localhost:5432`
- FastAPI Backend on `http://localhost:8000`
- React Vite Frontend on `http://localhost:3000`

### Option 2: Standalone Local Setup

#### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### Frontend:
```bash
npm install
npm run dev
```
