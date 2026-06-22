from datetime import datetime
from pydantic import BaseModel


class TrackRead(BaseModel):
    id: int
    title: str
    artist: str
    album: str | None
    duration: str | None
    file_path: str
    cover_path: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }