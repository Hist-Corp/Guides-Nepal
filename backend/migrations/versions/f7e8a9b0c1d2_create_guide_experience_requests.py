"""create_guide_experience_requests

Revision ID: f7e8a9b0c1d2
Revises: c8e1f2a3b4c5
Create Date: 2026-11-05 10:00:00.000000

Adds the guide_experience_requests table behind the guide-to-experience
assignment request workflow (SOP-GN-GEA-001).  A guide requests to be
assigned as the 'Who you'll meet' guide on an existing host experience or
booking; a Regional Head (or admin) approves or rejects, and approval
creates a HostExperienceGuide link so the guide appears on Traveller pages.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "f7e8a9b0c1d2"
down_revision = "c8e1f2a3b4c5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "guide_experience_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("guide_user_id", sa.Integer(), nullable=False),
        sa.Column("experience_id", sa.Integer(), nullable=True),
        sa.Column("booking_id", sa.Integer(), nullable=True),
        sa.Column("request_type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("reviewed_by", sa.Integer(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["guide_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["experience_id"], ["host_experiences.id"]),
        sa.ForeignKeyConstraint(["booking_id"], ["host_bookings.id"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_guide_experience_requests_id"),
        "guide_experience_requests",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_guide_experience_requests_guide_user_id"),
        "guide_experience_requests",
        ["guide_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_guide_experience_requests_status"),
        "guide_experience_requests",
        ["status"],
        unique=False,
    )
    op.create_index(
        op.f("ix_guide_experience_requests_experience_id"),
        "guide_experience_requests",
        ["experience_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_guide_experience_requests_status"), table_name="guide_experience_requests"
    )
    op.drop_index(
        op.f("ix_guide_experience_requests_guide_user_id"),
        table_name="guide_experience_requests",
    )
    op.drop_index(op.f("ix_guide_experience_requests_id"), table_name="guide_experience_requests")
    op.drop_index(
        op.f("ix_guide_experience_requests_experience_id"),
        table_name="guide_experience_requests",
    )
    op.drop_table("guide_experience_requests")
