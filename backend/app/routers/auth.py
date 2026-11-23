"""Inscription, vérification de l'e-mail et connexion."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app.core.rate_limit import login_limiter, resend_limiter, signup_limiter, verify_limiter
from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.database.session import get_db
from app.repositories.users import (
    account_exists,
    create_user,
    find_user_by_login,
    get_user_by_id,
    renew_verification_code,
    verify_user_email,
)
from app.schemas.token import Message, Token
from app.schemas.user import GetUser, UserCreate
from app.services.email import send_verification_email

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
router = APIRouter(prefix="/api", tags=["auth"])

# Un seul message pour "compte inconnu" et "mauvais mot de passe" :
# des messages différents permettraient de tester quels e-mails sont inscrits.
INVALID_CREDENTIALS = "E-mail ou mot de passe incorrect"
INVALID_CODE = "Code incorrect ou expiré"


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> GetUser:
    user_id = decode_access_token(token)
    user = get_user_by_id(db, user_id) if user_id else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expirée, reconnecte-toi",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def require_verified_email(current_user: GetUser = Depends(get_current_user)) -> GetUser:
    if not current_user.email_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email non vérifié")
    return current_user


@router.post("/login", response_model=Token, dependencies=[Depends(login_limiter)])
async def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = find_user_by_login(db, form.username)
    # verify_password est appelé même si l'utilisateur n'existe pas (temps de réponse identique)
    if not verify_password(form.password, user.password_hash if user else None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=INVALID_CREDENTIALS)
    # On ne parle de l'e-mail non vérifié qu'APRÈS avoir validé le mot de passe
    if not user.email_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email non vérifié")
    return Token(access_token=create_access_token(str(user.id)))


@router.post("/signup", response_model=Message, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(signup_limiter)])
async def signup(data: UserCreate, db: Session = Depends(get_db)):
    if account_exists(db, str(data.email), data.name):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Un compte existe déjà avec cet e-mail ou ce nom")
    user, code = create_user(db, data, hash_password(data.password))
    await send_verification_email(user.email, code)
    # ⚠️ le code n'est PAS dans la réponse : il est envoyé uniquement par e-mail
    return Message(detail="Compte créé, vérifie ton e-mail")


@router.post("/verify-email", response_model=Token, dependencies=[Depends(verify_limiter)])
async def verify_email(email: EmailStr, code: str, db: Session = Depends(get_db)):
    user = verify_user_email(db, str(email), code.strip())
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=INVALID_CODE)
    return Token(access_token=create_access_token(str(user.id)))


@router.post("/resend-code", response_model=Message, dependencies=[Depends(resend_limiter)])
async def resend_code(email: EmailStr, db: Session = Depends(get_db)):
    code = renew_verification_code(db, str(email))
    if code:
        await send_verification_email(str(email), code)
    # Même réponse que l'e-mail existe ou non (pas d'énumération des comptes)
    return Message(detail="Si un compte en attente existe, un nouveau code a été envoyé")
