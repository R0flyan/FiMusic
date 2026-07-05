from __future__ import annotations

import sys
from pathlib import Path

from mutagen import File as MutagenFile
from sqlalchemy import select

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.db.database import SessionLocal  # noqa: E402
from app.models.track import Track  # noqa: E402

TRACKS_DIR = BACKEND_DIR / "media" / "tracks"
COVERS_DIR = BACKEND_DIR / "media" / "covers"

AUDIO_EXTENSIONS = {".mp3"}
COVER_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def format_duration(seconds: float | None) -> str | None:
    if seconds is None:
        return None

    total_seconds = round(seconds)
    minutes, remaining_seconds = divmod(total_seconds, 60)
    return f"{minutes}:{remaining_seconds:02d}"


def clean_text(value: str) -> str:
    return " ".join(value.replace("_", " ").split()).strip()


def split_filename(stem: str) -> tuple[str, str]:
    cleaned = clean_text(stem)

    if " - " in cleaned:
        artist, title = cleaned.split(" - ", 1)
        return clean_text(artist), clean_text(title)

    return "Unknown Artist", cleaned


def read_audio_metadata(path: Path) -> tuple[str, str, str | None, str | None]:
    audio = MutagenFile(path, easy=True)
    artist_from_name, title_from_name = split_filename(path.stem)

    title = title_from_name
    artist = artist_from_name
    album = None
    duration = None

    if audio is not None:
        title = clean_text(audio.get("title", [title])[0])
        artist = clean_text(audio.get("artist", [artist])[0])
        album_values = audio.get("album")
        album = clean_text(album_values[0]) if album_values else None
        duration = format_duration(getattr(audio.info, "length", None))

    return title, artist, album, duration


def media_path(path: Path) -> str:
    relative_path = path.relative_to(BACKEND_DIR).as_posix()
    return f"/{relative_path}"


def find_cover(track_path: Path, title: str) -> str | None:
    if not COVERS_DIR.exists():
        return None

    candidates = list(COVERS_DIR.iterdir())
    covers = [path for path in candidates if path.is_file() and path.suffix.lower() in COVER_EXTENSIONS]
    lookup_values = {track_path.stem.lower(), title.lower()}

    for cover in covers:
        if cover.stem.lower() in lookup_values:
            return media_path(cover)

    for cover in covers:
        cover_name = cover.stem.lower()
        if any(value and (value in cover_name or cover_name in value) for value in lookup_values):
            return media_path(cover)

    return None


def import_tracks() -> None:
    if not TRACKS_DIR.exists():
        raise SystemExit(f"Tracks directory does not exist: {TRACKS_DIR}")

    track_files = sorted(
        path for path in TRACKS_DIR.iterdir() if path.is_file() and path.suffix.lower() in AUDIO_EXTENSIONS
    )

    if not track_files:
        print("No audio files found.")
        return

    created = 0
    skipped = 0

    with SessionLocal() as db:
        existing_paths = set(db.scalars(select(Track.file_path)).all())

        for track_path in track_files:
            file_path = media_path(track_path)

            if file_path in existing_paths:
                skipped += 1
                print(f"Skipped existing track: {file_path}")
                continue

            title, artist, album, duration = read_audio_metadata(track_path)
            cover_path = find_cover(track_path, title)

            db.add(
                Track(
                    title=title,
                    artist=artist,
                    album=album,
                    duration=duration,
                    file_path=file_path,
                    cover_path=cover_path,
                )
            )
            created += 1
            print(f"Imported: {artist} - {title}")

        db.commit()

    print(f"Done. Imported: {created}. Skipped: {skipped}.")


if __name__ == "__main__":
    import_tracks()
