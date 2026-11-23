from datetime import UTC, datetime


def utcnow() -> datetime:
    """À passer en default_factory / onupdate (la FONCTION, pas son résultat).

    `default=datetime.now(...)` est évalué une seule fois, à l'import du module :
    toutes les lignes recevaient alors la même date, celle du démarrage du serveur.
    """
    return datetime.now(UTC)
