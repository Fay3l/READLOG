
from fastapi import FastAPI
from database.db import DB

app = FastAPI()
DATABASE_URL = "sqlite:///example.db"
database = DB(DATABASE_URL)
print(database.connect())

@app.get("/")
async def root():
    return {"message": "Hello World"}