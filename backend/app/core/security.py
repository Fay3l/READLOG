"""Mots de passe (Argon2) et jetons JWT."""
from datetime import UTC, datetime, timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core import config

_hasher = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2)

# Hash d'un mot de passe bidon : quand l'e-mail n'existe pas, on vérifie quand même ce hash
# pour que la réponse prenne le même temps. Sinon, mesurer le temps de réponse révélerait
# quels e-mails sont inscrits.
_DUMMY_HASH = _hasher.hash("readlog-dummy-password")


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    try:
        return _hasher.verify(hashed_password or _DUMMY_HASH, plain_password) and hashed_password is not None
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_access_token(user_id: str) -> str:
    # "sub" = id de l'utilisateur : unique et immuable (le nom pouvait être en double)
    expire = datetime.now(UTC) + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire}, config.SECRET_KEY, algorithm=config.ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Renvoie l'id de l'utilisateur, ou None si le jeton est invalide ou expiré."""
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
    except jwt.InvalidTokenError:  # couvre aussi ExpiredSignatureError
        return None
    return payload.get("sub")
