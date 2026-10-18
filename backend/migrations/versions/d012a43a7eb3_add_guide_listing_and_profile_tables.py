"""Add guide listing and profile tables

Revision ID: d012a43a7eb3
Revises: d4e5f6a7b8c9
Create Date: 2026-10-18 21:00:25.623441

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd012a43a7eb3'
down_revision: Union[str, Sequence[str], None] = '3f4a5b6c7d8e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'guide_listings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('guide_user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False, server_default='tour'),
        sa.Column('city', sa.String(), nullable=False, server_default='Kathmandu'),
        sa.Column('area', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('itinerary', sa.Text(), nullable=True),
        sa.Column('meeting_point', sa.String(), nullable=True),
        sa.Column('duration', sa.String(), nullable=False, server_default='1 day'),
        sa.Column('difficulty', sa.String(), nullable=False, server_default='Easy'),
        sa.Column('price', sa.Float(), nullable=False, server_default='0'),
        sa.Column('max_guests', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('booked_guests', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=True,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(['guide_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_guide_listings_id'), 'guide_listings', ['id'], unique=False
    )
    op.create_index(
        op.f('ix_guide_listings_guide_user_id'),
        'guide_listings',
        ['guide_user_id'],
        unique=False,
    )

    op.create_table(
        'guide_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('guide_user_id', sa.Integer(), nullable=False),
        sa.Column('display_name', sa.String(), nullable=True),
        sa.Column('expertise_areas', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('cities', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('languages', sa.JSON(), nullable=False, server_default='[]'),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('years_experience', sa.String(), nullable=True),
        sa.Column(
            'default_max_guests',
            sa.Integer(),
            nullable=False,
            server_default='10',
        ),
        sa.Column(
            'onboarding_completed',
            sa.Boolean(),
            nullable=False,
            server_default='0',
        ),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=True,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(['guide_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_guide_profiles_guide_user_id'),
        'guide_profiles',
        ['guide_user_id'],
        unique=True,
    )

    op.create_table(
        'host_experiences',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('host_user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False, server_default=''),
        sa.Column('city', sa.String(), nullable=False, server_default='Kathmandu'),
        sa.Column('category', sa.String(), nullable=False, server_default='tour'),
        sa.Column('price', sa.Float(), nullable=False, server_default='0'),
        sa.Column('max_guests', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=True,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(['host_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_host_experiences_id'), 'host_experiences', ['id'], unique=False
    )
    op.create_index(
        op.f('ix_host_experiences_host_user_id'),
        'host_experiences',
        ['host_user_id'],
        unique=False,
    )

    op.create_table(
        'guide_status_updates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('guide_user_id', sa.Integer(), nullable=False),
        sa.Column('listing_id', sa.Integer(), nullable=True),
        sa.Column('update_type', sa.String(), nullable=False, server_default='announcement'),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('area', sa.String(), nullable=True),
        sa.Column('event_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('current_capacity', sa.Integer(), nullable=True),
        sa.Column('max_capacity', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('now()'),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(['guide_user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['listing_id'], ['guide_listings.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_guide_status_updates_id'), 'guide_status_updates', ['id'], unique=False
    )
    op.create_index(
        op.f('ix_guide_status_updates_guide_user_id'),
        'guide_status_updates',
        ['guide_user_id'],
        unique=False,
    )
    op.create_index(
        'ix_guide_status_updates_type_date',
        'guide_status_updates',
        ['guide_user_id', 'created_at'],
        unique=False,
    )

    op.create_table(
        'bookmarks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('image', sa.String(), nullable=True),
        sa.Column('link', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        op.f('ix_bookmarks_id'), 'bookmarks', ['id'], unique=False
    )
    op.create_index(
        op.f('ix_bookmarks_user_id'), 'bookmarks', ['user_id'], unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_bookmarks_user_id'), table_name='bookmarks')
    op.drop_index(op.f('ix_bookmarks_id'), table_name='bookmarks')
    op.drop_table('bookmarks')
    op.drop_index(op.f('ix_guide_status_updates_guide_user_id'), table_name='guide_status_updates')
    op.drop_index('ix_guide_status_updates_type_date', table_name='guide_status_updates')
    op.drop_index(op.f('ix_guide_status_updates_id'), table_name='guide_status_updates')
    op.drop_table('guide_status_updates')
    op.drop_index(op.f('ix_host_experiences_host_user_id'), table_name='host_experiences')
    op.drop_index(op.f('ix_host_experiences_id'), table_name='host_experiences')
    op.drop_table('host_experiences')
    op.drop_index(op.f('ix_guide_profiles_guide_user_id'), table_name='guide_profiles')
    op.drop_table('guide_profiles')
    op.drop_index(op.f('ix_guide_listings_guide_user_id'), table_name='guide_listings')
    op.drop_index(op.f('ix_guide_listings_id'), table_name='guide_listings')
    op.drop_table('guide_listings')
