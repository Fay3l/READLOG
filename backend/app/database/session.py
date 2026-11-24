"""Connexion à la base : un moteur (engine) partagé, une session PAR REQUÊTE.

Avant, une seule Session était partagée par toutes les requêtes et fermée à la fin de
chacune : deux utilisateurs simultanés se marchaient dessus. Le moteur, lui, gère un pool
de connexions et peut être partagé sans problème.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

SessionLocal = sessionmaker(autoflush=False)
engine: Engine | None = None


def init_engine(url: str, echo: bool = False) -> Engine:
    """Appelé une seule fois au démarrage (app/main.py)."""
    global engine
    if url.startswith("sqlite"):
        # SQLite (tests, dev) interdit par défaut d'utiliser une connexion dans un autre thread
        engine = create_engine(url, echo=echo, connect_args={"check_same_thread": False})
    else:
        # Au plus 7 connexions par instance de l'API : Postgres est réglé pour 20 connexions
        # (petit VPS), et pendant une mise à jour deux instances tournent en même temps.
        # pool_pre_ping : vérifie qu'une connexion du pool est encore vivante avant de s'en servir.
        engine = create_engine(url, echo=echo, pool_pre_ping=True, pool_size=5, max_overflow=2)
    SessionLocal.configure(bind=engine)
    return engine


def get_db() -> Generator[Session, None, None]:
    """Dépendance FastAPI : ouvre une session pour la requête et la ferme ensuite."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
