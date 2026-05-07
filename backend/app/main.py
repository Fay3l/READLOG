
import os
from fastapi import FastAPI # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # pyright: ignore[reportMissingImports]
from .routers import users,auth
from .database.db import DB
from .database.session import init_db
from .models.users import Users
from .models.books import Books
from .models.user_books import UserBooks
from .models.reading_reminders import ReadingReminders
from .models.quotes import Quotes
from .models.reading_notes import ReadingNotes


load_dotenv()

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.getenv('DATABASE_URL')
database = DB(DATABASE_URL)
database.connect()
init_db(database)
app.include_router(users.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}