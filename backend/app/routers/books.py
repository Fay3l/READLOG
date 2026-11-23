"""Recherche Google Books et ajout d'un livre à sa bibliothèque."""

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.books import create_book
from app.routers.auth import get_current_user, require_verified_email
from app.schemas.book import BookResult
from app.schemas.user import GetUser
from app.services.google_books import search_books

router = APIRouter(prefix="/api/books", tags=["books"])


# Réservé aux utilisateurs connectés : sinon n'importe qui pourrait épuiser le quota Google Books
@router.get("/search", response_model=list[BookResult], dependencies=[Depends(get_current_user)])
async def search(q: str = Query(..., min_length=2, max_length=200, description="Titre, auteur ou ISBN")):
    # Si ça ressemble à un ISBN, on préfixe
    query = f"isbn:{q}" if q.isdigit() and len(q) >= 10 else q
    results = await search_books(query)
    if not results:
        raise HTTPException(status_code=404, detail="Aucun livre trouvé")
    return results


@router.post("/add")
async def add_book(
    google_books_id: str = Query(..., min_length=1, max_length=64),
    status: Literal["to_read", "reading", "finished"] = "to_read",
    current_user: GetUser = Depends(require_verified_email),
    db: Session = Depends(get_db),
):
    return await create_book(db, current_user, google_books_id, status)
