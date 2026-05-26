from sqlalchemy import Column, Integer, String, Date, Numeric, DateTime, func
from app.database import Base

class Utilisateur(Base):
    __tablename__ = "utilisateur"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    mot_de_passe_hash = Column(String(255), nullable=False)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    date_naissance = Column(Date, nullable=True)
    poids_kg = Column(Numeric(5, 2), nullable=True)
    role = Column(String(20), default="athlete")
    nb_competitions = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())