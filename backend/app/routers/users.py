# pyright: ignore[reportMissingImports]
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from datetime import datetime
from app.models.reading_reminders import ReadingReminders
from app.repositories.readingreminders import create_reading_reminders
from ..database.session import get_db
from app.routers.auth import get_current_user, require_verified_email
from app.schemas.user import GetUser, OnboardingSchema, UpdateUserBook, UserStats
from app.repositories.stats import get_user_stats
from sqlalchemy.orm import Session
from app.repositories.books import get_books, remove_user_book, update_user_book
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


# ⚠️ Doit être déclarée AVANT "/{username}" (même raison que /books)
@router.get("/stats", response_model=UserStats)
async def read_stats(
    year: int | None = None,
    current_user: GetUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await get_user_stats(current_user, db, year)


# ⚠️ Doit être déclarée AVANT "/{username}", sinon "/books" est capturé
# par la route dynamique et renvoie {"username": "books"}.
@router.get("/books")
async def getbooks(current_user: GetUser = Depends(get_current_user), db: Session = Depends(get_db)):
    return await get_books(db, current_user)


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


@router.patch("/book/{book_id}")
async def patch_book(
    book_id: str,
    data: UpdateUserBook,
    current_user: Annotated[GetUser, Depends(require_verified_email)],
    db: Annotated[Session, Depends(get_db)]
):
    user_book = await update_user_book(db=db, b_id=book_id, u_id=str(current_user.id),
                                       status=data.status, current_page=data.current_page)
    if user_book is None:
        raise HTTPException(status_code=404, detail="Livre non trouvé dans la bibliothèque de l'utilisateur")
    return {"status": user_book.status, "current_page": user_book.current_page}
