import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import config
from app.database.session import init_engine
from app.models import books, quotes, reading_notes, reading_reminders, user_books, users  # noqa: F401  (enregistre les tables)
from app.routers import auth
from app.routers import books as books_router
from app.routers import users as users_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

# Le schéma de la base est géré par `python -m app.migrate` (lancé avant l'API), plus au démarrage.
init_engine(config.DATABASE_URL, echo=config.SQL_ECHO)

# Docs sous /api : en production, le site web et l'API partagent le même domaine
# (tout ce qui commence par /api va à l'API, le reste au site)
app = FastAPI(title="ReadLog API", docs_url="/api/docs", redoc_url=None, openapi_url="/api/openapi.json")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    # Le jeton voyage dans l'en-tête Authorization, pas dans un cookie : pas besoin de credentials
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(users_router.router)
app.include_router(books_router.router)


@app.get("/health", tags=["health"])
async def health():
    """Utilisé par l'hébergeur pour vérifier que l'API répond."""
    return {"status": "ok"}
