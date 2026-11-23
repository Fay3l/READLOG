import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import config
from app.database.base import Base
from app.database.session import init_engine
from app.models import books, quotes, reading_notes, reading_reminders, user_books, users  # noqa: F401  (enregistre les tables)
from app.routers import auth
from app.routers import books as books_router
from app.routers import users as users_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

engine = init_engine(config.DATABASE_URL, echo=config.SQL_ECHO)


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Crée les tables manquantes (utile sur une base neuve). Les évolutions de schéma
    # d'une base existante passent par Alembic : `alembic upgrade head`.
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="ReadLog API", lifespan=lifespan)

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
