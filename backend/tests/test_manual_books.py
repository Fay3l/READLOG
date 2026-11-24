"""Livres saisis à la main et recherche dans la base locale."""

import logging
import re
from unittest.mock import AsyncMock, patch

import httpx

from app.schemas.book import BookResult


def _auth(client, caplog, name):
    email = f"{name}@readlog.app"
    with caplog.at_level(logging.WARNING):
        client.post("/api/signup", json={"name": name, "email": email, "password": "motdepasse-solide"})
    # on cible la ligne du code : les logs contiennent aussi d'autres nombres (requêtes HTTP...)
    code = re.search(rf"{re.escape(email)} : (\d{{6}})", caplog.text).group(1)
    caplog.clear()
    res = client.post("/api/verify-email", params={"email": email, "code": code})
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


GOOGLE_EMPTY = patch("app.routers.books.search_books", AsyncMock(return_value=[]))


def test_manual_book_is_added_to_library_and_searchable(client, caplog):
    headers = _auth(client, caplog, "manon")
    book = {
        "title": "Les Contes de ma grand-mère",
        "author": "Jeanne Martin",
        "isbn": "978-2-1234-5678-9",
        "page_count": 120,
        "status": "reading",
    }
    assert client.post("/api/books/manual", json=book, headers=headers).status_code == 201

    library = client.get("/api/users/books", headers=headers).json()
    added = next(b for b in library if b["title"] == book["title"])
    assert added["google_books_id"].startswith("local-")
    assert added["isbn"] == "9782123456789"  # tirets retirés
    assert added["status"] == "reading"

    with GOOGLE_EMPTY:
        by_title = client.get("/api/books/search", params={"q": "contes de ma"}, headers=headers)
        by_isbn = client.get("/api/books/search", params={"q": "9782123456789"}, headers=headers)
    assert [b["title"] for b in by_title.json()] == [book["title"]]
    assert [b["title"] for b in by_isbn.json()] == [book["title"]]


def test_same_isbn_reuses_existing_book(client, caplog):
    first, second = _auth(client, caplog, "paul"), _auth(client, caplog, "zoe")
    book = {"title": "Recueil", "author": "Anonyme", "isbn": "2123456780"}
    client.post("/api/books/manual", json=book, headers=first)
    client.post("/api/books/manual", json={**book, "title": "Recueil (doublon)"}, headers=second)
    with GOOGLE_EMPTY:
        results = client.get("/api/books/search", params={"q": "Recueil"}, headers=first).json()
    assert len(results) == 1  # pas de doublon dans la table books


def test_manual_book_validation(client, caplog):
    headers = _auth(client, caplog, "hugo")
    assert client.post("/api/books/manual", json={"title": "", "author": "X"}, headers=headers).status_code == 422
    bad_isbn = {"title": "T", "author": "A", "isbn": "123"}
    assert client.post("/api/books/manual", json=bad_isbn, headers=headers).status_code == 422


def test_search_survives_google_outage(client, caplog):
    headers = _auth(client, caplog, "ines")
    client.post("/api/books/manual", json={"title": "Carnet de voyage", "author": "Ines"}, headers=headers)
    with patch("app.routers.books.search_books", AsyncMock(side_effect=httpx.ConnectTimeout("timeout"))):
        res = client.get("/api/books/search", params={"q": "carnet"}, headers=headers)
    assert res.status_code == 200 and res.json()[0]["title"] == "Carnet de voyage"


def test_search_merges_without_duplicates(client, caplog):
    headers = _auth(client, caplog, "leo")
    client.post("/api/books/manual", json={"title": "Zyxwa (édition locale)", "author": "F. H."}, headers=headers)
    google = [BookResult(google_books_id="g1", title="Zyxwa", author="Auteur")]
    with patch("app.routers.books.search_books", AsyncMock(return_value=google)):
        # titre unique : la base de test est partagée entre tous les tests
        results = client.get("/api/books/search", params={"q": "zyxwa"}, headers=headers).json()
    assert [b["google_books_id"][:6] for b in results] == ["local-", "g1"]


def test_like_wildcards_are_escaped(client, caplog):
    headers = _auth(client, caplog, "nina")
    client.post("/api/books/manual", json={"title": "Un livre", "author": "Quelqu'un"}, headers=headers)
    with GOOGLE_EMPTY:
        res = client.get("/api/books/search", params={"q": "%%"}, headers=headers)
    assert res.status_code == 404  # "%" est cherché tel quel, pas comme joker "tout"
