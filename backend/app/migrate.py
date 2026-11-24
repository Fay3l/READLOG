"""Met le schéma de la base à jour. Lancé avant chaque démarrage de l'API (initContainer k8s).

    python -m app.migrate

- Base VIDE      → crée toutes les tables à partir des modèles, puis marque la base comme
                   étant à la dernière migration (`alembic stamp head`).
                   Pourquoi ? Les toutes premières migrations du projet ne savent pas construire
                   une base de zéro (deux migrations "add_onboarding_fields" en doublon).
- Base EXISTANTE → applique les migrations manquantes (`alembic upgrade head`).

Les nouvelles évolutions du schéma passent toujours par une migration Alembic :
    uv run alembic revision --autogenerate -m "description"
"""

import logging
from pathlib import Path

from alembic.config import Config
from sqlalchemy import inspect

from alembic import command
from app.database.base import Base
from app.database.session import init_engine
from app.models import books, quotes, reading_notes, reading_reminders, user_books, users  # noqa: F401

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("migrate")

ALEMBIC_INI = Path(__file__).resolve().parent.parent / "alembic.ini"


def main() -> None:
    from app.core import config

    engine = init_engine(config.DATABASE_URL)
    alembic_cfg = Config(str(ALEMBIC_INI))
    alembic_cfg.set_main_option("script_location", str(ALEMBIC_INI.parent / "alembic"))

    tables = set(inspect(engine).get_table_names())
    if "users" not in tables:
        logger.info("Base vide : création des tables depuis les modèles")
        Base.metadata.create_all(engine)
        command.stamp(alembic_cfg, "head")
    elif "alembic_version" not in tables:
        # Base créée par l'ancien create_all au démarrage de l'API, sans Alembic
        logger.info("Tables existantes sans historique Alembic : marquage à la dernière version")
        Base.metadata.create_all(engine)  # ajoute seulement les tables manquantes
        command.stamp(alembic_cfg, "head")
    else:
        logger.info("Application des migrations manquantes")
        command.upgrade(alembic_cfg, "head")
    logger.info("Schéma à jour")


if __name__ == "__main__":
    main()
