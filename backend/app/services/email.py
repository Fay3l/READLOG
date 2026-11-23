"""Codes de vérification et envoi d'e-mails."""

import logging
import secrets

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core import config

logger = logging.getLogger(__name__)

CODE_TTL_MINUTES = 15


def generate_code() -> str:
    # secrets (et non random) : générateur cryptographique, impossible à prédire
    return str(secrets.randbelow(900000) + 100000)  # code à 6 chiffres


def _mail_config() -> ConnectionConfig | None:
    if not (config.MAIL_SERVER and config.MAIL_USERNAME and config.MAIL_PASSWORD and config.MAIL_FROM):
        return None
    return ConnectionConfig(
        MAIL_USERNAME=config.MAIL_USERNAME,
        MAIL_PASSWORD=config.MAIL_PASSWORD,
        MAIL_FROM=config.MAIL_FROM,
        MAIL_FROM_NAME="ReadLog",
        MAIL_PORT=config.MAIL_PORT,
        MAIL_SERVER=config.MAIL_SERVER,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
    )


async def send_verification_email(email: str, code: str) -> None:
    """Envoie le code par e-mail. Le code n'est JAMAIS renvoyé dans la réponse de l'API :
    sinon n'importe qui pourrait valider un compte créé avec l'adresse de quelqu'un d'autre."""
    conf = _mail_config()
    if conf is None:
        # Mode développement (pas de SMTP configuré) : le code n'apparaît que dans les logs du serveur.
        logger.warning("[DEV] SMTP non configuré — code de vérification pour %s : %s", email, code)
        return

    message = MessageSchema(
        subject="Vérifie ton compte ReadLog",
        recipients=[email],
        body=f"""
            <h2>Bienvenue sur ReadLog 📚</h2>
            <p>Ton code de vérification est :</p>
            <h1>{code}</h1>
            <p>Ce code expire dans {CODE_TTL_MINUTES} minutes.</p>
        """,
        subtype=MessageType.html,
    )
    try:
        await FastMail(conf).send_message(message)
    except Exception:
        # on ne bloque pas l'inscription : l'utilisateur pourra demander un nouveau code
        logger.exception("Échec de l'envoi de l'e-mail de vérification à %s", email)
