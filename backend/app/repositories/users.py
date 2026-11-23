"""Accès à la base pour les comptes utilisateurs."""
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.users import Users
from app.schemas.user import GetUser, UserCreate
from app.services.email import CODE_TTL_MINUTES, generate_code


def _as_utc(dt: datetime) -> datetime:
    # SQLite (et les anciennes lignes) renvoient des dates "naïves" sans fuseau :
    # comparer naïf et aware lève une TypeError, on les considère donc en UTC.
    return dt if dt.tzinfo else dt.replace(tzinfo=UTC)


def find_user_by_login(db: Session, login: str) -> Users | None:
    """Recherche par e-mail (insensible à la casse) ou par nom : on peut se connecter avec les deux."""
    login = login.strip()
    return db.query(Users).filter(
        or_(func.lower(Users.email) == login.lower(), Users.name == login)
    ).first()


def account_exists(db: Session, email: str, name: str) -> bool:
    return db.query(Users).filter(
        or_(func.lower(Users.email) == email.lower(), Users.name == name)
    ).first() is not None


def create_user(db: Session, data: UserCreate, password_hash: str) -> tuple[Users, str]:
    """Crée le compte (non vérifié) et renvoie le code de vérification à envoyer par e-mail."""
    code = generate_code()
    user = Users(
        email=str(data.email).lower(),
        name=data.name,
        password_hash=password_hash,
        verification_code=code,
        verification_expires=datetime.now(UTC) + timedelta(minutes=CODE_TTL_MINUTES),
    )
    user.id = uuid4()
    db.add(user)
    db.commit()
    return user, code


def get_user_by_id(db: Session, user_id: str) -> GetUser | None:
    try:
        uid = UUID(user_id)
    except (ValueError, TypeError):
        return None
    user = db.query(Users).filter(Users.id == uid).first()
    return GetUser.model_validate(user) if user else None


def get_user_by_name(name: str, db: Session) -> GetUser | None:
    res = db.query(Users).filter((Users.name == name) | (Users.email == name)).first()
    return GetUser.model_validate(res) if res else None


def renew_verification_code(db: Session, email: str) -> str | None:
    """Nouveau code pour un compte non vérifié ; None si l'e-mail est inconnu ou déjà vérifié."""
    user = db.query(Users).filter(func.lower(Users.email) == email.lower()).first()
    if not user or user.email_verified:
        return None
    user.verification_code = generate_code()
    user.verification_expires = datetime.now(UTC) + timedelta(minutes=CODE_TTL_MINUTES)
    db.commit()
    return user.verification_code


def verify_user_email(db: Session, email: str, code: str) -> Users | None:
    """Valide le code. Renvoie l'utilisateur si tout est bon, sinon None (sans dire pourquoi)."""
    user = db.query(Users).filter(func.lower(Users.email) == email.lower()).first()
    if not user or not user.verification_code or not user.verification_expires:
        return None
    # compare_digest : comparaison en temps constant (ne révèle pas combien de chiffres sont justes)
    if not secrets.compare_digest(user.verification_code, code):
        return None
    if datetime.now(UTC) > _as_utc(user.verification_expires):
        return None
    user.email_verified = True
    user.verification_code = None
    user.verification_expires = None
    db.commit()
    return user
