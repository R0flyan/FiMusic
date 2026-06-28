from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.playlists import router as playlists_router
from app.api.tracks import router as tracks_router

app = FastAPI(title="FiMusic API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(tracks_router)
app.include_router(playlists_router)
app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}
