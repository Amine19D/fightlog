from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
from app.routers.seances import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/programmes", tags=["programmes"])

class ProgrammeCreate(BaseModel):
    titre: str
    description: Optional[str] = None
    duree_semaines: int
    niveau: Optional[str] = None
    sport_id: Optional[int] = None

@router.get("/")
async def get_programmes(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(text("SELECT * FROM vue_programme_complet"))
    rows = result.fetchall()
    return {"programmes": [dict(r._mapping) for r in rows]}

@router.post("/", status_code=201)
async def create_programme(
    data: ProgrammeCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("""
            INSERT INTO programme (titre, description, duree_semaines, niveau, sport_id)
            VALUES (:titre, :description, :duree_semaines, :niveau, :sport_id)
            RETURNING *
        """),
        {
            "titre": data.titre,
            "description": data.description,
            "duree_semaines": data.duree_semaines,
            "niveau": data.niveau,
            "sport_id": data.sport_id
        }
    )
    await db.commit()
    row = result.fetchone()
    return dict(row._mapping)

@router.get("/{programme_id}")
async def get_programme(
    programme_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("SELECT * FROM vue_programme_complet WHERE programme_id = :id"),
        {"id": programme_id}
    )
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Programme non trouvé")
    return dict(row._mapping)

@router.put("/{programme_id}")
async def update_programme(
    programme_id: int,
    data: ProgrammeCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("""
            UPDATE programme
            SET titre = :titre, description = :description,
                duree_semaines = :duree_semaines, niveau = :niveau
            WHERE id = :id
            RETURNING *
        """),
        {
            "titre": data.titre,
            "description": data.description,
            "duree_semaines": data.duree_semaines,
            "niveau": data.niveau,
            "id": programme_id
        }
    )
    await db.commit()
    row = result.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Programme non trouvé")
    return dict(row._mapping)

@router.delete("/{programme_id}", status_code=204)
async def delete_programme(
    programme_id: int,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("DELETE FROM programme WHERE id = :id RETURNING id"),
        {"id": programme_id}
    )
    await db.commit()
    if not result.fetchone():
        raise HTTPException(status_code=404, detail="Programme non trouvé")