import os
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi.encoders import jsonable_encoder
from jose import ExpiredSignatureError, jwt
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt import InvalidTokenError
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from ..schemas.user import GetUser, UserCreate
from ..services.email import generate_code, send_verification_email
from ..database.session import get_db
from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
from ..repositories.users import create_user, user_resend_code, verify_user, get_user_by_name, verify_user_email
load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE = int(os.getenv('ACCESS_TOKEN_EXPIRE', 30))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

router = APIRouter(tags=["auth"])
password_hash = PasswordHash.recommended()
ph = PasswordHasher(
    time_cost=2,      # nombre d'itérations
    memory_cost=65536,  # mémoire utilisée (64 MB)
    parallelism=2,    # threads parallèles
)


def hash_password(password: str) -> str:
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except (InvalidTokenError, ExpiredSignatureError) as exc:
        raise credentials_exception
    user = await get_user_by_name(name=username, db=db)
    if not user:
        raise credentials_exception
    print(user)
    return user

async def require_verified_email(current_user: GetUser = Depends(get_current_user)):
    if not current_user.email_verified:
        raise HTTPException(status_code=403, detail="Email non vérifié")
    return current_user


@router.post("/api/login")
async def authenticate_user(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    data = jsonable_encoder(user)
    print(data)
    get_user = await verify_user(db=db, name=data["username"], email=data["username"])
    if not get_user:
        raise HTTPException(status_code=401, detail="Le compte n'existe pas")
    if not get_user.email_verified:
        raise HTTPException(status_code=401, detail="Email non vérifié")
    if (verify_password(data["password"], get_user.password_hashed)):
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE)
        access_token = create_access_token(
            data={"sub": get_user.name}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=400, detail="Incorrect username or password")


@router.post("/api/signup")
async def create_login(user: UserCreate, db: Session = Depends(get_db)):
    if (user):
        code = generate_code()
        user.password = hash_password(user.password)
        # if (connectionsql.sql.username_duplicate(data["name"])):
        res = await create_user(db=db, uc=user, code=code, expired=datetime.now(timezone.utc) + timedelta(minutes=15))
        if res:
            await send_verification_email(user.email, code)
            return {"detail": "Compte créé, vérifie ton email", "code": code}
        raise HTTPException(
            status_code=400, detail="Réessayez l'inscription")
    else:
        raise HTTPException(
            status_code=400, detail="Empty username,email or password")

# ── Vérification du code ──────────────────────────


@router.post("/api/verify-email")
async def verify_email(email: str, code: str, db: Session = Depends(get_db)):
    res = await verify_user_email(email=email, db=db, code=code)
    if res.code != 200:
        raise HTTPException(status_code=res.code, detail=res.detail)
    return {"detail": "Email vérifié ✅"}

# ── Renvoyer un nouveau code ───────────────────────


@router.post("/api/resend-code")
async def resend_code(email: str, db: Session = Depends(get_db)):
    res = await user_resend_code(email=email, db=db)
    if not res:
        raise HTTPException(status_code=400, detail="Requête Invalide")
    await send_verification_email(email, res.code)
    return {"detail": "Code renvoyé"}
