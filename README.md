# PeachyTask

A full-stack task app built with FastAPI + MongoDB (backend) and Next.js + Tailwind (frontend). Auth uses JWT in HTTPOnly cookies.

## Prerequisites
- Python 3.11+ (Windows PowerShell examples below)
- Node.js 18+ and npm
- MongoDB Atlas connection string

## Environment Variables
Copy the example env and fill in values:

- Backend
  - Copy `backend/.env.example` to `backend/.env`
  - Set: `MONGO_URI`, `MONGO_DB_NAME_DEV`, `MONGO_DB_NAME_TEST`, `MONGO_DB_NAME_PROD`, `JWT_SECRET`, `JWT_ALG`, `JWT_EXPIRE_MIN`

- Frontend
  - Set `NEXT_PUBLIC_API_BASE_URL` (e.g., `http://127.0.0.1:8000`)

## Backend: Run API (FastAPI)
```powershell
cd .\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt --disable-pip-version-check
$env:APP_ENV = 'dev'
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Health check: `http://127.0.0.1:8000/health`

### Backend tests (pytest)
```powershell
cd .\backend
.\venv\Scripts\Activate.ps1
$env:APP_ENV = 'test'
pytest -v
```
Tests use the `MONGO_DB_NAME_TEST` database; it can be safely dropped.

## Frontend: Run app (Next.js)
```powershell
cd .\frontend
npm install
$env:NEXT_PUBLIC_API_BASE_URL = 'http://127.0.0.1:8000'
npm run dev
```
Visit: `http://localhost:3000`

- Signup page: `/signup`
- Login page: `/login`
- Tasks (protected): `/tasks`

### Frontend build
```powershell
cd .\frontend
npm run build
npm start
```

## E2E Tests (Cypress)
Backend and frontend must be running locally first.

```powershell
cd .\frontend
# Optional: override API base for tests
$env:CYPRESS_API_BASE_URL = 'http://127.0.0.1:8000'
# Open test runner
npm run cy:open
# Or run headless
npm run test:e2e
```
Included tests:
- Auth flow: signup → logout → login → navigate to `/tasks`
- Protected route: unauthenticated visit to `/tasks` redirects to `/login`

## Branching
- `backend` branch: backend work (auth, tasks, labels)
- `frontend` branch: frontend work (auth pages, protected routes, tasks UI)

Create PRs from branches when ready.

## Troubleshooting
- PowerShell env vars: use `$env:NAME = 'value'` in the same shell session.
- If Node/Next build complains about layout, ensure files live in `frontend/src/app`.
- Deprecation warnings about FastAPI `on_event` are harmless; can be switched to lifespan later.
