-- ============================================================
-- SCHEMA SQLite3 — Concours de Dessins Inter-Clubs
-- Adapté depuis MySQL vers SQLite3
-- ============================================================

PRAGMA foreign_keys = ON;

-- TABLE : CLUB
CREATE TABLE IF NOT EXISTS CLUB (
    numClub INTEGER PRIMARY KEY AUTOINCREMENT,
    nomClub TEXT NOT NULL,
    adresse TEXT NOT NULL,
    numTelephone TEXT,
    nombreAdherents INTEGER DEFAULT 0,
    ville TEXT NOT NULL,
    departement TEXT NOT NULL,
    region TEXT NOT NULL,
    dateCreation TEXT
);

-- TABLE : UTILISATEUR
CREATE TABLE IF NOT EXISTS UTILISATEUR (
    numUtilisateur INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    adresse TEXT,
    login TEXT NOT NULL UNIQUE,
    motDePasse TEXT NOT NULL,
    email TEXT,
    dateNaissance TEXT,
    numClub INTEGER,
    FOREIGN KEY (numClub) REFERENCES CLUB(numClub)
);

-- TABLE : ADMINISTRATEUR
CREATE TABLE IF NOT EXISTS ADMINISTRATEUR (
    numUtilisateur INTEGER PRIMARY KEY,
    dateDebut TEXT,
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
);

-- TABLE : DIRECTEUR
CREATE TABLE IF NOT EXISTS DIRECTEUR (
    numUtilisateur INTEGER PRIMARY KEY,
    dateDebut TEXT,
    numClub INTEGER,
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur),
    FOREIGN KEY (numClub) REFERENCES CLUB(numClub)
);

-- TABLE : PRESIDENT
CREATE TABLE IF NOT EXISTS PRESIDENT (
    numUtilisateur INTEGER PRIMARY KEY,
    prime REAL,
    dateElection TEXT,
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
);

-- TABLE : COMPETITEUR
CREATE TABLE IF NOT EXISTS COMPETITEUR (
    numUtilisateur INTEGER PRIMARY KEY,
    datePremiereParticipation TEXT,
    categorie TEXT CHECK(categorie IN ('junior', 'senior', 'pro')),
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
);

-- TABLE : EVALUATEUR
CREATE TABLE IF NOT EXISTS EVALUATEUR (
    numUtilisateur INTEGER PRIMARY KEY,
    specialite TEXT,
    niveau TEXT CHECK(niveau IN ('debutant', 'intermediaire', 'avance', 'expert')),
    experience INTEGER,
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
);

-- TABLE : CONCOURS
CREATE TABLE IF NOT EXISTS CONCOURS (
    numConcours INTEGER PRIMARY KEY AUTOINCREMENT,
    theme TEXT NOT NULL,
    dateDebut TEXT NOT NULL,
    dateFin TEXT NOT NULL,
    etat TEXT CHECK(etat IN ('pas_commence', 'en_cours', 'attente', 'resultat', 'evalue')) DEFAULT 'pas_commence',
    description TEXT,
    nbMaxDessinsParCompetiteur INTEGER DEFAULT 3,
    nbMinClubs INTEGER DEFAULT 6,
    numPresident INTEGER,
    FOREIGN KEY (numPresident) REFERENCES PRESIDENT(numUtilisateur)
);

-- TABLE : PARTICIPATION_CLUB_CONCOURS
CREATE TABLE IF NOT EXISTS PARTICIPATION_CLUB_CONCOURS (
    numClub INTEGER,
    numConcours INTEGER,
    PRIMARY KEY (numClub, numConcours),
    FOREIGN KEY (numClub) REFERENCES CLUB(numClub),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
);

-- TABLE : INSCRIPTION_COMPETITEUR_CONCOURS
CREATE TABLE IF NOT EXISTS INSCRIPTION_COMPETITEUR_CONCOURS (
    numCompetiteur INTEGER,
    numConcours INTEGER,
    PRIMARY KEY (numCompetiteur, numConcours),
    FOREIGN KEY (numCompetiteur) REFERENCES COMPETITEUR(numUtilisateur),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
);

-- TABLE : INSCRIPTION_EVALUATEUR_CONCOURS
CREATE TABLE IF NOT EXISTS INSCRIPTION_EVALUATEUR_CONCOURS (
    numEvaluateur INTEGER,
    numConcours INTEGER,
    PRIMARY KEY (numEvaluateur, numConcours),
    FOREIGN KEY (numEvaluateur) REFERENCES EVALUATEUR(numUtilisateur),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
);

-- TABLE : DESSIN
CREATE TABLE IF NOT EXISTS DESSIN (
    numDessin INTEGER PRIMARY KEY AUTOINCREMENT,
    commentaire TEXT,
    classement INTEGER,
    dateRemise TEXT,
    leDessin TEXT,
    titre TEXT,
    numCompetiteur INTEGER NOT NULL,
    numConcours INTEGER NOT NULL,
    FOREIGN KEY (numCompetiteur) REFERENCES COMPETITEUR(numUtilisateur),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
);

-- TABLE : AFFECTATION_JURY
CREATE TABLE IF NOT EXISTS AFFECTATION_JURY (
    numDessin INTEGER,
    numEvaluateur INTEGER,
    dateAffectation TEXT,
    PRIMARY KEY (numDessin, numEvaluateur),
    FOREIGN KEY (numDessin) REFERENCES DESSIN(numDessin),
    FOREIGN KEY (numEvaluateur) REFERENCES EVALUATEUR(numUtilisateur)
);

-- TABLE : EVALUATION
CREATE TABLE IF NOT EXISTS EVALUATION (
    numEvaluateur INTEGER,
    numDessin INTEGER,
    dateEvaluation TEXT,
    note INTEGER CHECK(note >= 0 AND note <= 20),
    commentaire TEXT,
    appreciation TEXT CHECK(appreciation IN ('insuffisant', 'passable', 'bien', 'tres_bien', 'excellent')),
    PRIMARY KEY (numEvaluateur, numDessin),
    FOREIGN KEY (numEvaluateur) REFERENCES EVALUATEUR(numUtilisateur),
    FOREIGN KEY (numDessin) REFERENCES DESSIN(numDessin)
);
