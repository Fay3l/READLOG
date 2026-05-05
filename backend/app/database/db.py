""" DB File """
from sqlalchemy import create_engine, text, inspect  # pyright: ignore[reportMissingImports]
from sqlalchemy.engine import Engine  # pyright: ignore[reportMissingImports]
from sqlalchemy.exc import OperationalError # pyright: ignore[reportMissingImports]
from sqlalchemy.orm import Session # pyright: ignore[reportMissingImports]
from .base import Base


class DB:
    """ DATABASE """
    url: str
    engine: Engine
    session: Session

    def __init__(self, url: str):
        self.url = url
        self.engine = None
        self.session = None

    def connect(self) -> bool:
        """ Connect TO DB """
        try:
            self.engine = create_engine(self.url, echo=True)
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            self.session = Session(self.engine)
            Base.metadata.create_all(self.engine)
            inspector = inspect(self.engine)
            print(inspector.get_table_names())
            print("Connection Sucessfully")
            return True

        except OperationalError as e:
            print(f"Erreur connection : {e}")
            return False
