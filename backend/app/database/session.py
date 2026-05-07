from typing import Generator
from sqlalchemy.orm import Session

# Référence vers l'instance DB créée dans main.py
# Les routers importent get_db d'ici, jamais depuis main.py
_db_instance = None

def init_db(db_instance):
    """Appelé une seule fois depuis main.py"""
    global _db_instance
    _db_instance = db_instance

def get_db() -> Generator[Session, None, None]:
    """Dépendance FastAPI — crée une session par requête"""
    if _db_instance is None or _db_instance.session is None:
        raise RuntimeError("Base de données non initialisée")
    db = _db_instance.session
    try:
        yield db
    finally:
        db.close()