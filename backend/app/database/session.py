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
    # pool_pre_ping : vérifie qu'une connexion du pool est encore vivante avant de s'en servir
    # (les bases hébergées coupent les connexions inactives)
    # SQLite (tests, dev) interdit par défaut d'utiliser une connexion dans un autre thread
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    engine = create_engine(url, echo=echo, pool_pre_ping=True, connect_args=connect_args)
    SessionLocal.configure(bind=engine)
    return engine


def get_db() -> Generator[Session, None, None]:
    """Dépendance FastAPI : ouvre une session pour la requête et la ferme ensuite."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
