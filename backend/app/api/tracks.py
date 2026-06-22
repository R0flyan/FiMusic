from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.track import Track
from app.schemas.track import TrackRead

router = APIRouter(prefix="/tracks", tags=["tracks"])


@router.get("", response_model=list[TrackRead])
def get_tracks(db: Session = Depends(get_db)):
    return db.query(Track).order_by(Track.id).all()