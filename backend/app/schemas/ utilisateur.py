from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nom: str
    prenom: str
    date_naissance: Optional[date] = None
    poids_kg: Optional[float] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UtilisateurResponse(BaseModel):
    id: int
    email: str
    nom: str
    prenom: str
    role: str

    class Config:
        from_attributes = True