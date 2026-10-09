"""create_host_guide_tables

Revision ID: d4e5f6a7b8c9
Revises: c8e1f2a3b4c5
Create Date: 2026-10-09 12:00:00.000000

Adds host_guides (host-owned guide accounts) and host_experience_guides
(guide -> host experience assignments) for the Host guide-management
workflow (SOP-GN-HOST-001).
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "d4e5f6a7b8c9"
down_revision = "c8e1f2a3b4c5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "host_guides",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("host_id", sa.Integer(), nullable=False),
        sa.Column("guide_user_id", sa.Integer(), nullable=True),
        sa.Column("guide_id", sa.Integer(), nullable=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("nin_number", sa.String(), nullable=True),
        sa.Column("city", sa.String(), nullable=True),
        sa.Column("region", sa.String(), nullable=True),
        sa.Column("documents", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["guide_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["guide_id"], ["guides.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_host_guides_id", "host_guides", ["id"], unique=False)
    op.create_index("ix_host_guides_host_id", "host_guides", ["host_id"], unique=False)
    op.create_index("ix_host_guides_guide_user_id", "host_guides", ["guide_user_id"], unique=False)
    op.create_index("ix_host_guides_guide_id", "host_guides", ["guide_id"], unique=False)
    op.create_index("ix_host_guides_email", "host_guides", ["email"], unique=False)

    op.create_table(
        "host_experience_guides",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("host_id", sa.Integer(), nullable=False),
        sa.Column("experience_id", sa.Integer(), nullable=False),
        sa.Column("guide_id", sa.Integer(), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["experience_id"], ["host_experiences.id"]),
        sa.ForeignKeyConstraint(["guide_id"], ["guides.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_host_experience_guides_id", "host_experience_guides", ["id"], unique=False)
    op.create_index("ix_host_experience_guides_host_id", "host_experience_guides", ["host_id"], unique=False)
    op.create_index("ix_host_experience_guides_experience_id", "host_experience_guides", ["experience_id"], unique=False)
    op.create_index("ix_host_experience_guides_guide_id", "host_experience_guides", ["guide_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_host_experience_guides_guide_id", table_name="host_experience_guides")
    op.drop_index("ix_host_experience_guides_experience_id", table_name="host_experience_guides")
    op.drop_index("ix_host_experience_guides_host_id", table_name="host_experience_guides")
    op.drop_index("ix_host_experience_guides_id", table_name="host_experience_guides")
    op.drop_table("host_experience_guides")
    op.drop_index("ix_host_guides_email", table_name="host_guides")
    op.drop_index("ix_host_guides_guide_id", table_name="host_guides")
    op.drop_index("ix_host_guides_guide_user_id", table_name="host_guides")
    op.drop_index("ix_host_guides_host_id", table_name="host_guides")
    op.drop_index("ix_host_guides_id", table_name="host_guides")
    op.drop_table("host_guides")
