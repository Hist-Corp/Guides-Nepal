"""create_experience_workflow_tables

Revision ID: c8e1f2a3b4c5
Revises: 3f4a5b6c7d8e
Create Date: 2026-10-09 10:00:00.000000

Adds the two workflow tables behind SOP-GN-EXP-001 (new-experience
proposals) and SOP-GN-EXP-002 (experience change requests).
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "c8e1f2a3b4c5"
down_revision = "3f4a5b6c7d8e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "experience_proposals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("guide_user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False, server_default="tour"),
        sa.Column("city", sa.String(), nullable=False, server_default="Kathmandu"),
        sa.Column("area", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("itinerary", sa.Text(), nullable=True),
        sa.Column("meeting_point", sa.String(), nullable=True),
        sa.Column("duration", sa.String(), nullable=False, server_default="1 day"),
        sa.Column("difficulty", sa.String(), nullable=False, server_default="Easy"),
        sa.Column("price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("max_guests", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("documents", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decided_by_user_id", sa.Integer(), nullable=True),
        sa.Column("decided_by_role", sa.String(), nullable=True),
        sa.Column("decision_notes", sa.Text(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("listing_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["guide_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_experience_proposals_id"), "experience_proposals", ["id"], unique=False)
    op.create_index(
        op.f("ix_experience_proposals_guide_user_id"),
        "experience_proposals",
        ["guide_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_experience_proposals_status"), "experience_proposals", ["status"], unique=False
    )

    op.create_table(
        "experience_change_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("guide_user_id", sa.Integer(), nullable=False),
        sa.Column("listing_id", sa.Integer(), nullable=False),
        sa.Column("change_class", sa.String(), nullable=False, server_default="material"),
        sa.Column("reason", sa.Text(), nullable=False, server_default=""),
        sa.Column("changes", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("documents", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decided_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decided_by_user_id", sa.Integer(), nullable=True),
        sa.Column("decided_by_role", sa.String(), nullable=True),
        sa.Column("decision_notes", sa.Text(), nullable=True),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["guide_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["listing_id"], ["guide_listings.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_experience_change_requests_id"), "experience_change_requests", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_experience_change_requests_guide_user_id"),
        "experience_change_requests",
        ["guide_user_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_experience_change_requests_listing_id"),
        "experience_change_requests",
        ["listing_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_experience_change_requests_status"),
        "experience_change_requests",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_experience_change_requests_status"), table_name="experience_change_requests"
    )
    op.drop_index(
        op.f("ix_experience_change_requests_listing_id"), table_name="experience_change_requests"
    )
    op.drop_index(
        op.f("ix_experience_change_requests_guide_user_id"),
        table_name="experience_change_requests",
    )
    op.drop_index(op.f("ix_experience_change_requests_id"), table_name="experience_change_requests")
    op.drop_table("experience_change_requests")
    op.drop_index(op.f("ix_experience_proposals_status"), table_name="experience_proposals")
    op.drop_index(
        op.f("ix_experience_proposals_guide_user_id"), table_name="experience_proposals"
    )
    op.drop_index(op.f("ix_experience_proposals_id"), table_name="experience_proposals")
    op.drop_table("experience_proposals")
