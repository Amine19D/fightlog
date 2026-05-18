-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table SPORT
CREATE TABLE sport (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    categorie VARCHAR(100) NOT NULL
);

-- Table CLUB
CREATE TABLE club (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    telephone VARCHAR(20)
);

-- Table UTILISATEUR
CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    poids_kg DECIMAL(5,2),
    role VARCHAR(20) DEFAULT 'athlete' CHECK (role IN ('athlete', 'coach', 'admin')),
    nb_competitions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table COACH
CREATE TABLE coach (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT UNIQUE NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    specialite VARCHAR(150),
    certification VARCHAR(150),
    club_id INT REFERENCES club(id)
);

-- Table INSCRIPTION (utilisateur <-> club)
CREATE TABLE inscription (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    club_id INT NOT NULL REFERENCES club(id) ON DELETE CASCADE,
    date_inscription DATE DEFAULT CURRENT_DATE,
    UNIQUE(utilisateur_id, club_id)
);

-- Table ATHLETE_SPORT (utilisateur <-> sport)
CREATE TABLE athlete_sport (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    sport_id INT NOT NULL REFERENCES sport(id) ON DELETE CASCADE,
    niveau VARCHAR(50) DEFAULT 'débutant',
    UNIQUE(utilisateur_id, sport_id)
);

-- Table PROGRAMME
CREATE TABLE programme (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    duree_semaines INT NOT NULL,
    niveau VARCHAR(50),
    sport_id INT REFERENCES sport(id),
    coach_id INT REFERENCES coach(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table COMPETITION
CREATE TABLE competition (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    lieu VARCHAR(200),
    sport_id INT REFERENCES sport(id),
    niveau VARCHAR(100)
);

-- Table PARTICIPATION
CREATE TABLE participation (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    competition_id INT NOT NULL REFERENCES competition(id) ON DELETE CASCADE,
    resultat VARCHAR(50),
    categorie_poids VARCHAR(50),
    UNIQUE(utilisateur_id, competition_id)
);

-- Index manuel (exigé par le sujet)
CREATE INDEX idx_participation_user ON participation(utilisateur_id, competition_id);
CREATE INDEX idx_seance_user_date ON athlete_sport(utilisateur_id, sport_id);

-- VUE 1 : résumé par athlète
CREATE VIEW vue_athlete_resume AS
SELECT
    u.id,
    u.nom,
    u.prenom,
    u.email,
    COUNT(DISTINCT i.club_id) AS nb_clubs,
    COUNT(DISTINCT ats.sport_id) AS nb_sports,
    u.nb_competitions
FROM utilisateur u
LEFT JOIN inscription i ON i.utilisateur_id = u.id
LEFT JOIN athlete_sport ats ON ats.utilisateur_id = u.id
GROUP BY u.id, u.nom, u.prenom, u.email, u.nb_competitions;

-- VUE 2 : programme complet avec coach
CREATE VIEW vue_programme_complet AS
SELECT
    p.id AS programme_id,
    p.titre,
    p.duree_semaines,
    p.niveau,
    s.nom AS sport,
    u.nom AS coach_nom,
    u.prenom AS coach_prenom,
    p.created_at
FROM programme p
LEFT JOIN sport s ON s.id = p.sport_id
LEFT JOIN coach c ON c.id = p.coach_id
LEFT JOIN utilisateur u ON u.id = c.utilisateur_id;

-- TRIGGER 1 : incrémenter nb_competitions après inscription
CREATE OR REPLACE FUNCTION increment_nb_competitions()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE utilisateur
    SET nb_competitions = nb_competitions + 1
    WHERE id = NEW.utilisateur_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_competitions
AFTER INSERT ON participation
FOR EACH ROW
EXECUTE FUNCTION increment_nb_competitions();

-- TRIGGER 2 : archiver utilisateur avant suppression
CREATE TABLE utilisateurs_archives (
    id INT,
    email VARCHAR(255),
    nom VARCHAR(100),
    prenom VARCHAR(100),
    archive_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION archiver_utilisateur()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO utilisateurs_archives(id, email, nom, prenom)
    VALUES (OLD.id, OLD.email, OLD.nom, OLD.prenom);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_archiver_utilisateur
BEFORE DELETE ON utilisateur
FOR EACH ROW
EXECUTE FUNCTION archiver_utilisateur();

-- PROCEDURE 1 : inscrire un athlète à un club
CREATE OR REPLACE PROCEDURE inscrire_athlete_club(
    p_user_id INT,
    p_club_id INT
)
LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM inscription
        WHERE utilisateur_id = p_user_id AND club_id = p_club_id
    ) THEN
        RAISE EXCEPTION 'Athlète déjà inscrit dans ce club';
    END IF;
    INSERT INTO inscription(utilisateur_id, club_id)
    VALUES (p_user_id, p_club_id);
END;
$$;

-- PROCEDURE 2 : inscrire à une compétition avec transaction
CREATE OR REPLACE PROCEDURE inscrire_competition(
    p_user_id INT,
    p_competition_id INT,
    p_categorie_poids VARCHAR
)
LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        INSERT INTO participation(utilisateur_id, competition_id, categorie_poids)
        VALUES (p_user_id, p_competition_id, p_categorie_poids);
    EXCEPTION WHEN unique_violation THEN
        RAISE EXCEPTION 'Déjà inscrit à cette compétition';
    END;
END;
$$;

-- PROCEDURE 3 : stats compétitions d'un utilisateur
CREATE OR REPLACE PROCEDURE stats_competitions(p_user_id INT)
LANGUAGE plpgsql AS $$
DECLARE
    v_total INT;
    v_victoires INT;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM participation WHERE utilisateur_id = p_user_id;

    SELECT COUNT(*) INTO v_victoires
    FROM participation
    WHERE utilisateur_id = p_user_id AND resultat = 'victoire';

    RAISE NOTICE 'Total: %, Victoires: %', v_total, v_victoires;
END;
$$;

-- DONNEES DE DEMO
INSERT INTO sport(nom, categorie) VALUES
('Boxe anglaise', 'frappe'),
('MMA', 'mixte'),
('Judo', 'grappling'),
('Muay Thai', 'frappe'),
('Jiu-Jitsu Brésilien', 'grappling');

INSERT INTO club(nom, adresse, ville, telephone) VALUES
('Fight Academy Paris', '12 rue des Sports', 'Paris', '0145678901'),
('MMA Club Lyon', '5 avenue des Champions', 'Lyon', '0478901234'),
('Dojo Sakura', '8 rue du Judo', 'Marseille', '0491234567');

INSERT INTO utilisateur(email, mot_de_passe_hash, nom, prenom, date_naissance, poids_kg, role) VALUES
('admin@fightlog.com', '$2b$12$placeholder_hash_admin', 'Admin', 'FightLog', '1990-01-01', 80.0, 'admin'),
('coach@fightlog.com', '$2b$12$placeholder_hash_coach', 'Dupont', 'Marc', '1985-06-15', 75.5, 'coach'),
('athlete@fightlog.com', '$2b$12$placeholder_hash_user', 'Martin', 'Lucas', '2000-03-22', 70.0, 'athlete'),
('sarah@fightlog.com', '$2b$12$placeholder_hash_sarah', 'Bernard', 'Sarah', '1998-11-10', 60.0, 'athlete');

INSERT INTO competition(nom, date, lieu, sport_id, niveau) VALUES
('Championnat Paris Boxe 2025', '2025-11-15', 'Paris', 1, 'régional'),
('Open MMA Ile-de-France', '2025-12-01', 'Créteil', 2, 'national'),
('Tournoi Judo Lyon', '2026-01-20', 'Lyon', 3, 'régional');