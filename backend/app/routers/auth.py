import os
from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi.encoders import jsonable_encoder
from jose import jwt
from fastapi import Depends, HTTPException, status, APIRouter
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from ..schemas.user import UserCreate
from ..database.session import get_db
from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]
from ..repositories.users import create_user,verify_user
load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
ACCESS_TOKEN_EXPIRE = int(os.getenv('ACCESS_TOKEN_EXPIRE', 30))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

router = APIRouter()
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


# async def get_current_user(token: str = Depends(oauth2_scheme)):
#     credentials_exception = HTTPException(
#         status_code=status.HTTP_401_UNAUTHORIZED,
#         detail="Could not validate credentials or expired token",
#         headers={"WWW-Authenticate": "Bearer"},
#     )
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         username: str = payload.get("sub")
#         if username is None:
#             raise credentials_exception
#     except InvalidTokenError:
#         raise credentials_exception
#     user = connectionsql.sql.get_user_by_username(username)
#     if not user:
#         raise credentials_exception
#     return user


@router.post("/api/login")
async def authenticate_user(user: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    data = jsonable_encoder(user)
    print(data)
    hashed_password = await verify_user(db=db,name=data["username"],email=data["username"])
    print(hashed_password)
    if not hashed_password:
        raise HTTPException(status_code=401, detail="Sign Up")
    if (verify_password(data["password"], hashed_password)):
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE)
        access_token = create_access_token(
            data={"sub": data["username"]}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    else:
        raise HTTPException(
            status_code=400, detail="Incorrect username or password")


@router.post("/api/signup")
async def create_login(user: UserCreate, db: Session = Depends(get_db)):
    data = jsonable_encoder(user)
    print(data)
    if (data):
        # if (connectionsql.sql.username_duplicate(data["name"])):
        await create_user(db=db, name=data["name"], password=hash_password(data["password"]), email=data["email"])
        # return True
        # else:
        #     raise HTTPException(
        #         status_code=401, detail="Username already uses")
    else:
        raise HTTPException(
            status_code=400, detail="Empty username,email or password")
