
import os
from fastapi import FastAPI
from dotenv import load_dotenv
from database.db import DB
from models.users import Users
from models.books import Books
from models.user_books import UserBooks
from models.reading_reminders import ReadingReminders
from models.quotes import Quotes
from models.reading_notes import ReadingNotes

load_dotenv()

app = FastAPI()
DATABASE_URL = os.getenv('DATABASE_URL')
database = DB(DATABASE_URL)
print(database.connect())

@app.get("/")
async def root():
    return {"message": "Hello World"}