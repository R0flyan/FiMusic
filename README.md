# FiMusic

FiMusic - музыкальное веб-приложение с React-фронтендом, FastAPI-бэкендом, PostgreSQL в Docker и локальным хранением медиафайлов.

## Стек

- Frontend: React, TypeScript, Vite
- Backend: FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL 17 в Docker
- Auth: JWT, регистрация и вход пользователя
- Media: локальные файлы в `backend/media`

## Что уже есть

- список треков из базы данных;
- воспроизведение локальных аудиофайлов;
- обложки треков;
- избранные треки;
- поиск по трекам;
- плейлисты;
- регистрация и авторизация;
- импорт локальных mp3 в базу;
- адаптивный интерфейс для desktop/mobile.

## Требования

- Node.js
- Python 3.12+
- Docker Desktop
- Git

## Переменные окружения

Создай локальный `.env` из примера:

```powershell
Copy-Item .env.example .env
```

Основные значения по умолчанию:

```env
POSTGRES_DB=fimusic_db
POSTGRES_USER=fimusic_teamlead
POSTGRES_PASSWORD=fimusic_password
DATABASE_URL=postgresql+psycopg://fimusic_teamlead:fimusic_password@localhost:5433/fimusic_db
SERVER_PORT=8080
```

PostgreSQL проброшен на порт `5433`, чтобы не конфликтовать с локальным PostgreSQL на `5432`.

## Запуск базы данных

Из корня проекта:

```powershell
docker compose up -d postgres
```

Проверить контейнер:

```powershell
docker compose ps
```

## Backend

Перейди в папку backend:

```powershell
cd backend
```

Создай виртуальное окружение:

```powershell
python -m venv .venv
```

Активируй его:

```powershell
.\.venv\Scripts\Activate.ps1
```

Установи зависимости:

```powershell
pip install -r requirements.txt
```

Примени миграции:

```powershell
alembic upgrade head
```

Запусти API:

```powershell
uvicorn app.main:app --reload --port 8080
```

Полезные URL:

- Healthcheck: `http://localhost:8080/health`
- Swagger: `http://localhost:8080/docs`
- Треки: `http://localhost:8080/tracks`
- Плейлисты: `http://localhost:8080/playlists`
- Auth: `http://localhost:8080/auth/...`
- Медиафайлы: `http://localhost:8080/media/...`

## Frontend

Перейди в папку frontend:

```powershell
cd frontend
```

Установи зависимости:

```powershell
npm install
```

Запусти dev-сервер:

```powershell
npm run dev
```

Frontend будет доступен по адресу:

```text
http://localhost:5173
```

Сборка frontend:

```powershell
npm run build
```

## Быстрый локальный запуск

Терминал 1:

```powershell
docker compose up -d postgres
```

Терминал 2:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
uvicorn app.main:app --reload --port 8080
```

Терминал 3:

```powershell
cd frontend
npm run dev
```

## Медиафайлы

Аудиофайлы и обложки не коммитятся в Git.

Создай папки:

```text
backend/media/tracks/
backend/media/covers/
```

Клади mp3 в:

```text
backend/media/tracks/
```

Клади обложки в:

```text
backend/media/covers/
```

Пути в базе должны выглядеть так:

```text
/media/tracks/example.mp3
/media/covers/example.jpg
```

## Импорт треков

Скрипт импорта сканирует `backend/media/tracks/*.mp3`, читает длительность и метаданные, пропускает уже добавленные файлы и создает записи в таблице `tracks`.

Запуск:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python scripts/import_tracks.py
```

Рекомендуемый формат имени файла:

```text
Artist - Title.mp3
```

Если формат другой, скрипт попытается взять данные из mp3-тегов. Если тегов нет, часть данных придется поправить в базе вручную.

## pgAdmin

Для подключения к базе из pgAdmin:

```text
Host: localhost
Port: 5433
Database: fimusic_db
Username: fimusic_teamlead
Password: fimusic_password
```

## Миграции Alembic

Создать новую миграцию после изменения моделей:

```powershell
cd backend
alembic revision --autogenerate -m "message"
```

Применить миграции:

```powershell
alembic upgrade head
```

Проверить текущую миграцию базы:

```powershell
alembic current
```

Проверить head-миграции проекта:

```powershell
alembic heads
```

## Важные замечания

- Не коммить `.env`.
- Не коммить `.venv`, `node_modules`, `dist`, `__pycache__` и локальные медиафайлы.
- Backend сейчас разрешает CORS для `http://localhost:5173`.
- Frontend ожидает backend на `http://localhost:8080`.
- После pull/merge, где есть новые backend-зависимости, запускай `pip install -r backend/requirements.txt`.
- После pull/merge, где есть новые миграции, запускай `alembic upgrade head` из папки `backend`.
