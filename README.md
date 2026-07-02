# BideyaBoost v2

BideyaBoost v2 is a multi-service platform for student orientation, guidance, and AI-powered recommendations. It combines a Next.js frontend, a TypeScript backend with Prisma, and a Python FastAPI AI engine.

## Project structure

- frontend: Next.js application for the user-facing experience
- backend: Express + TypeScript API with Prisma and PostgreSQL
- ai-engine: FastAPI service for recommendations and predictions
- nginx: reverse proxy configuration

## Prerequisites

- Node.js 20+
- Python 3.10+
- Docker and Docker Compose
- PostgreSQL and Redis (or use Docker Compose)

## Environment setup

1. Copy the example environment file if needed:
   - frontend/.env.local (optional for frontend config)
   - backend/.env (optional for backend secrets)
2. Configure your database and API URLs before running the services.

## Run with Docker Compose

From the project root:

```bash
docker compose up --build
```

This starts:
- the frontend on http://localhost:3000
- the backend on http://localhost:3001
- the AI service on http://localhost:8000
- PostgreSQL on http://localhost:5432
- Redis on http://localhost:6379

## Run locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### AI engine

```bash
cd ai-engine
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Useful commands

### Backend

```bash
cd backend
npm run build
npm run db:push
npm run db:seed
```

### Frontend

```bash
cd frontend
npm run build
```

## Notes

- The backend uses Prisma. If you change the schema, run the database migration commands from the backend folder.
- The AI service relies on model assets under the ai-engine models directory.
- For production deployments, make sure secrets and credentials are configured securely.
