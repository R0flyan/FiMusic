from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.favorite_track import FavoriteTrack
from app.models.track import Track
from app.schemas.track import TrackRead

router = APIRouter(prefix="/tracks", tags=["tracks"])


@router.get("", response_model=list[TrackRead])
def get_tracks(db: Session = Depends(get_db)):
    tracks = db.query(Track).order_by(Track.id).all()
    favorite_track_ids = {
        track_id
        for (track_id,) in db.query(FavoriteTrack.track_id).all()
    }

    return [
        TrackRead.model_validate(track).model_copy(
            update={"is_favorite": track.id in favorite_track_ids}
        )
        for track in tracks
    ]


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
