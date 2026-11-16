"""merge heads including messaging tables

Revision ID: a0c77518d5df
Revises: 2f156aa554ba, a1b2c3d4e5f6_daily_capacity, a7b8c9d0e1f2
Create Date: 2026-11-16 21:07:50.423954

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a0c77518d5df'
down_revision: Union[str, Sequence[str], None] = ('2f156aa554ba', 'a1b2c3d4e5f6_daily_capacity', 'a7b8c9d0e1f2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
