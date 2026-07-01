"""scope library to users

Revision ID: 1f6b9c8a2d35
Revises: fe0e00e26c41
Create Date: 2026-07-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "1f6b9c8a2d35"
down_revision: Union[str, Sequence[str], None] = "fe0e00e26c41"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("favorite_tracks", sa.Column("user_id", sa.Integer(), nullable=True))
    op.add_column("playlists", sa.Column("user_id", sa.Integer(), nullable=True))

    op.execute(
        """
        UPDATE favorite_tracks
        SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
        WHERE user_id IS NULL
        """
    )
    op.execute(
        """
        UPDATE playlists
        SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
        WHERE user_id IS NULL
        """
    )

    op.create_foreign_key(
        "fk_favorite_tracks_user_id_users",
        "favorite_tracks",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "fk_playlists_user_id_users",
        "playlists",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_index(op.f("ix_favorite_tracks_user_id"), "favorite_tracks", ["user_id"])
    op.create_index(op.f("ix_playlists_user_id"), "playlists", ["user_id"])

    op.drop_constraint("uq_favorite_tracks_track_id", "favorite_tracks", type_="unique")
    op.create_unique_constraint(
        "uq_favorite_tracks_user_id_track_id",
        "favorite_tracks",
        ["user_id", "track_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_favorite_tracks_user_id_track_id", "favorite_tracks", type_="unique")
    op.create_unique_constraint("uq_favorite_tracks_track_id", "favorite_tracks", ["track_id"])

    op.drop_index(op.f("ix_playlists_user_id"), table_name="playlists")
    op.drop_index(op.f("ix_favorite_tracks_user_id"), table_name="favorite_tracks")
    op.drop_constraint("fk_playlists_user_id_users", "playlists", type_="foreignkey")
    op.drop_constraint("fk_favorite_tracks_user_id_users", "favorite_tracks", type_="foreignkey")
    op.drop_column("playlists", "user_id")
    op.drop_column("favorite_tracks", "user_id")
