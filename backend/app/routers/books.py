"""Recherche de livres (base locale + Google Books) et ajout à sa bibliothèque."""

import logging
from typing import Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.books import create_book, create_manual_book, search_local_books
from app.routers.auth import get_current_user, require_verified_email
from app.schemas.book import BookCreate, BookResult
from app.schemas.user import GetUser
from app.services.google_books import search_books

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/books", tags=["books"])


# Réservé aux utilisateurs connectés : sinon n'importe qui pourrait épuiser le quota Google Books
@router.get("/search", response_model=list[BookResult], dependencies=[Depends(get_current_user)])
async def search(
    q: str = Query(..., min_length=2, max_length=200, description="Titre, auteur ou ISBN"),
    db: Session = Depends(get_db),
):
    # 1. Notre propre table : livres saisis à la main + livres déjà ajoutés par quelqu'un
    local = search_local_books(db, q)

    # 2. Google Books. Une panne ou un quota dépassé ne doit pas empêcher la recherche locale.
    query = f"isbn:{q}" if q.isdigit() and len(q) >= 10 else q
    try:
        remote = await search_books(query)
    except httpx.HTTPError:
        logger.warning("Google Books indisponible pour la recherche %r", q, exc_info=True)
        remote = []

    # 3. Fusion sans doublons (un livre Google déjà en base apparaît dans les deux listes)
    seen = {b.google_books_id for b in local}
    results = local + [b for b in remote if b.google_books_id not in seen]
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


@router.post("/manual", status_code=status.HTTP_201_CREATED)
async def add_manual_book(
    data: BookCreate,
    current_user: GetUser = Depends(require_verified_email),
    db: Session = Depends(get_db),
):
    """Ajoute un livre que Google Books ne connaît pas. Il devient trouvable par la recherche."""
    return await create_manual_book(db, current_user, data)
