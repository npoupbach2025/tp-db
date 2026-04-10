-- ============================================================
-- Étape 4 — Schéma physique : Création de la base de données
-- Projet : Plateforme de gestion des concours de dessins
-- CNAM-ESAIP 2025-2026
-- ============================================================

DROP DATABASE IF EXISTS concours_dessins;
CREATE DATABASE concours_dessins CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE concours_dessins;

-- ============================================================
-- TABLE : CLUB
-- ============================================================
CREATE TABLE CLUB (
    numClub INT AUTO_INCREMENT,
    nomClub VARCHAR(100) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    numTelephone VARCHAR(20),
    nombreAdherents INT DEFAULT 0,
    ville VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    dateCreation DATE,
    PRIMARY KEY (numClub)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : UTILISATEUR
-- ============================================================
CREATE TABLE UTILISATEUR (
    numUtilisateur INT AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse VARCHAR(255),
    login VARCHAR(50) NOT NULL UNIQUE,
    motDePasse VARCHAR(255) NOT NULL,
    email VARCHAR(150),
    dateNaissance DATE,
    numClub INT NOT NULL,
    PRIMARY KEY (numUtilisateur),
    FOREIGN KEY (numClub) REFERENCES CLUB(numClub)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : ADMINISTRATEUR (héritage de UTILISATEUR)
-- ============================================================
CREATE TABLE ADMINISTRATEUR (
    numUtilisateur INT,
    dateDebut DATE NOT NULL,
    PRIMARY KEY (numUtilisateur),
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : DIRECTEUR (héritage de UTILISATEUR)
-- ============================================================
CREATE TABLE DIRECTEUR (
    numUtilisateur INT,
    dateDebut DATE NOT NULL,
    numClub INT NOT NULL,
    PRIMARY KEY (numUtilisateur),
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur),
    FOREIGN KEY (numClub) REFERENCES CLUB(numClub)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : PRESIDENT (héritage de UTILISATEUR)
-- ============================================================
CREATE TABLE PRESIDENT (
    numUtilisateur INT,
    prime DECIMAL(10,2) DEFAULT 0.00,
    dateElection DATE,
    PRIMARY KEY (numUtilisateur),
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : COMPETITEUR (héritage de UTILISATEUR)
-- ============================================================
CREATE TABLE COMPETITEUR (
    numUtilisateur INT,
    datePremiereParticipation DATE,
    categorie VARCHAR(50) DEFAULT 'senior',
    PRIMARY KEY (numUtilisateur),
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : EVALUATEUR (héritage de UTILISATEUR)
-- ============================================================
CREATE TABLE EVALUATEUR (
    numUtilisateur INT,
    specialite VARCHAR(100) NOT NULL,
    niveau VARCHAR(50) DEFAULT 'intermediaire',
    experience INT DEFAULT 0,
    PRIMARY KEY (numUtilisateur),
    FOREIGN KEY (numUtilisateur) REFERENCES UTILISATEUR(numUtilisateur)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : CONCOURS
-- ============================================================
CREATE TABLE CONCOURS (
    numConcours INT AUTO_INCREMENT,
    theme VARCHAR(200) NOT NULL,
    dateDebut DATE NOT NULL,
    dateFin DATE NOT NULL,
    etat ENUM('pas_commence','en_cours','attente','resultat','evalue') NOT NULL DEFAULT 'pas_commence',
    description TEXT,
    nbMaxDessinsParCompetiteur INT DEFAULT 3,
    nbMinClubs INT DEFAULT 6,
    numPresident INT NOT NULL,
    PRIMARY KEY (numConcours),
    FOREIGN KEY (numPresident) REFERENCES PRESIDENT(numUtilisateur)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : PARTICIPATION_CLUB_CONCOURS (N:N Club-Concours)
-- ============================================================
CREATE TABLE PARTICIPATION_CLUB_CONCOURS (
    numClub INT,
    numConcours INT,
    PRIMARY KEY (numClub, numConcours),
    FOREIGN KEY (numClub) REFERENCES CLUB(numClub),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : INSCRIPTION_COMPETITEUR_CONCOURS (N:N Compétiteur-Concours)
-- ============================================================
CREATE TABLE INSCRIPTION_COMPETITEUR_CONCOURS (
    numCompetiteur INT,
    numConcours INT,
    PRIMARY KEY (numCompetiteur, numConcours),
    FOREIGN KEY (numCompetiteur) REFERENCES COMPETITEUR(numUtilisateur),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : INSCRIPTION_EVALUATEUR_CONCOURS (N:N Évaluateur-Concours)
-- ============================================================
CREATE TABLE INSCRIPTION_EVALUATEUR_CONCOURS (
    numEvaluateur INT,
    numConcours INT,
    PRIMARY KEY (numEvaluateur, numConcours),
    FOREIGN KEY (numEvaluateur) REFERENCES EVALUATEUR(numUtilisateur),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : DESSIN
-- ============================================================
CREATE TABLE DESSIN (
    numDessin INT AUTO_INCREMENT,
    commentaire TEXT,
    classement INT DEFAULT NULL,
    dateRemise DATE NOT NULL,
    leDessin VARCHAR(255),
    titre VARCHAR(200) NOT NULL,
    numCompetiteur INT NOT NULL,
    numConcours INT NOT NULL,
    PRIMARY KEY (numDessin),
    FOREIGN KEY (numCompetiteur) REFERENCES COMPETITEUR(numUtilisateur),
    FOREIGN KEY (numConcours) REFERENCES CONCOURS(numConcours)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : EVALUATION (classe d'association Évaluateur-Dessin)
-- ============================================================
CREATE TABLE EVALUATION (
    numEvaluateur INT,
    numDessin INT,
    dateEvaluation DATE NOT NULL,
    note INT NOT NULL CHECK (note >= 0 AND note <= 20),
    commentaire TEXT,
    appreciation VARCHAR(50),
    PRIMARY KEY (numEvaluateur, numDessin),
    FOREIGN KEY (numEvaluateur) REFERENCES EVALUATEUR(numUtilisateur),
    FOREIGN KEY (numDessin) REFERENCES DESSIN(numDessin)
) ENGINE=InnoDB;
