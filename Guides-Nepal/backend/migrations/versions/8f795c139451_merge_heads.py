"""merge heads

Revision ID: 8f795c139451
Revises: e7f8a9b0c1d2, f7e8a9b0c1d2
Create Date: 2026-11-06 11:39:59.656053

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f795c139451'
down_revision: Union[str, Sequence[str], None] = ('e7f8a9b0c1d2', 'f7e8a9b0c1d2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
