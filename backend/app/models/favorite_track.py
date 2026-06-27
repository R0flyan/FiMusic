from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FavoriteTrack(Base):
    __tablename__ = "favorite_tracks"
    __table_args__ = (
        UniqueConstraint("track_id", name="uq_favorite_tracks_track_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    track_id: Mapped[int] = mapped_column(
        ForeignKey("tracks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
