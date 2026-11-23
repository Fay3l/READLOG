"""Compte de l'utilisateur connecté : profil, bibliothèque, statistiques."""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.books import get_books, remove_user_book, update_user_book
from app.repositories.readingreminders import create_reading_reminders
from app.repositories.stats import get_user_stats
from app.routers.auth import get_current_user, require_verified_email
from app.schemas.book import GetBook
from app.schemas.token import Message
from app.schemas.user import GetUser, OnboardingSchema, UpdateUserBook, UserStats

router = APIRouter(prefix="/api/users", tags=["users"])

CurrentUser = Annotated[GetUser, Depends(get_current_user)]
VerifiedUser = Annotated[GetUser, Depends(require_verified_email)]
DB = Annotated[Session, Depends(get_db)]
NOT_IN_LIBRARY = "Livre non trouvé dans ta bibliothèque"


@router.get("/me", response_model=GetUser)
async def read_user_me(current_user: CurrentUser):
    return current_user


@router.get("/stats", response_model=UserStats)
async def read_stats(current_user: CurrentUser, db: DB, year: int | None = None):
    return await get_user_stats(current_user, db, year)


@router.get("/books", response_model=list[GetBook])
async def read_books(current_user: CurrentUser, db: DB):
    return await get_books(db, current_user)


@router.patch("/onboarding", response_model=Message)
async def complete_onboarding(data: OnboardingSchema, current_user: VerifiedUser, db: DB):
    await create_reading_reminders(user=current_user, data=data, db=db)
    return Message(detail="Onboarding terminé ✅")


# book_id typé UUID : FastAPI renvoie 422 si l'id est mal formé (avant : erreur 500)
@router.delete("/book/{book_id}", response_model=Message)
async def delete_book(book_id: UUID, current_user: VerifiedUser, db: DB):
    if not await remove_user_book(db=db, b_id=str(book_id), u_id=str(current_user.id)):
        raise HTTPException(status_code=404, detail=NOT_IN_LIBRARY)
    return Message(detail="Livre retiré de ta bibliothèque")


@router.patch("/book/{book_id}")
async def patch_book(book_id: UUID, data: UpdateUserBook, current_user: VerifiedUser, db: DB):
    user_book = await update_user_book(db=db, b_id=str(book_id), u_id=str(current_user.id),
                                       status=data.status, current_page=data.current_page)
    if user_book is None:
        raise HTTPException(status_code=404, detail=NOT_IN_LIBRARY)
    return {"status": user_book.status, "current_page": user_book.current_page}
