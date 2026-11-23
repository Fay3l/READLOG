"""user_books: started_at nullable, nettoyage des finished_at

Avant, started_at / finished_at recevaient la date de démarrage du serveur pour
chaque livre ajouté (default évalué une seule fois). finished_at n'a de sens que
pour un livre terminé : on le remet à NULL pour les autres.

Revision ID: 7c1e4b2a9d10
Revises: 2a2df5590b67
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '7c1e4b2a9d10'
down_revision: Union[str, Sequence[str], None] = '2a2df5590b67'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('user_books') as batch_op:
        batch_op.alter_column('started_at', existing_type=sa.DateTime(), nullable=True)
        batch_op.alter_column('finished_at', existing_type=sa.DateTime(), nullable=True)
    op.execute("UPDATE user_books SET finished_at = NULL WHERE status <> 'finished'")
    op.execute("UPDATE user_books SET started_at = NULL WHERE status = 'to_read'")


def downgrade() -> None:
    op.execute("UPDATE user_books SET started_at = created_at WHERE started_at IS NULL")
    with op.batch_alter_table('user_books') as batch_op:
        batch_op.alter_column('started_at', existing_type=sa.DateTime(), nullable=False)
