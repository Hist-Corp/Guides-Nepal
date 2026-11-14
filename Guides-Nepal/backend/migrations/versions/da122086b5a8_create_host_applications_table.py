"""create host_applications table

Revision ID: da122086b5a8
Revises: 6a3303359996
Create Date: 2026-11-02 23:46:04.445142

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da122086b5a8'
down_revision: Union[str, Sequence[str], None] = '6a3303359996'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
