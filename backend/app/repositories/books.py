import re
from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.books import Books
from app.models.user_books import UserBooks
from app.schemas.book import BookCreate, BookResult, GetBook
from app.schemas.user import GetUser
from app.services.google_books import get_book_by_id


async def create_book(db: Session, current_user: GetUser, google_books_id: str, status: str = "to_read"):
    book = db.query(Books).filter(Books.google_books_id == google_books_id).first()
    if not book:
        data = await get_book_by_id(google_books_id)
        if not data:
            raise HTTPException(status_code=404, detail="Livre introuvable")
        book = Books(**data.model_dump(exclude={"id", "genre"}), genres=data.genre, id=uuid4())
        db.add(book)
        db.flush()  # pour avoir l'id avant le commit

    # 3. L'utilisateur l'a-t-il déjà ajouté ?
    existing = db.query(UserBooks).filter(UserBooks.user_id == current_user.id, UserBooks.book_id == book.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Déjà dans ta bibliothèque")

    # 4. Création de l'entrée user_book
    now = datetime.now(UTC)
    user_book = UserBooks(
        id=uuid4(),
        user_id=current_user.id,
        book_id=book.id,
        status=status,
        # les dates alimentent les stats ("livres lus par mois")
        started_at=now if status in ("reading", "finished") else None,
        finished_at=now if status == "finished" else None,
    )
    db.add(user_book)
    db.commit()
    return {"message": "Livre ajouté ✅", "book_id": book.id}


async def get_books(db: Session, current_user: GetUser) -> list[GetBook] | list:
    res = (
        db.query(Books, UserBooks.status, UserBooks.current_page)
        .join(UserBooks, UserBooks.book_id == Books.id)
        .filter(UserBooks.user_id == current_user.id)
        .all()
    )
    if not res:
        return []
    books = []
    for book, status, current_page in res:
        data = {**book.__dict__, "status": status, "current_page": current_page}
        book_data = GetBook.model_validate(data)
        books.append(book_data)

    return books


async def remove_book(db: Session, b_id: str):
    book_id = UUID(hex=b_id)
    res = db.query(Books).filter(Books.id == book_id).delete(synchronize_session="evaluate")
    if res == 0:
        return False
    db.commit()
    return True


async def remove_user_book(db: Session, b_id: str, u_id: str):
    book_id = UUID(hex=b_id)
    user_id = UUID(hex=u_id)
    res = (
        db.query(UserBooks)
        .filter(UserBooks.book_id == book_id, UserBooks.user_id == user_id)
        .delete(synchronize_session="evaluate")
    )
    if res == 0:
        return False
    db.commit()
    return True


async def update_user_book(db: Session, b_id: str, u_id: str, status: str | None, current_page: int | None):
    """Met à jour le statut et/ou la page en cours d'un livre de la bibliothèque."""
    user_book = db.query(UserBooks).filter(UserBooks.book_id == UUID(b_id), UserBooks.user_id == UUID(u_id)).first()
    if user_book is None:
        return None

    now = datetime.now(UTC)
    if status is not None and status != user_book.status:
        user_book.status = status
        if status == "reading" and user_book.started_at is None:
            user_book.started_at = now
        # finished_at sert aux stats "livres lus par mois"
        user_book.finished_at = now if status == "finished" else None

    if current_page is not None:
        book = db.query(Books).filter(Books.id == user_book.book_id).first()
        if book and book.page_count:
            current_page = min(current_page, book.page_count)
        user_book.current_page = current_page

    db.commit()
    db.refresh(user_book)
    return user_book


# Les livres saisis à la main n'ont pas d'identifiant Google : on leur en donne un local,
# ce qui permet de réutiliser tel quel tout le reste du code (ajout, bibliothèque, stats).
LOCAL_PREFIX = "local-"


def _to_result(book: Books) -> BookResult:
    return BookResult(
        google_books_id=book.google_books_id,
        title=book.title,
        author=book.author,
        cover_url=book.cover_url,
        description=book.description,
        page_count=book.page_count,
        isbn=book.isbn,
        published_year=book.published_year,
        publisher=book.publisher,
        genre=book.genres,
    )


def _escape_like(text: str) -> str:
    # % et _ sont des jokers en SQL LIKE : on les échappe pour chercher le texte tel quel
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def search_local_books(db: Session, query: str, limit: int = 10) -> list[BookResult]:
    """Recherche dans la table books : livres saisis à la main ET livres Google déjà ajoutés."""
    digits = re.sub(r"[^0-9Xx]", "", query)
    if query.replace("-", "").replace(" ", "").isdigit() and len(digits) in (10, 13):
        books = db.query(Books).filter(Books.isbn == digits.upper()).limit(limit).all()
    else:
        pattern = f"%{_escape_like(query.strip())}%"
        books = (
            db.query(Books)
            .filter(or_(Books.title.ilike(pattern, escape="\\"), Books.author.ilike(pattern, escape="\\")))
            .order_by(Books.title)
            .limit(limit)
            .all()
        )
    return [_to_result(b) for b in books]


async def create_manual_book(db: Session, current_user: GetUser, data: BookCreate):
    """Crée un livre saisi à la main (ou réutilise celui qui a le même ISBN) et l'ajoute à la bibliothèque."""
    book = db.query(Books).filter(Books.isbn == data.isbn).first() if data.isbn else None
    if book is None:
        book = Books(
            id=uuid4(),
            google_books_id=f"{LOCAL_PREFIX}{uuid4().hex}",
            title=data.title,
            author=data.author,
            isbn=data.isbn,
            page_count=data.page_count,
            published_year=data.published_year,
            publisher=data.publisher,
            genres=data.genre,
            description=data.description,
        )
        db.add(book)
        db.flush()
    return await create_book(db, current_user, book.google_books_id, data.status)
