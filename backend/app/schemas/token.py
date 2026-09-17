from pydantic import BaseModel, ConfigDict # type: ignore

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

class GetVerifyUser(BaseModel):
    model_config =  ConfigDict(from_attributes=True)
    name:str
    password_hashed:str