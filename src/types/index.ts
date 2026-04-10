// Types for the Drawing Contest Management Application

export interface Club {
  numClub: number;
  nomClub: string;
  adresse: string;
  numTelephone: string;
  nombreAdherents: number;
  ville: string;
  departement: string;
  region: string;
  dateCreation: string;
}

export interface Utilisateur {
  numUtilisateur: number;
  nom: string;
  prenom: string;
  adresse: string;
  login: string;
  motDePasse: string;
  email: string;
  dateNaissance: string;
  numClub: number;
}

export type RoleType = 'administrateur' | 'directeur' | 'president' | 'competiteur' | 'evaluateur';

export interface Administrateur {
  numUtilisateur: number;
  dateDebut: string;
}

export interface Directeur {
  numUtilisateur: number;
  dateDebut: string;
  numClub: number;
}

export interface President {
  numUtilisateur: number;
  prime: number;
  dateElection: string;
}

export interface Competiteur {
  numUtilisateur: number;
  datePremiereParticipation: string;
  categorie: 'junior' | 'senior' | 'pro';
}

export interface Evaluateur {
  numUtilisateur: number;
  specialite: string;
  niveau: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  experience: number;
}

export type EtatConcours = 'pas_commence' | 'en_cours' | 'attente' | 'resultat' | 'evalue';

export interface Concours {
  numConcours: number;
  theme: string;
  dateDebut: string;
  dateFin: string;
  etat: EtatConcours;
  description: string;
  nbMaxDessinsParCompetiteur: number;
  nbMinClubs: number;
  numPresident: number;
}

export interface ParticipationClubConcours {
  numClub: number;
  numConcours: number;
}

export interface InscriptionCompetiteurConcours {
  numCompetiteur: number;
  numConcours: number;
}

export interface InscriptionEvaluateurConcours {
  numEvaluateur: number;
  numConcours: number;
}

export interface Dessin {
  numDessin: number;
  commentaire: string;
  classement: number | null;
  dateRemise: string;
  leDessin: string;
  titre: string;
  numCompetiteur: number;
  numConcours: number;
}

export type Appreciation = 'insuffisant' | 'passable' | 'bien' | 'tres_bien' | 'excellent';

export interface Evaluation {
  numEvaluateur: number;
  numDessin: number;
  dateEvaluation: string;
  note: number;
  commentaire: string;
  appreciation: Appreciation;
}

export interface AppData {
  clubs: Club[];
  utilisateurs: Utilisateur[];
  administrateurs: Administrateur[];
  directeurs: Directeur[];
  presidents: President[];
  competiteurs: Competiteur[];
  evaluateurs: Evaluateur[];
  concours: Concours[];
  participationsClubConcours: ParticipationClubConcours[];
  inscriptionsCompetiteurConcours: InscriptionCompetiteurConcours[];
  inscriptionsEvaluateurConcours: InscriptionEvaluateurConcours[];
  dessins: Dessin[];
  evaluations: Evaluation[];
}
