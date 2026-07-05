"""create favorite tracks table

Revision ID: 8b2d6b5f7c14
Revises: d02c62e12019
Create Date: 2026-06-26 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "8b2d6b5f7c14"
down_revision: Union[str, Sequence[str], None] = "d02c62e12019"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "favorite_tracks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("track_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["track_id"], ["tracks.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("track_id", name="uq_favorite_tracks_track_id"),
    )
    op.create_index(op.f("ix_favorite_tracks_id"), "favorite_tracks", ["id"], unique=False)
    op.create_index(op.f("ix_favorite_tracks_track_id"), "favorite_tracks", ["track_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_favorite_tracks_track_id"), table_name="favorite_tracks")
    op.drop_index(op.f("ix_favorite_tracks_id"), table_name="favorite_tracks")
    op.drop_table("favorite_tracks")
