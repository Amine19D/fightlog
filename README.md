# FightLog

Application web de suivi d entrainement pour sports de combat.

## Stack technique

- Backend : FastAPI (Python 3.12)
- Frontend : React + Vite
- Base de donnees SQL : PostgreSQL 16
- Base de donnees NoSQL : MongoDB 7
- Authentification : JWT
- Conteneurisation : Docker + Docker Compose

## Lancer le projet

### 1. Cloner le repo
git clone https://github.com/Amine19D/fightlog.git
cd fightlog

### 2. Lancer les services
docker compose up

### 3. Lancer le frontend
cd frontend
npm install
npm run dev

### 4. Acces
- Frontend : http://localhost:5173
- API Swagger : http://localhost:8000/docs

## Comptes de demonstration

- Email : test@fightlog.com
- Mot de passe : Test1234
- Role : athlete

## Structure

- backend/ : API FastAPI
- frontend/ : Application React
- db/sql/ : Schema PostgreSQL
- docker-compose.yml : Orchestration des services
