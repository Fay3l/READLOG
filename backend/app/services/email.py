import secrets, os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
load_dotenv()
# conf = ConnectionConfig(
#     MAIL_USERNAME = os.getenv('MAIL_USERNAME'),
#     MAIL_PASSWORD = os.getenv('MAIL_PASSWORD'),
#     MAIL_FROM     = os.getenv('MAIL_FROM'),
#     MAIL_PORT     = 587,
#     MAIL_SERVER   = os.getenv('MAIL_SERVER'),  # ex: smtp.mailtrap.io
#     MAIL_STARTTLS = True,
#     MAIL_SSL_TLS  = False,
# )

def generate_code() -> str:
    return str(secrets.randbelow(900000) + 100000)  # code à 6 chiffres


async def send_verification_email(email: str, code: str):
    message = MessageSchema(
        subject     = "Vérifie ton compte ReadLog",
        recipients  = [email],
        body        = f"""
            <h2>Bienvenue sur ReadLog 📚</h2>
            <p>Ton code de vérification est :</p>
            <h1>{code}</h1>
            <p>Ce code expire dans 15 minutes.</p>
        """,
        subtype     = MessageType.html,
    )
    # fm = FastMail(conf)
    # await fm.send_message(message)