# pyright: ignore[reportMissingImports]
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime
from app.models.reading_reminders import ReadingReminders
from app.repositories.readingreminders import create_reading_reminders
from ..database.session import get_db
from app.routers.auth import get_current_user, require_verified_email
from app.schemas.user import GetUser, OnboardingSchema
from sqlalchemy.orm import Session
from app.repositories.books import  remove_user_book
from uuid import uuid4
router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", )
async def read():
    return [{"username": "Rick"}, {"username": "Morty"}]


@router.get("/me")
async def read_user_me(current_user: Annotated[GetUser, Depends(get_current_user)]):
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


@router.patch("/onboarding")
async def complete_onboarding(
    data: OnboardingSchema,
    current_user: Annotated[GetUser, Depends(require_verified_email)],
    db: Annotated[Session, Depends(get_db)]
):
    
    
    await create_reading_reminders(user=current_user,data=data,db=db)
    return {"detail": "Onboarding terminé ✅"}

@router.delete("/book/{book_id}")
async def delete_book(
    book_id: str,
    current_user: Annotated[GetUser, Depends(require_verified_email)],
    db: Annotated[Session, Depends(get_db)]
):
    # Supprime l'entrée dans UserBooks
    removed_user_book = await remove_user_book(db=db, b_id=book_id, u_id=str(current_user.id))
    if removed_user_book == 0:
        raise HTTPException(status_code=404, detail="Livre non trouvé dans la bibliothèque de l'utilisateur")
    
    return {"detail": "Livre supprimé de la bibliothèque de l'utilisateur et éventuellement de la base de données."}