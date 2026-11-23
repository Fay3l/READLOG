"""Configuration de l'API, lue UNE fois depuis les variables d'environnement (.env en local).

Centraliser la config évite les os.getenv() éparpillés et permet d'échouer tout de suite
au démarrage si une valeur indispensable manque (plutôt qu'au premier login).
"""

import os

from dotenv import load_dotenv

from app.database.utils import normalize_database_url

load_dotenv()


def _required(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Variable d'environnement manquante : {name} (voir backend/.env.example)")
    return value


def _list(name: str) -> list[str]:
    return [v.strip() for v in os.getenv(name, "").split(",") if v.strip()]


# ── Base de données ──────────────────────────────────────────────
DATABASE_URL: str = normalize_database_url(_required("DATABASE_URL"))
SQL_ECHO: bool = os.getenv("SQL_ECHO", "false").lower() == "true"  # affiche le SQL (debug uniquement)

# ── JWT ──────────────────────────────────────────────────────────
SECRET_KEY: str = _required("SECRET_KEY")
# Une clé courte peut être retrouvée par force brute : on pourrait alors fabriquer des jetons valides.
if len(SECRET_KEY) < 32:
    raise RuntimeError(
        "SECRET_KEY trop courte (32 caractères minimum). Génère-en une avec :\n"
        '  python -c "import secrets; print(secrets.token_urlsafe(48))"'
    )
ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
# 7 jours par défaut : assez long pour ne pas déconnecter un lecteur en pleine lecture
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE", 60 * 24 * 7))

# ── CORS ─────────────────────────────────────────────────────────
# Les apps iOS/Android ne sont pas concernées par CORS : seule la version web l'est.
# Ex : CORS_ORIGINS=https://readlog.expo.app,http://localhost:8081
CORS_ORIGINS: list[str] = _list("CORS_ORIGINS") or ["http://localhost:8081"]

# ── E-mail (SMTP) ────────────────────────────────────────────────
# Sans MAIL_SERVER, le code de vérification est seulement écrit dans les logs du serveur (mode dev).
MAIL_SERVER: str | None = os.getenv("MAIL_SERVER")
MAIL_PORT: int = int(os.getenv("MAIL_PORT", 587))
MAIL_USERNAME: str | None = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD: str | None = os.getenv("MAIL_PASSWORD")
MAIL_FROM: str | None = os.getenv("MAIL_FROM")

# ── API externe ──────────────────────────────────────────────────
GOOGLE_BOOKS_API_KEY: str | None = os.getenv("GOOGLE_BOOKS_API_KEY")
