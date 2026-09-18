from fastapi import APIRouter, Depends, HTTPException, status  # pyright: ignore[reportMissingImports]
from typing import Annotated

from app.models.users import Users
from app.routers.auth import get_current_user
from app.schemas.user import GetUser

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", )
async def read():
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.get("/me")
async def read_user_me(current_user: Annotated[Users, Depends(get_current_user)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not current_user:
        raise credentials_exception
    return current_user


@router.get("/{username}")
async def read_user(username: str):
    return {"username": username}

