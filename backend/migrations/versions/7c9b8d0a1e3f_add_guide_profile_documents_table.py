"""add_guide_profile_documents_table

Add a table holding documents (certificates, ID photos, etc.) that a signed-in
guide uploaded for their public profile.  Rows are keyed on the catalog
``guides.id`` (not the ``users.id``), so the same public profile page that
renders the guide's bio and gallery can also render their uploaded documents.

Revision ID: 7c9b8d0a1e3f
Revises: a0c77518d5df
Create Date: 2026-11-21
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "7c9b8d0a1e3f"
down_revision: Union[str, Sequence[str], None] = "a0c77518d5df"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "guide_profile_documents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("guide_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column("doc_type", sa.String(), nullable=False),
        sa.Column("stored_name", sa.String(), nullable=False),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column(
            "uploaded_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["guide_id"],
            ["guides.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_guide_profile_documents_guide_id"),
        "guide_profile_documents",
        ["guide_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_guide_profile_documents_guide_id"),
        table_name="guide_profile_documents",
    )
    op.drop_table("guide_profile_documents")
