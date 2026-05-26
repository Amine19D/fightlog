from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.database import get_mongo
from app.core.security import decode_token
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

router = APIRouter(prefix="/seances", tags=["seances"])
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    return payload

@router.post("/", status_code=201)
async def create_seance(
    data: dict,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_mongo)
):
    data["utilisateur_id"] = int(current_user["sub"])
    data["date"] = datetime.utcnow()
    result = await db["seances"].insert_one(data)
    data["_id"] = str(result.inserted_id)
    return data

@router.get("/")
async def get_seances(
    sport: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_mongo)
):
    user_id = int(current_user["sub"])
    query = {"utilisateur_id": user_id}
    if sport:
        query["sport"] = sport
    
    skip = (page - 1) * limit
    cursor = db["seances"].find(query).skip(skip).limit(limit)
    seances = []
    async for s in cursor:
        s["_id"] = str(s["_id"])
        seances.append(s)
    
    total = await db["seances"].count_documents(query)
    return {"data": seances, "total": total, "page": page, "limit": limit}

@router.get("/search")
async def search_seances(
    q: str = Query(...),
    current_user: dict = Depends(get_current_user),
    db=Depends(get_mongo)
):
    user_id = int(current_user["sub"])
    cursor = db["seances"].find({
        "utilisateur_id": user_id,
        "$or": [
            {"notes": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}},
            {"sport": {"$regex": q, "$options": "i"}}
        ]
    })
    seances = []
    async for s in cursor:
        s["_id"] = str(s["_id"])
        seances.append(s)
    return {"data": seances, "query": q}

@router.get("/stats")
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db=Depends(get_mongo)
):
    user_id = int(current_user["sub"])
    pipeline = [
        {"$match": {"utilisateur_id": user_id}},
        {"$group": {
            "_id": "$sport",
            "total_seances": {"$sum": 1},
            "duree_totale": {"$sum": "$duree_minutes"},
            "ressenti_moyen": {"$avg": "$ressenti"}
        }},
        {"$sort": {"total_seances": -1}}
    ]
    cursor = db["seances"].aggregate(pipeline)
    stats = []
    async for s in cursor:
        stats.append(s)
    return {"stats": stats}

@router.get("/{seance_id}")
async def get_seance(
    seance_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_mongo)
):
    seance = await db["seances"].find_one({
        "_id": ObjectId(seance_id),
        "utilisateur_id": int(current_user["sub"])
    })
    if not seance:
        raise HTTPException(status_code=404, detail="Séance non trouvée")
    seance["_id"] = str(seance["_id"])
    return seance

@router.put("/{seance_id}")
async def update_seance(
    seance_id: str,
    data: dict,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_mongo)
):
    result = await db["seances"].update_one(
        {"_id": ObjectId(seance_id), "utilisateur_id": int(current_user["sub"])},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Séance non trouvée")
    return {"message": "Séance mise à jour"}

@router.delete("/{seance_id}", status_code=204)
async def delete_seance(
    seance_id: str,
    current_user: dict = Depends(get_current_user),
    db=Depends(get_mongo)
):
    result = await db["seances"].delete_one({
        "_id": ObjectId(seance_id),
        "utilisateur_id": int(current_user["sub"])
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Séance non trouvée")