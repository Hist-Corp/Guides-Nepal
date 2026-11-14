"""add credential columns to guide_applications table

Revision ID: e7f8a9b0c1d2
Revises: da122086b5a8
Create Date: 2026-11-04 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e7f8a9b0c1d2'
down_revision: Union[str, Sequence[str], None] = 'da122086b5a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add credential and approval metadata to guide applications."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "guide_applications" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("guide_applications")}
    columns = (
        ("credential_token_hash", sa.String()),
        ("credential_password_hash", sa.String()),
        ("details_json", sa.Text()),
        ("user_id", sa.Integer()),
        ("reviewed_by", sa.String()),
        ("review_note", sa.String()),
        ("reviewed_at", sa.DateTime(timezone=True)),
    )
    with op.batch_alter_table("guide_applications") as batch:
        for name, column_type in columns:
            if name not in existing:
                batch.add_column(sa.Column(name, column_type, nullable=True))


def downgrade() -> None:
    """Remove guide application credential and approval metadata."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "guide_applications" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("guide_applications")}
    columns = (
        "reviewed_at",
        "review_note",
        "reviewed_by",
        "user_id",
        "details_json",
        "credential_password_hash",
        "credential_token_hash",
    )
    with op.batch_alter_table("guide_applications") as batch:
        for name in columns:
            if name in existing:
                batch.drop_column(name)
