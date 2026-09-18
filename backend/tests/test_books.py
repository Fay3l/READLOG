# test_books.py
from app.repositories.books import get_books
import pytest

@pytest.mark.asyncio
async def test_get_books_by_user_empty(db, make_user):
    # ARRANGE — un utilisateur sans aucun livre
    user = make_user(name="Bob")

    # ACT
    result = await get_books(db, user)
    # ASSERT
    assert result == []


@pytest.mark.asyncio
async def test_get_books_by_user_with_books(db, make_user, make_book, make_user_book):
    # ARRANGE — crée exactement les données dont CE test a besoin
    user  = make_user(name="Alice")
    book1 = make_book(title="Dune")
    book2 = make_book(title="1984", author="George Orwell")

    make_user_book(user, book1, status="reading")
    make_user_book(user, book2, status="finished", rating=5)

    # ACT
    result = await get_books(db,user)
    
    # ASSERT
    assert len(result) == 2


@pytest.mark.asyncio
async def test_get_books_ignores_other_users(db, make_user, make_book, make_user_book):
    # ARRANGE — vérifie l'isolation entre utilisateurs
    alice = make_user(name="Alice")
    bob   = make_user(name="Bob")
    book  = make_book(title="Dune")

    make_user_book(alice, book)  # seulement Alice a ce livre

    # ACT
    alice_books = await get_books(current_user=alice, db=db)
    bob_books   = await get_books(current_user=bob, db=db)

    # ASSERT
    
    assert len(alice_books) == 1
    assert len(bob_books) == 0