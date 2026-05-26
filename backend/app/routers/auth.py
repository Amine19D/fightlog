from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.utilisateur import Utilisateur
from app.schemas.utilisateur import RegisterRequest, LoginRequest, TokenResponse, UtilisateurResponse
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UtilisateurResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Utilisateur).where(Utilisateur.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email déjà utilisé")
    
    user = Utilisateur(
        email=data.email,
        mot_de_passe_hash=hash_password(data.password),
        nom=data.nom,
        prenom=data.prenom,
        date_naissance=data.date_naissance,
        poids_kg=data.poids_kg,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Utilisateur).where(Utilisateur.email == data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(data.password, user.mot_de_passe_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}