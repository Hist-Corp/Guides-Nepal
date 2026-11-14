"""create_guides_table

Revision ID: 3f4a5b6c7d8e
Revises: ff8b527a0b00
Create Date: 2024-01-15 10:00:00.000000

"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "3f4a5b6c7d8e"
down_revision = "ff8b527a0b00"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create guides table
    op.create_table(
        "guides",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("image", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("reviews", sa.Integer(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=False),
        sa.Column("languages", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("cities", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("gallery", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_guides_id"), "guides", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_guides_id"), table_name="guides")
    op.drop_table("guides")
