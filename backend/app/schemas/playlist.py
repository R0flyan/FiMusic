from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.track import TrackRead


class PlaylistBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    cover_path: str | None = Field(default=None, max_length=500)

    model_config = {
        "str_strip_whitespace": True,
    }


class PlaylistCreate(PlaylistBase):
    pass


class PlaylistUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=500)
    cover_path: str | None = Field(default=None, max_length=500)

    model_config = {
        "str_strip_whitespace": True,
    }


class PlaylistRead(PlaylistBase):
    id: int
    track_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class PlaylistDetailRead(PlaylistRead):
    tracks: list[TrackRead] = Field(default_factory=list)
