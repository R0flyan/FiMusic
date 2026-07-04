from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.auth import router as auth_router
from app.api.playlists import router as playlists_router
from app.api.tracks import router as tracks_router
from app.config import settings

MEDIA_CORS_HEADERS = {
    "Access-Control-Allow-Origin": settings.frontend_origin,
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Range, Content-Type, Origin, Accept",
    "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range",
    "Cross-Origin-Resource-Policy": "cross-origin",
    "Cache-Control": "no-store",
}


class MediaStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        try:
            response = await super().get_response(path, scope)
        except StarletteHTTPException as error:
            response = Response(status_code=error.status_code)

        response.headers.update(MEDIA_CORS_HEADERS)

        full_path, stat_result = self.lookup_path(path)
        if stat_result is not None:
            with open(full_path, "rb") as file:
                header = file.read(12)

            if b"ftyp" in header:
                response.headers["Content-Type"] = "audio/mp4"

        return response


app = FastAPI(
    title="FiMusic API",
    version="1.0",
    description="HTTP API for FiMusic music streaming service.",
    root_path=settings.api_root_path,
    openapi_tags=[
        {
            "name": "auth",
            "description": "Регистрация, вход и работа с пользователем",
        },
        {
            "name": "tracks",
            "description": "Получение треков, поиск и медиатека",
        },
        {
            "name": "playlists",
            "description": "Создание плейлистов и управление треками в них",
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_media_cors_headers(request, call_next):
    response = await call_next(request)

    if request.url.path.startswith("/media/"):
        response.headers.update(MEDIA_CORS_HEADERS)

    return response


@app.options("/media/{path:path}")
def media_options(path: str):
    return Response(status_code=204, headers=MEDIA_CORS_HEADERS)


app.mount("/media", MediaStaticFiles(directory="media"), name="media")

app.include_router(tracks_router)
app.include_router(playlists_router)
app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}
