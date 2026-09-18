from http.client import HTTPException
from uuid import uuid4
from sqlalchemy.orm import Session
from app.models.books import Books
from app.models.user_books import UserBooks
from app.models.users import Users
from app.schemas.book import GetBook
from app.schemas.user import GetUser
from app.services.google_books import get_book_by_id


async def create_book(db: Session, current_user: GetUser, google_books_id: str, status: str = "to_read"):
    book = db.query(Books).filter(
        Books.google_books_id == google_books_id).first()
    if not book:
        data = await get_book_by_id(google_books_id)
        if not data:
            raise HTTPException(status_code=404, detail="Livre introuvable")
        book = Books(**data.model_dump(exclude={"id","genre"}),genres=data.genre,id=uuid4())
        db.add(book)
        db.flush()  # pour avoir l'id avant le commit

    # 3. L'utilisateur l'a-t-il déjà ajouté ?
    existing = db.query(UserBooks).filter(
        UserBooks.user_id == current_user.id,
        UserBooks.book_id == book.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=409, detail="Déjà dans ta bibliothèque")

    # 4. Création de l'entrée user_book
    user_book = UserBooks(id=uuid4(), user_id=current_user.id,
                          book_id=book.id, status=status)
    db.add(user_book)
    db.commit()
    return {"message": "Livre ajouté ✅", "book_id": book.id}


async def get_books(db: Session, current_user: GetUser)-> list[GetBook] | list:
    res = (
        db.query(Books)
        .join(UserBooks, UserBooks.book_id == Books.id)   # ✅ jointure explicite
        .filter(UserBooks.user_id == current_user.id)
        .all()
    )
    if not res:
        return []
    return [GetBook.model_validate(r) for r in res]