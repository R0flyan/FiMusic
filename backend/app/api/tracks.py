from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.favorite_track import FavoriteTrack
from app.models.track import Track
from app.schemas.track import TrackRead

router = APIRouter(prefix="/tracks", tags=["tracks"])


def _escape_like(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )


def _serialize_tracks(db: Session, tracks: list[Track]) -> list[TrackRead]:
    track_ids = [track.id for track in tracks]
    favorite_track_ids = set()

    if track_ids:
        favorite_track_ids = {
            track_id
            for (track_id,) in db.query(FavoriteTrack.track_id)
            .filter(FavoriteTrack.track_id.in_(track_ids))
            .all()
        }

    return [
        TrackRead.model_validate(track).model_copy(
            update={"is_favorite": track.id in favorite_track_ids}
        )
        for track in tracks
    ]


@router.get("", response_model=list[TrackRead])
def get_tracks(
    search: str | None = Query(default=None, max_length=255),
    db: Session = Depends(get_db),
):
    query = db.query(Track)

    if search is not None and search.strip():
        pattern = f"%{_escape_like(search.strip())}%"
        query = query.filter(
            or_(
                Track.title.ilike(pattern, escape="\\"),
                Track.artist.ilike(pattern, escape="\\"),
                Track.album.ilike(pattern, escape="\\"),
            )
        )

    tracks = query.order_by(Track.id).all()
    return _serialize_tracks(db, tracks)


@router.post("/{track_id}/favorite", response_model=TrackRead)
def add_favorite_track(track_id: int, db: Session = Depends(get_db)):
    track = db.get(Track, track_id)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")

    favorite = db.query(FavoriteTrack).filter(FavoriteTrack.track_id == track_id).first()
    if favorite is None:
        db.add(FavoriteTrack(track_id=track_id))
        db.commit()
        db.refresh(track)

    return TrackRead.model_validate(track).model_copy(update={"is_favorite": True})


@router.delete("/{track_id}/favorite", status_code=204)
def remove_favorite_track(track_id: int, db: Session = Depends(get_db)):
    favorite = db.query(FavoriteTrack).filter(FavoriteTrack.track_id == track_id).first()
    if favorite is not None:
        db.delete(favorite)
        db.commit()

    return Response(status_code=204)
