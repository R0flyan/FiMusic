# FiMusic

FiMusic is a music web app with a React frontend, FastAPI backend, PostgreSQL database, and local media storage.

## Stack

- Frontend: React, TypeScript, Vite
- Backend: FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL 17 in Docker
- Media: local files in `backend/media`

## Requirements

- Node.js
- Python 3.12+
- Docker Desktop
- Git

## Environment

Create local env file from the example:

```powershell
Copy-Item .env.example .env
```

Default local database URL:

```env
DATABASE_URL=postgresql+psycopg://fimusic_teamlead:fimusic_password@localhost:5433/fimusic_db
```

PostgreSQL is exposed on host port `5433` to avoid conflicts with a local Postgres on `5432`.

## Database

Start PostgreSQL:

```powershell
docker compose up -d postgres
```

Check container status:

```powershell
docker compose ps
```

## Backend

Create and activate virtual environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Apply migrations:

```powershell
alembic upgrade head
```

Run API server:

```powershell
uvicorn app.main:app --reload --port 8080
```

Backend URLs:

- API health: `http://localhost:8080/health`
- Tracks: `http://localhost:8080/tracks`
- API docs: `http://localhost:8080/docs`
- Media files: `http://localhost:8080/media/...`

## Media Files

Local audio and covers are not committed to git. Create folders manually:

Put mp3 files into:

```text
backend/media/tracks/
```

Put cover images into:

```text
backend/media/covers/
```

Track rows in the database should store paths like:

```text
/media/tracks/example.mp3
/media/covers/example.jpg
```

Import new local tracks into the database:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python scripts/import_tracks.py
```

The importer scans `backend/media/tracks/*.mp3`, skips already imported files, reads duration from mp3 metadata, and creates rows in `tracks`.

Recommended file name format:

```text
Artist - Title.mp3
```

If the file does not use this format, the importer uses `Unknown Artist` and the file name as the title unless mp3 metadata contains artist/title tags.
If the audio files are not processed correctly by the script, you will need to manually change the data in the database entry.

## Frontend

Install dependencies:

```powershell
cd frontend
npm install
```

Run frontend dev server:

```powershell
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Build frontend:

```powershell
npm run build
```

## Typical Local Startup

Terminal 1:

```powershell
docker compose up -d postgres
```

Terminal 2:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

Terminal 3:

```powershell
cd frontend
npm run dev
```

## pgAdmin Connection

Use these settings to inspect the Docker database:

```text
Host: localhost
Port: 5433
Database: fimusic_db
Username: fimusic_teamlead
Password: fimusic_password
```

## Notes

- Do not commit `.env`, virtual environments, `node_modules`, build output, or media files.
- Backend CORS currently allows `http://localhost:5173`.
- The frontend expects the backend to run on `http://localhost:8080`.
