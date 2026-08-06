import os
import httpx
from app.schemas.book import BookResult

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"
API_KEY = os.getenv('GOOGLE_BOOKS_API_KEY')


def _parse_item(item: dict) -> BookResult | None:
    """"Parser un item de l'API Google Books en un BookResult """
    info = item.get("volumeInfo", {})
    title = info.get("title")
    if not title:
        return None  # on ignore les résultats sans titre

    # Couverture — on force HTTPS (Google renvoie HTTP)
    cover = info.get("imageLinks", {}).get("thumbnail")
    if cover:
        cover = cover.replace("http://", "https://")

    # ISBN 13 en priorité, sinon ISBN 10
    identifiers = info.get("industryIdentifiers", [])
    isbn = next((i["identifier"] for i in identifiers
                 if i["type"] == "ISBN_13"), None)
    isbn = isbn or next((i["identifier"] for i in identifiers
                         if i["type"] == "ISBN_10"), None)

    return BookResult(
        google_books_id=item["id"],
        title=title,
        author=", ".join(info.get("authors", ["Auteur inconnu"])),
        cover_url=cover,
        description=info.get("description"),
        page_count=info.get("pageCount"),
        isbn=isbn,
        published_year=info.get("publishedDate", "")[:4] or None,
        publisher=info.get("publisher"),
        genre=info.get("categories", [None])[0],  # premier élément ou None
    )


async def search_books(query: str, max_results: int = 10) -> list[BookResult]:
    """Recherche texte libre ou ISBN"""
    params = {
        "q": query,
        "maxResults": max_results,
        "printType": "books",
        "key": API_KEY,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(GOOGLE_BOOKS_URL, params=params, timeout=5.0)
        response.raise_for_status()

    items = response.json().get("items", [])
    print(f"Google Books API: {items} résultats pour '{query}'")
    results = [_parse_item(item) for item in items]
    return [r for r in results if r is not None]


async def get_book_by_id(google_books_id: str) -> BookResult | None:
    """Récupérer un seul livre par ID"""
    url = f"{GOOGLE_BOOKS_URL}/{google_books_id}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params={"key": API_KEY}, timeout=5.0)
        if response.status_code == 404:
            return None
        response.raise_for_status()
    return _parse_item(response.json())
