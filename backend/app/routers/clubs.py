from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.database import get_db
from app.routers.seances import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/clubs", tags=["clubs"])

class ClubCreate(BaseModel):
    nom: str
    adresse: str
    ville: str
    telephone: str

@router.get("/")
async def get_clubs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(text("SELECT * FROM club"))
    rows = result.fetchall()
    return {"clubs": [dict(r._mapping) for r in rows]}

@router.post("/", status_code=201)
async def create_club(
    data: ClubCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("INSERT INTO club (nom, adresse, ville, telephone) VALUES (:nom, :adresse, :ville, :telephone) RETURNING *"),
        {"nom": data.nom, "adresse": data.adresse, "ville": data.ville, "telephone": data.telephone}
    )
    await db.commit()
    row = result.fetchone()
    return dict(row._mapping)

@router.post("/{club_id}/rejoindre", status_code=201)
async def rejoindre_club(
    club_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = int(current_user["sub"])
    try:
        await db.execute(
            text("CALL inscrire_athlete_club(:user_id, :club_id)"),
            {"user_id": user_id, "club_id": club_id}
        )
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=409, detail=str(e))
    return {"message": "Inscription au club réussie"}

@router.get("/{club_id}")
async def get_club(club_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT * FROM club WHERE id = :id"),
        {"id": club_id}
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Club non trouvé")
    return dict(row._mapping)