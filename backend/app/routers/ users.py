from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.database import get_db, get_mongo
from app.models.utilisateur import Utilisateur
from app.schemas.utilisateur import UtilisateurResponse
from app.routers.seances import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/users", tags=["users"])

class UpdateUserRequest(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    poids_kg: Optional[float] = None

@router.get("/me", response_model=UtilisateurResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Utilisateur).where(Utilisateur.id == int(current_user["sub"]))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

@router.put("/me", response_model=UtilisateurResponse)
async def update_me(
    data: UpdateUserRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Utilisateur).where(Utilisateur.id == int(current_user["sub"]))
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    if data.nom: user.nom = data.nom
    if data.prenom: user.prenom = data.prenom
    if data.poids_kg: user.poids_kg = data.poids_kg
    
    await db.commit()
    await db.refresh(user)
    return user

@router.get("/{user_id}/stats")
async def get_user_stats(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    mongo=Depends(get_mongo)
):
    result = await db.execute(
        select(Utilisateur).where(Utilisateur.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    pipeline = [
        {"$match": {"utilisateur_id": user_id}},
        {"$group": {
            "_id": "$sport",
            "total_seances": {"$sum": 1},
            "duree_totale": {"$sum": "$duree_minutes"},
            "ressenti_moyen": {"$avg": "$ressenti"}
        }}
    ]
    cursor = mongo["seances"].aggregate(pipeline)
    stats_nosql = []
    async for s in cursor:
        stats_nosql.append(s)

    competitions = await db.execute(
        text("SELECT COUNT(*) FROM participation WHERE utilisateur_id = :uid"),
        {"uid": user_id}
    )
    nb_competitions = competitions.scalar()

    return {
        "utilisateur": {
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "role": user.role
        },
        "stats_entrainement": stats_nosql,
        "nb_competitions": nb_competitions
    }

@router.get("/{user_id}/competitions")
async def get_user_competitions(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("""
            SELECT c.nom, c.date, c.lieu, p.resultat, p.categorie_poids, s.nom as sport
            FROM participation p
            JOIN competition c ON c.id = p.competition_id
            JOIN sport s ON s.id = c.sport_id
            WHERE p.utilisateur_id = :uid
            ORDER BY c.date DESC
        """),
        {"uid": user_id}
    )
    rows = result.fetchall()
    return {"competitions": [dict(r._mapping) for r in rows]}