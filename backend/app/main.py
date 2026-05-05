
import os
from fastapi import FastAPI
from dotenv import load_dotenv
from database.db import DB

load_dotenv()

app = FastAPI()
DATABASE_URL = os.getenv('DATABASE_URL')
database = DB(DATABASE_URL)
print(database.connect())

@app.get("/")
async def root():
    return {"message": "Hello World"}