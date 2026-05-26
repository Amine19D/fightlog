from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, seances, users, clubs, programmes

app = FastAPI(
    title="FightLog API",
    description="API de suivi d'entraînement pour sports de combat",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(seances.router)
app.include_router(users.router)
app.include_router(clubs.router)
app.include_router(programmes.router)

@app.get("/")
async def root():
    return {"message": "FightLog API is running"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fightlog-backend"}