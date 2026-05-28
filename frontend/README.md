# 🥊 FightLog

Application web de suivi d'entraînement pour sports de combat.

## Stack technique

- **Backend** : FastAPI (Python 3.12)
- **Frontend** : React + Vite
- **Base de données SQL** : PostgreSQL 16
- **Base de données NoSQL** : MongoDB 7
- **Authentification** : JWT
- **Conteneurisation** : Docker + Docker Compose

## Lancer le projet

### Prérequis

- Docker Desktop installé et lancé
- Node.js 20+

### 1. Cloner le repo

```bash
git clone https://github.com/Amine19D/fightlog.git
cd fightlog
```

### 2. Créer le fichier .env

```bash
cp .env.example .env
```

### 3. Lancer les services (backend + bases de données)

```bash
docker compose up
```

### 4. Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Accéder à l'application

- **Frontend** : http://localhost:5173
- **API Swagger** : http://localhost:8000/docs

## Comptes de démonstration

| Email             | Mot de passe | Rôle    |
| ----------------- | ------------ | ------- |
| test@fightlog.com | Test1234     | athlete |

## Variables d'environnement

| Variable     | Description     |
| ------------ | --------------- |
| DATABASE_URL | URL PostgreSQL  |
| MONGO_URL    | URL MongoDB     |
| SECRET_KEY   | Clé secrète JWT |

## Architecture

- `backend/` — API FastAPI avec routers auth, séances, users, clubs, programmes
- `frontend/` — Application React avec pages Login, Dashboard, Séances, Profil
- `db/sql/` — Schéma PostgreSQL (tables, vues, triggers, procédures)
- `docker-compose.yml` — Orchestration des 4 services
