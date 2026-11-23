from datetime import UTC, datetime


def utcnow() -> datetime:
    """À passer en default_factory / onupdate (la FONCTION, pas son résultat).

    `default=datetime.now(...)` est évalué une seule fois, à l'import du module :
    toutes les lignes recevaient alors la même date, celle du démarrage du serveur.
    """
    return datetime.now(UTC)


def normalize_database_url(url: str) -> str:
    # Render, Heroku, Neon... fournissent souvent "postgres://", que SQLAlchemy 2 refuse
    return "postgresql://" + url[len("postgres://") :] if url.startswith("postgres://") else url
