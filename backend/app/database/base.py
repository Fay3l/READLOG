""" Base file"""
from sqlalchemy.orm import DeclarativeBase, MappedAsDataclass  # pyright: ignore[reportMissingImports]


class Base(DeclarativeBase, MappedAsDataclass):
    """Base Class"""
    pass
