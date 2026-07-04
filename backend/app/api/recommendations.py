from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import random

from app.db.database import get_db
from app.core.deps import get_current_active_user
from app.models.track import Track
from app.models.user import User
from app.models.playlist import Playlist, PlaylistTrack
from app.models.favorite_track import FavoriteTrack
from app.schemas.track import TrackRead

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

RECOMMENDATION_PLAYLIST_TITLE = "Рекомендации для вас"


def _serialize_tracks(db: Session, tracks: list[Track], user_id: int) -> list[TrackRead]:
    """Serialize tracks with favorite information for the user"""
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


def _get_or_create_recommendation_playlist(
    db: Session, user: User, limit: int = 20
) -> Playlist:
    """Получает существующий плейлист рекомендаций или создает новый"""
    
    # Ищем плейлист пользователя с таким названием
    playlist = (
        db.query(Playlist)
        .filter(
            Playlist.user_id == user.id,
            Playlist.title == RECOMMENDATION_PLAYLIST_TITLE,
        )
        .first()
    )
    
    # Если плейлист есть — возвращаем его
    if playlist:
        return playlist
    
    # Иначе создаем новый
    all_tracks = db.query(Track).all()
    
    if len(all_tracks) < limit:
        limit = len(all_tracks)
    
    if limit == 0:
        raise HTTPException(status_code=404, detail="Нет треков в базе")
    
    # Берем рандомные треки
    selected_tracks = random.sample(all_tracks, limit)
    
    # Создаем плейлист
    playlist = Playlist(
        title=RECOMMENDATION_PLAYLIST_TITLE,
        description="Персональные рекомендации",
        user_id=user.id,
    )
    db.add(playlist)
    db.flush()
    
    # Добавляем треки
    for position, track in enumerate(selected_tracks, start=1):
        pt = PlaylistTrack(
            playlist_id=playlist.id,
            track_id=track.id,
            position=position,
        )
        db.add(pt)
    
    db.commit()
    db.refresh(playlist)
    
    return playlist


@router.get("/playlist", response_model=dict)
def get_recommendation_playlist(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Получить персональный плейлист рекомендаций.
    Если у пользователя еще нет рекомендаций — создаст новые.
    """
    playlist = _get_or_create_recommendation_playlist(db, current_user, limit)
    
    # Получаем треки плейлиста
    playlist_tracks = (
        db.query(PlaylistTrack)
        .filter(PlaylistTrack.playlist_id == playlist.id)
        .order_by(PlaylistTrack.position)
        .all()
    )
    
    track_ids = [pt.track_id for pt in playlist_tracks]
    tracks = db.query(Track).filter(Track.id.in_(track_ids)).all()
    
    # Сортируем по позиции
    tracks_dict = {track.id: track for track in tracks}
    sorted_tracks = [tracks_dict[tid] for tid in track_ids if tid in tracks_dict]
    
    return {
        "id": playlist.id,
        "title": playlist.title,
        "description": playlist.description,
        "track_count": len(sorted_tracks),
        "tracks": _serialize_tracks(db, sorted_tracks, current_user.id),
    }


@router.post("/regenerate", response_model=dict)
def regenerate_recommendations(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Перегенерировать рекомендации (удалить старые и создать новые).
    """
    # Удаляем старый плейлист
    old_playlist = (
        db.query(Playlist)
        .filter(
            Playlist.user_id == current_user.id,
            Playlist.title == RECOMMENDATION_PLAYLIST_TITLE,
        )
        .first()
    )
    
    if old_playlist:
        # Удаляем связи
        db.query(PlaylistTrack).filter(
            PlaylistTrack.playlist_id == old_playlist.id
        ).delete()
        # Удаляем плейлист
        db.delete(old_playlist)
        db.commit()
    
    # Создаем новый
    playlist = _get_or_create_recommendation_playlist(db, current_user, limit)
    
    # Получаем треки
    playlist_tracks = (
        db.query(PlaylistTrack)
        .filter(PlaylistTrack.playlist_id == playlist.id)
        .order_by(PlaylistTrack.position)
        .all()
    )
    
    track_ids = [pt.track_id for pt in playlist_tracks]
    tracks = db.query(Track).filter(Track.id.in_(track_ids)).all()
    
    tracks_dict = {track.id: track for track in tracks}
    sorted_tracks = [tracks_dict[tid] for tid in track_ids if tid in tracks_dict]
    
    return {
        "id": playlist.id,
        "title": playlist.title,
        "description": playlist.description,
        "track_count": len(sorted_tracks),
        "tracks": _serialize_tracks(db, sorted_tracks, current_user.id),
    }