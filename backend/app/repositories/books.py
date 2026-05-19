from http.client import HTTPException

from sqlalchemy.orm import Session
from app.models.books import Books
from app.services.google_books import get_book_by_id


async def add_book(db:Session, google_books_id:str ,status: str = "to_read"):
    book = db.query(Books).filter(Books.google_books_id == google_books_id).first()
    if not book:
        data = await get_book_by_id(google_books_id)
        if not data:
            raise HTTPException(status_code=404, detail="Livre introuvable")
        book = Books(**data.model_dump())
        db.add(book)
        db.flush()  # pour avoir l'id avant le commit

    # 3. L'utilisateur l'a-t-il déjà ajouté ?
    existing = db.query(UserBook).filter(
        UserBook.user_id == current_user.id,
        UserBook.book_id == book.id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Déjà dans ta bibliothèque")

    # 4. Création de l'entrée user_book
    user_book = UserBook(user_id=current_user.id, book_id=book.id, status=status)
    db.add(user_book)
    db.commit()
    return { "message": "Livre ajouté ✅", "book_id": book.id }