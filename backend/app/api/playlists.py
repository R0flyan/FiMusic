from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_active_user
from app.db.database import get_db
from app.models.favorite_track import FavoriteTrack
from app.models.playlist import Playlist, PlaylistTrack
from app.models.track import Track
from app.models.user import User
from app.schemas.playlist import (
    PlaylistCreate,
    PlaylistDetailRead,
    PlaylistRead,
    PlaylistUpdate,
)
from app.schemas.track import TrackRead

router = APIRouter(prefix="/playlists", tags=["playlists"])


def _get_playlist(db: Session, playlist_id: int, user_id: int) -> Playlist:
    playlist = (
        db.query(Playlist)
        .filter(
            Playlist.id == playlist_id,
            Playlist.user_id == user_id,
        )
        .first()
    )
    if playlist is None:
        raise HTTPException(status_code=404, detail="Playlist not found")

    return playlist


def _playlist_track_count(db: Session, playlist_id: int) -> int:
    return (
        db.query(func.count(PlaylistTrack.id))
        .filter(PlaylistTrack.playlist_id == playlist_id)
        .scalar()
        or 0
    )


def _serialize_playlist(playlist: Playlist, track_count: int) -> PlaylistRead:
    return PlaylistRead.model_validate(playlist).model_copy(
        update={"track_count": track_count}
    )


def _serialize_tracks(db: Session, tracks: list[Track], user_id: int) -> list[TrackRead]:
    track_ids = [track.id for track in tracks]
    favorite_track_ids = set()

    if track_ids:
        favorite_track_ids = {
            track_id
            for (track_id,) in db.query(FavoriteTrack.track_id)
            .filter(
                FavoriteTrack.user_id == user_id,
                FavoriteTrack.track_id.in_(track_ids),
            )
            .all()
        }

    return [
        TrackRead.model_validate(track).model_copy(
            update={"is_favorite": track.id in favorite_track_ids}
        )
        for track in tracks
    ]


def _serialize_playlist_detail(
    db: Session,
    playlist: Playlist,
    user_id: int,
) -> PlaylistDetailRead:
    tracks = (
        db.query(Track)
        .join(PlaylistTrack, PlaylistTrack.track_id == Track.id)
        .filter(PlaylistTrack.playlist_id == playlist.id)
        .order_by(PlaylistTrack.position, PlaylistTrack.id)
        .all()
    )

    return PlaylistDetailRead.model_validate(playlist).model_copy(
        update={
            "track_count": len(tracks),
            "tracks": _serialize_tracks(db, tracks, user_id),
        }
    )


@router.get("", response_model=list[PlaylistRead])
def get_playlists(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    playlists = (
        db.query(Playlist)
        .filter(Playlist.user_id == current_user.id)
        .order_by(Playlist.id)
        .all()
    )
    counts = {
        playlist_id: track_count
        for playlist_id, track_count in db.query(
            PlaylistTrack.playlist_id,
            func.count(PlaylistTrack.id),
        )
        .join(Playlist, Playlist.id == PlaylistTrack.playlist_id)
        .filter(Playlist.user_id == current_user.id)
        .group_by(PlaylistTrack.playlist_id)
        .all()
    }

    return [
        _serialize_playlist(playlist, counts.get(playlist.id, 0))
        for playlist in playlists
    ]


@router.post("", response_model=PlaylistRead, status_code=201)
def create_playlist(
    payload: PlaylistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    playlist = Playlist(**payload.model_dump(), user_id=current_user.id)
    db.add(playlist)
    db.commit()
    db.refresh(playlist)

    return _serialize_playlist(playlist, 0)


@router.get("/{playlist_id}", response_model=PlaylistDetailRead)
def get_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    playlist = _get_playlist(db, playlist_id, current_user.id)
    return _serialize_playlist_detail(db, playlist, current_user.id)


@router.patch("/{playlist_id}", response_model=PlaylistRead)
def update_playlist(
    playlist_id: int,
    payload: PlaylistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    playlist = _get_playlist(db, playlist_id, current_user.id)
    updates = payload.model_dump(exclude_unset=True)

    if updates.get("title") is None and "title" in updates:
        raise HTTPException(status_code=422, detail="Playlist title cannot be null")

    for field, value in updates.items():
        setattr(playlist, field, value)

    db.commit()
    db.refresh(playlist)

    return _serialize_playlist(playlist, _playlist_track_count(db, playlist.id))


@router.delete("/{playlist_id}", status_code=204)
def delete_playlist(
    playlist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    playlist = _get_playlist(db, playlist_id, current_user.id)
    db.delete(playlist)
    db.commit()

    return Response(status_code=204)


@router.post("/{playlist_id}/tracks/{track_id}", response_model=PlaylistDetailRead)
def add_playlist_track(
    playlist_id: int,
    track_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    playlist = _get_playlist(db, playlist_id, current_user.id)
    track = db.get(Track, track_id)
    if track is None:
        raise HTTPException(status_code=404, detail="Track not found")

    existing = (
        db.query(PlaylistTrack)
        .filter(
            PlaylistTrack.playlist_id == playlist_id,
            PlaylistTrack.track_id == track_id,
        )
        .first()
    )

    if existing is None:
        next_position = (
            db.query(func.coalesce(func.max(PlaylistTrack.position), 0))
            .filter(PlaylistTrack.playlist_id == playlist_id)
            .scalar()
            + 1
        )
        db.add(
            PlaylistTrack(
                playlist_id=playlist_id,
                track_id=track_id,
                position=next_position,
            )
        )
        db.commit()
        db.refresh(playlist)

    return _serialize_playlist_detail(db, playlist, current_user.id)


@router.delete("/{playlist_id}/tracks/{track_id}", status_code=204)
def remove_playlist_track(
    playlist_id: int,
    track_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    _get_playlist(db, playlist_id, current_user.id)
    playlist_track = (
        db.query(PlaylistTrack)
        .filter(
            PlaylistTrack.playlist_id == playlist_id,
            PlaylistTrack.track_id == track_id,
        )
        .first()
    )

    if playlist_track is not None:
        db.delete(playlist_track)
        db.commit()

    return Response(status_code=204)
