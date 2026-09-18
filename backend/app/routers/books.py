from fastapi import APIRouter, Depends, HTTPException, Query
from app.models.users import Users
from app.repositories.books import create_book, get_books
from app.database.session import get_db
from app.routers.auth import get_current_user
from sqlalchemy.orm import Session

from app.schemas.user import GetUser
from app.services.google_books import search_books


router = APIRouter(prefix="/books", tags=["books"])


@router.get("/search")
async def search(
    q: str = Query(..., min_length=2, description="Titre, auteur ou ISBN")
):
    # Si ça ressemble à un ISBN, on préfixe
    query = f"isbn:{q}" if q.isdigit() and len(q) >= 10 else q

    results = await search_books(query)
    if not results:
        raise HTTPException(status_code=404, detail="Aucun livre trouvé")
    return results


@router.post("/add")
async def add_book(google_books_id: str,
                   status: str = "to_read",
                   current_user: GetUser = Depends(get_current_user),
                   db: Session = Depends(get_db)):
    print(f"User {current_user}")
    return await create_book(db, current_user, google_books_id, status)


@router.get("/")
async def getbooks(current_user: GetUser =Depends(get_current_user),db: Session=Depends(get_db)):
    res = await get_books(db, current_user)
    return res