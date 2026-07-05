"""create playlists tables

Revision ID: 3f7c9a2b1d4e
Revises: 8b2d6b5f7c14
Create Date: 2026-06-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "3f7c9a2b1d4e"
down_revision: Union[str, Sequence[str], None] = "8b2d6b5f7c14"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "playlists",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("cover_path", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_playlists_id"), "playlists", ["id"], unique=False)

    op.create_table(
        "playlist_tracks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("playlist_id", sa.Integer(), nullable=False),
        sa.Column("track_id", sa.Integer(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["playlist_id"], ["playlists.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["track_id"], ["tracks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "playlist_id",
            "track_id",
            name="uq_playlist_tracks_playlist_id_track_id",
        ),
    )
    op.create_index(
        op.f("ix_playlist_tracks_id"),
        "playlist_tracks",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_playlist_tracks_playlist_id"),
        "playlist_tracks",
        ["playlist_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_playlist_tracks_track_id"),
        "playlist_tracks",
        ["track_id"],
        unique=False,
    )
    op.create_index(
        "ix_playlist_tracks_playlist_id_position",
        "playlist_tracks",
        ["playlist_id", "position"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_playlist_tracks_playlist_id_position", table_name="playlist_tracks")
    op.drop_index(op.f("ix_playlist_tracks_track_id"), table_name="playlist_tracks")
    op.drop_index(op.f("ix_playlist_tracks_playlist_id"), table_name="playlist_tracks")
    op.drop_index(op.f("ix_playlist_tracks_id"), table_name="playlist_tracks")
    op.drop_table("playlist_tracks")
    op.drop_index(op.f("ix_playlists_id"), table_name="playlists")
    op.drop_table("playlists")
