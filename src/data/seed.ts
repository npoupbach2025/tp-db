import type { AppData } from '@/types';

export const seedData: AppData = {
  clubs: [
    { numClub: 1, nomClub: "Les Artistes de Lyon", adresse: "12 Rue de la République", numTelephone: "04 72 00 11 22", nombreAdherents: 45, ville: "Lyon", departement: "Rhône", region: "Auvergne-Rhône-Alpes", dateCreation: "2015-03-12" },
    { numClub: 2, nomClub: "Atelier Créatif Paris", adresse: "8 Boulevard Haussmann", numTelephone: "01 45 67 89 01", nombreAdherents: 62, ville: "Paris", departement: "Paris", region: "Île-de-France", dateCreation: "2012-09-01" },
    { numClub: 3, nomClub: "Couleurs de Marseille", adresse: "25 Quai du Port", numTelephone: "04 91 33 44 55", nombreAdherents: 38, ville: "Marseille", departement: "Bouches-du-Rhône", region: "Provence-Alpes-Côte d'Azur", dateCreation: "2017-01-15" },
    { numClub: 4, nomClub: "Pinceaux Bordelais", adresse: "5 Place de la Bourse", numTelephone: "05 56 12 34 56", nombreAdherents: 29, ville: "Bordeaux", departement: "Gironde", region: "Nouvelle-Aquitaine", dateCreation: "2018-06-20" },
    { numClub: 5, nomClub: "Dessins de Nantes", adresse: "14 Rue Crébillon", numTelephone: "02 40 55 66 77", nombreAdherents: 33, ville: "Nantes", departement: "Loire-Atlantique", region: "Pays de la Loire", dateCreation: "2016-11-08" },
    { numClub: 6, nomClub: "Trait d'Union Toulouse", adresse: "3 Place du Capitole", numTelephone: "05 61 22 33 44", nombreAdherents: 41, ville: "Toulouse", departement: "Haute-Garonne", region: "Occitanie", dateCreation: "2014-04-25" },
    { numClub: 7, nomClub: "Croquis Lillois", adresse: "18 Rue de Béthune", numTelephone: "03 20 44 55 66", nombreAdherents: 27, ville: "Lille", departement: "Nord", region: "Hauts-de-France", dateCreation: "2019-02-14" },
    { numClub: 8, nomClub: "Palette Strasbourgeoise", adresse: "9 Place Kléber", numTelephone: "03 88 11 22 33", nombreAdherents: 35, ville: "Strasbourg", departement: "Bas-Rhin", region: "Grand Est", dateCreation: "2016-07-30" },
    { numClub: 9, nomClub: "Encre de Rennes", adresse: "22 Rue Le Bastard", numTelephone: "02 99 33 44 55", nombreAdherents: 24, ville: "Rennes", departement: "Ille-et-Vilaine", region: "Bretagne", dateCreation: "2020-01-10" },
    { numClub: 10, nomClub: "Studio Nice", adresse: "7 Promenade des Anglais", numTelephone: "04 93 22 33 44", nombreAdherents: 31, ville: "Nice", departement: "Alpes-Maritimes", region: "Provence-Alpes-Côte d'Azur", dateCreation: "2017-09-05" },
    { numClub: 11, nomClub: "Fusains de Dijon", adresse: "11 Place de la Libération", numTelephone: "03 80 55 66 77", nombreAdherents: 22, ville: "Dijon", departement: "Côte-d'Or", region: "Bourgogne-Franche-Comté", dateCreation: "2021-03-18" },
    { numClub: 12, nomClub: "Esquisses de Montpellier", adresse: "16 Place de la Comédie", numTelephone: "04 67 88 99 00", nombreAdherents: 36, ville: "Montpellier", departement: "Hérault", region: "Occitanie", dateCreation: "2015-12-01" },
  ],

  utilisateurs: [
    // Admins (2)
    { numUtilisateur: 1, nom: "Moreau", prenom: "Claire", adresse: "4 Rue Voltaire, Lyon", login: "cmoreau", motDePasse: "pass123", email: "claire.moreau@mail.fr", dateNaissance: "1985-04-12", numClub: 1 },
    { numUtilisateur: 2, nom: "Bernard", prenom: "Luc", adresse: "15 Av. Victor Hugo, Paris", login: "lbernard", motDePasse: "pass123", email: "luc.bernard@mail.fr", dateNaissance: "1980-11-23", numClub: 2 },
    // Directeurs (6) — presidents 5,6 are also directeurs
    { numUtilisateur: 3, nom: "Petit", prenom: "Marie", adresse: "7 Rue Pasteur, Marseille", login: "mpetit", motDePasse: "pass123", email: "marie.petit@mail.fr", dateNaissance: "1990-07-08", numClub: 3 },
    { numUtilisateur: 4, nom: "Durand", prenom: "Jean", adresse: "20 Av. Foch, Bordeaux", login: "jdurand", motDePasse: "pass123", email: "jean.durand@mail.fr", dateNaissance: "1978-03-15", numClub: 4 },
    { numUtilisateur: 5, nom: "Laurent", prenom: "Sophie", adresse: "3 Rue de Siam, Nantes", login: "slaurent", motDePasse: "pass123", email: "sophie.laurent@mail.fr", dateNaissance: "1982-09-28", numClub: 5 },
    { numUtilisateur: 6, nom: "Roux", prenom: "Philippe", adresse: "10 Allée des Bruyères, Toulouse", login: "proux", motDePasse: "pass123", email: "philippe.roux@mail.fr", dateNaissance: "1975-12-04", numClub: 6 },
    { numUtilisateur: 7, nom: "Martin", prenom: "Isabelle", adresse: "6 Bd de la Liberté, Lille", login: "imartin", motDePasse: "pass123", email: "isabelle.martin@mail.fr", dateNaissance: "1988-06-17", numClub: 7 },
    { numUtilisateur: 8, nom: "Simon", prenom: "André", adresse: "1 Pl. Gutenberg, Strasbourg", login: "asimon", motDePasse: "pass123", email: "andre.simon@mail.fr", dateNaissance: "1983-01-30", numClub: 8 },
    // Competiteurs (24)
    { numUtilisateur: 9, nom: "Lefebvre", prenom: "Emma", adresse: "19 Rue de la Paix, Lyon", login: "elefebvre", motDePasse: "pass123", email: "emma.lefebvre@mail.fr", dateNaissance: "2001-05-14", numClub: 1 },
    { numUtilisateur: 10, nom: "Garcia", prenom: "Thomas", adresse: "31 Rue du Commerce, Paris", login: "tgarcia", motDePasse: "pass123", email: "thomas.garcia@mail.fr", dateNaissance: "1998-08-22", numClub: 2 },
    { numUtilisateur: 11, nom: "Fournier", prenom: "Camille", adresse: "8 Rue Paradis, Marseille", login: "cfournier", motDePasse: "pass123", email: "camille.fournier@mail.fr", dateNaissance: "2003-02-09", numClub: 3 },
    { numUtilisateur: 12, nom: "Girard", prenom: "Hugo", adresse: "44 Cours de l'Intendance, Bordeaux", login: "hgirard", motDePasse: "pass123", email: "hugo.girard@mail.fr", dateNaissance: "1996-10-31", numClub: 4 },
    { numUtilisateur: 13, nom: "Bonnet", prenom: "Léa", adresse: "6 Rue Racine, Nantes", login: "lbonnet", motDePasse: "pass123", email: "lea.bonnet@mail.fr", dateNaissance: "2000-12-03", numClub: 5 },
    { numUtilisateur: 14, nom: "Dupont", prenom: "Nathan", adresse: "2 Rue Alsace, Toulouse", login: "ndupont", motDePasse: "pass123", email: "nathan.dupont@mail.fr", dateNaissance: "1999-04-18", numClub: 6 },
    { numUtilisateur: 15, nom: "Lambert", prenom: "Chloé", adresse: "9 Rue Nationale, Lille", login: "clambert", motDePasse: "pass123", email: "chloe.lambert@mail.fr", dateNaissance: "2002-07-25", numClub: 7 },
    { numUtilisateur: 16, nom: "Fontaine", prenom: "Lucas", adresse: "13 Rue des Halles, Strasbourg", login: "lfontaine", motDePasse: "pass123", email: "lucas.fontaine@mail.fr", dateNaissance: "1997-01-11", numClub: 8 },
    { numUtilisateur: 17, nom: "Chevalier", prenom: "Manon", adresse: "5 Pl. Hoche, Rennes", login: "mchevalier", motDePasse: "pass123", email: "manon.chevalier@mail.fr", dateNaissance: "2001-09-06", numClub: 9 },
    { numUtilisateur: 18, nom: "Robin", prenom: "Axel", adresse: "17 Rue Masséna, Nice", login: "arobin", motDePasse: "pass123", email: "axel.robin@mail.fr", dateNaissance: "1995-11-19", numClub: 10 },
    { numUtilisateur: 19, nom: "Masson", prenom: "Julie", adresse: "21 Rue Verrerie, Dijon", login: "jmasson", motDePasse: "pass123", email: "julie.masson@mail.fr", dateNaissance: "2004-03-27", numClub: 11 },
    { numUtilisateur: 20, nom: "Clement", prenom: "Romain", adresse: "10 Rue Foch, Montpellier", login: "rclement", motDePasse: "pass123", email: "romain.clement@mail.fr", dateNaissance: "1998-06-14", numClub: 12 },
    { numUtilisateur: 21, nom: "Gauthier", prenom: "Alice", adresse: "33 Rue Sainte, Marseille", login: "agauthier", motDePasse: "pass123", email: "alice.gauthier@mail.fr", dateNaissance: "2000-01-22", numClub: 3 },
    { numUtilisateur: 22, nom: "David", prenom: "Maxime", adresse: "28 Rue de Rivoli, Paris", login: "mdavid", motDePasse: "pass123", email: "maxime.david@mail.fr", dateNaissance: "1997-08-05", numClub: 2 },
    { numUtilisateur: 23, nom: "Bertrand", prenom: "Inès", adresse: "15 Av. Jean Jaurès, Lyon", login: "ibertrand", motDePasse: "pass123", email: "ines.bertrand@mail.fr", dateNaissance: "2002-04-10", numClub: 1 },
    { numUtilisateur: 24, nom: "Morel", prenom: "Antoine", adresse: "7 Rue du Taur, Toulouse", login: "amorel", motDePasse: "pass123", email: "antoine.morel@mail.fr", dateNaissance: "1999-11-30", numClub: 6 },
    { numUtilisateur: 25, nom: "Henry", prenom: "Sarah", adresse: "4 Rue des Arts, Nantes", login: "shenry", motDePasse: "pass123", email: "sarah.henry@mail.fr", dateNaissance: "2003-05-16", numClub: 5 },
    { numUtilisateur: 26, nom: "Rousseau", prenom: "Valentin", adresse: "11 Rue Esquermoise, Lille", login: "vrousseau", motDePasse: "pass123", email: "valentin.rousseau@mail.fr", dateNaissance: "1996-09-08", numClub: 7 },
    { numUtilisateur: 27, nom: "Nicolas", prenom: "Pauline", adresse: "19 Rue du Dôme, Strasbourg", login: "pnicolas", motDePasse: "pass123", email: "pauline.nicolas@mail.fr", dateNaissance: "2001-02-28", numClub: 8 },
    { numUtilisateur: 28, nom: "Perrin", prenom: "Théo", adresse: "23 Rue de Penhoët, Rennes", login: "tperrin", motDePasse: "pass123", email: "theo.perrin@mail.fr", dateNaissance: "2000-07-13", numClub: 9 },
    { numUtilisateur: 29, nom: "Aubert", prenom: "Laura", adresse: "6 Rue de France, Nice", login: "laubert", motDePasse: "pass123", email: "laura.aubert@mail.fr", dateNaissance: "1998-12-01", numClub: 10 },
    { numUtilisateur: 30, nom: "Legrand", prenom: "Bastien", adresse: "14 Rue Musette, Dijon", login: "blegrand", motDePasse: "pass123", email: "bastien.legrand@mail.fr", dateNaissance: "2002-10-20", numClub: 11 },
    { numUtilisateur: 31, nom: "Mercier", prenom: "Océane", adresse: "8 Rue de la Loge, Montpellier", login: "omercier", motDePasse: "pass123", email: "oceane.mercier@mail.fr", dateNaissance: "1999-03-07", numClub: 12 },
    { numUtilisateur: 32, nom: "André", prenom: "Raphaël", adresse: "16 Cours Mirabeau, Bordeaux", login: "randre", motDePasse: "pass123", email: "raphael.andre@mail.fr", dateNaissance: "2001-08-24", numClub: 4 },
    // Evaluateurs (8)
    { numUtilisateur: 33, nom: "Leroy", prenom: "Catherine", adresse: "27 Rue du Bac, Paris", login: "cleroy", motDePasse: "pass123", email: "catherine.leroy@mail.fr", dateNaissance: "1972-05-20", numClub: 2 },
    { numUtilisateur: 34, nom: "Michel", prenom: "François", adresse: "3 Quai Tilsitt, Lyon", login: "fmichel", motDePasse: "pass123", email: "francois.michel@mail.fr", dateNaissance: "1968-11-14", numClub: 1 },
    { numUtilisateur: 35, nom: "Richard", prenom: "Nathalie", adresse: "20 Bd Longchamp, Marseille", login: "nrichard", motDePasse: "pass123", email: "nathalie.richard@mail.fr", dateNaissance: "1979-03-09", numClub: 3 },
    { numUtilisateur: 36, nom: "Dubois", prenom: "Patrick", adresse: "12 Allée de Tourny, Bordeaux", login: "pdubois", motDePasse: "pass123", email: "patrick.dubois@mail.fr", dateNaissance: "1970-07-28", numClub: 4 },
    { numUtilisateur: 37, nom: "Thomas", prenom: "Sylvie", adresse: "8 Rue de Strasbourg, Nantes", login: "sthomas", motDePasse: "pass123", email: "sylvie.thomas@mail.fr", dateNaissance: "1976-01-05", numClub: 5 },
    { numUtilisateur: 38, nom: "Robert", prenom: "Gérard", adresse: "5 Place Wilson, Toulouse", login: "grobert", motDePasse: "pass123", email: "gerard.robert@mail.fr", dateNaissance: "1965-09-17", numClub: 6 },
    { numUtilisateur: 39, nom: "Blanc", prenom: "Véronique", adresse: "14 Rue de Paris, Lille", login: "vblanc", motDePasse: "pass123", email: "veronique.blanc@mail.fr", dateNaissance: "1981-04-22", numClub: 7 },
    { numUtilisateur: 40, nom: "Guérin", prenom: "Marc", adresse: "2 Rue du Vieux Marché, Strasbourg", login: "mguerin", motDePasse: "pass123", email: "marc.guerin@mail.fr", dateNaissance: "1974-12-11", numClub: 8 },
  ],

  administrateurs: [
    { numUtilisateur: 1, dateDebut: "2020-01-01" },
    { numUtilisateur: 2, dateDebut: "2019-06-15" },
  ],

  directeurs: [
    { numUtilisateur: 3, dateDebut: "2021-01-10", numClub: 3 },
    { numUtilisateur: 4, dateDebut: "2020-05-20", numClub: 4 },
    { numUtilisateur: 5, dateDebut: "2019-09-01", numClub: 5 },
    { numUtilisateur: 6, dateDebut: "2018-03-15", numClub: 6 },
    { numUtilisateur: 7, dateDebut: "2022-01-01", numClub: 7 },
    { numUtilisateur: 8, dateDebut: "2021-06-01", numClub: 8 },
  ],

  presidents: [
    { numUtilisateur: 5, prime: 500, dateElection: "2022-01-15" },
    { numUtilisateur: 6, prime: 600, dateElection: "2021-06-10" },
  ],

  competiteurs: [
    { numUtilisateur: 9, datePremiereParticipation: "2022-03-01", categorie: "junior" },
    { numUtilisateur: 10, datePremiereParticipation: "2021-01-15", categorie: "senior" },
    { numUtilisateur: 11, datePremiereParticipation: "2023-05-20", categorie: "junior" },
    { numUtilisateur: 12, datePremiereParticipation: "2020-09-10", categorie: "pro" },
    { numUtilisateur: 13, datePremiereParticipation: "2022-06-01", categorie: "junior" },
    { numUtilisateur: 14, datePremiereParticipation: "2021-04-12", categorie: "senior" },
    { numUtilisateur: 15, datePremiereParticipation: "2023-01-08", categorie: "junior" },
    { numUtilisateur: 16, datePremiereParticipation: "2020-11-25", categorie: "pro" },
    { numUtilisateur: 17, datePremiereParticipation: "2022-08-14", categorie: "senior" },
    { numUtilisateur: 18, datePremiereParticipation: "2019-07-03", categorie: "pro" },
    { numUtilisateur: 19, datePremiereParticipation: "2023-09-20", categorie: "junior" },
    { numUtilisateur: 20, datePremiereParticipation: "2021-02-28", categorie: "senior" },
    { numUtilisateur: 21, datePremiereParticipation: "2022-04-15", categorie: "junior" },
    { numUtilisateur: 22, datePremiereParticipation: "2020-10-05", categorie: "pro" },
    { numUtilisateur: 23, datePremiereParticipation: "2023-03-12", categorie: "junior" },
    { numUtilisateur: 24, datePremiereParticipation: "2021-07-19", categorie: "senior" },
    { numUtilisateur: 25, datePremiereParticipation: "2022-11-01", categorie: "junior" },
    { numUtilisateur: 26, datePremiereParticipation: "2020-06-08", categorie: "pro" },
    { numUtilisateur: 27, datePremiereParticipation: "2023-02-14", categorie: "senior" },
    { numUtilisateur: 28, datePremiereParticipation: "2022-05-22", categorie: "junior" },
    { numUtilisateur: 29, datePremiereParticipation: "2021-08-30", categorie: "senior" },
    { numUtilisateur: 30, datePremiereParticipation: "2023-06-17", categorie: "junior" },
    { numUtilisateur: 31, datePremiereParticipation: "2021-12-03", categorie: "pro" },
    { numUtilisateur: 32, datePremiereParticipation: "2022-09-09", categorie: "senior" },
  ],

  evaluateurs: [
    { numUtilisateur: 33, specialite: "Aquarelle", niveau: "expert", experience: 15 },
    { numUtilisateur: 34, specialite: "Dessin au crayon", niveau: "avance", experience: 12 },
    { numUtilisateur: 35, specialite: "Peinture à l'huile", niveau: "expert", experience: 20 },
    { numUtilisateur: 36, specialite: "Art numérique", niveau: "intermediaire", experience: 8 },
    { numUtilisateur: 37, specialite: "Pastel", niveau: "avance", experience: 10 },
    { numUtilisateur: 38, specialite: "Sculpture", niveau: "expert", experience: 25 },
    { numUtilisateur: 39, specialite: "Illustration", niveau: "avance", experience: 11 },
    { numUtilisateur: 40, specialite: "Gravure", niveau: "intermediaire", experience: 7 },
  ],

  concours: [
    { numConcours: 1, theme: "La Nature en Ville", dateDebut: "2024-01-15", dateFin: "2024-03-15", etat: "evalue", description: "Dessinez la nature telle qu'elle s'exprime en milieu urbain", nbMaxDessinsParCompetiteur: 3, nbMinClubs: 3, numPresident: 5 },
    { numConcours: 2, theme: "Portraits du Quotidien", dateDebut: "2024-02-01", dateFin: "2024-04-30", etat: "evalue", description: "Capturez les visages et expressions de la vie de tous les jours", nbMaxDessinsParCompetiteur: 3, nbMinClubs: 4, numPresident: 6 },
    { numConcours: 3, theme: "Architectures Imaginaires", dateDebut: "2024-04-01", dateFin: "2024-06-30", etat: "resultat", description: "Inventez des bâtiments et structures qui n'existent pas encore", nbMaxDessinsParCompetiteur: 2, nbMinClubs: 3, numPresident: 5 },
    { numConcours: 4, theme: "Les Quatre Saisons", dateDebut: "2024-06-01", dateFin: "2024-08-31", etat: "en_cours", description: "Illustrez les saisons à travers le prisme de votre créativité", nbMaxDessinsParCompetiteur: 3, nbMinClubs: 5, numPresident: 6 },
    { numConcours: 5, theme: "Voyage Intérieur", dateDebut: "2024-07-15", dateFin: "2024-09-30", etat: "en_cours", description: "Explorez les paysages de l'imaginaire et de l'introspection", nbMaxDessinsParCompetiteur: 2, nbMinClubs: 3, numPresident: 5 },
    { numConcours: 6, theme: "Noir et Blanc", dateDebut: "2024-09-01", dateFin: "2024-11-30", etat: "attente", description: "Uniquement en noir et blanc, toutes techniques acceptées", nbMaxDessinsParCompetiteur: 3, nbMinClubs: 4, numPresident: 6 },
    { numConcours: 7, theme: "L'Océan", dateDebut: "2024-10-15", dateFin: "2024-12-31", etat: "pas_commence", description: "La mer, les fonds marins, la vie aquatique sous toutes ses formes", nbMaxDessinsParCompetiteur: 3, nbMinClubs: 3, numPresident: 5 },
    { numConcours: 8, theme: "Futurisme", dateDebut: "2025-01-01", dateFin: "2025-03-31", etat: "pas_commence", description: "Imaginez le monde de demain à travers l'art", nbMaxDessinsParCompetiteur: 2, nbMinClubs: 4, numPresident: 6 },
  ],

  participationsClubConcours: [
    { numClub: 1, numConcours: 1 }, { numClub: 2, numConcours: 1 }, { numClub: 3, numConcours: 1 }, { numClub: 5, numConcours: 1 },
    { numClub: 1, numConcours: 2 }, { numClub: 2, numConcours: 2 }, { numClub: 4, numConcours: 2 }, { numClub: 6, numConcours: 2 }, { numClub: 7, numConcours: 2 },
    { numClub: 3, numConcours: 3 }, { numClub: 5, numConcours: 3 }, { numClub: 8, numConcours: 3 }, { numClub: 10, numConcours: 3 },
    { numClub: 1, numConcours: 4 }, { numClub: 2, numConcours: 4 }, { numClub: 3, numConcours: 4 }, { numClub: 4, numConcours: 4 }, { numClub: 5, numConcours: 4 }, { numClub: 6, numConcours: 4 },
    { numClub: 7, numConcours: 5 }, { numClub: 8, numConcours: 5 }, { numClub: 9, numConcours: 5 },
    { numClub: 1, numConcours: 6 }, { numClub: 3, numConcours: 6 }, { numClub: 6, numConcours: 6 }, { numClub: 10, numConcours: 6 }, { numClub: 12, numConcours: 6 },
  ],

  inscriptionsCompetiteurConcours: [
    // Concours 1
    { numCompetiteur: 9, numConcours: 1 }, { numCompetiteur: 10, numConcours: 1 }, { numCompetiteur: 11, numConcours: 1 }, { numCompetiteur: 13, numConcours: 1 }, { numCompetiteur: 23, numConcours: 1 },
    // Concours 2
    { numCompetiteur: 9, numConcours: 2 }, { numCompetiteur: 10, numConcours: 2 }, { numCompetiteur: 12, numConcours: 2 }, { numCompetiteur: 14, numConcours: 2 }, { numCompetiteur: 15, numConcours: 2 }, { numCompetiteur: 22, numConcours: 2 },
    // Concours 3
    { numCompetiteur: 11, numConcours: 3 }, { numCompetiteur: 13, numConcours: 3 }, { numCompetiteur: 16, numConcours: 3 }, { numCompetiteur: 18, numConcours: 3 }, { numCompetiteur: 21, numConcours: 3 },
    // Concours 4
    { numCompetiteur: 9, numConcours: 4 }, { numCompetiteur: 12, numConcours: 4 }, { numCompetiteur: 14, numConcours: 4 }, { numCompetiteur: 20, numConcours: 4 }, { numCompetiteur: 24, numConcours: 4 }, { numCompetiteur: 25, numConcours: 4 },
    // Concours 5
    { numCompetiteur: 15, numConcours: 5 }, { numCompetiteur: 16, numConcours: 5 }, { numCompetiteur: 17, numConcours: 5 }, { numCompetiteur: 27, numConcours: 5 }, { numCompetiteur: 28, numConcours: 5 },
  ],

  inscriptionsEvaluateurConcours: [
    { numEvaluateur: 33, numConcours: 1 }, { numEvaluateur: 34, numConcours: 1 }, { numEvaluateur: 35, numConcours: 1 },
    { numEvaluateur: 36, numConcours: 2 }, { numEvaluateur: 37, numConcours: 2 }, { numEvaluateur: 38, numConcours: 2 },
    { numEvaluateur: 33, numConcours: 3 }, { numEvaluateur: 39, numConcours: 3 }, { numEvaluateur: 40, numConcours: 3 },
    { numEvaluateur: 34, numConcours: 4 }, { numEvaluateur: 35, numConcours: 4 }, { numEvaluateur: 36, numConcours: 4 },
    { numEvaluateur: 37, numConcours: 5 }, { numEvaluateur: 38, numConcours: 5 }, { numEvaluateur: 39, numConcours: 5 },
  ],

  dessins: [
    // Concours 1
    { numDessin: 1, commentaire: "Inspiration d'un parc urbain", classement: 1, dateRemise: "2024-02-10", leDessin: "🌳🏙️", titre: "Le Jardin Suspendu", numCompetiteur: 9, numConcours: 1 },
    { numDessin: 2, commentaire: "Fleurs sur béton", classement: 3, dateRemise: "2024-02-15", leDessin: "🌸🏢", titre: "Béton Fleuri", numCompetiteur: 10, numConcours: 1 },
    { numDessin: 3, commentaire: "Oiseaux en ville", classement: 2, dateRemise: "2024-02-20", leDessin: "🐦🌆", titre: "Vol Urbain", numCompetiteur: 11, numConcours: 1 },
    { numDessin: 4, commentaire: "Mousse sur les murs", classement: 5, dateRemise: "2024-02-18", leDessin: "🌿🧱", titre: "Reconquête Verte", numCompetiteur: 13, numConcours: 1 },
    { numDessin: 5, commentaire: "Arbre centenaire en centre-ville", classement: 4, dateRemise: "2024-03-01", leDessin: "🌲🏛️", titre: "Le Doyen", numCompetiteur: 23, numConcours: 1 },
    // Concours 2
    { numDessin: 6, commentaire: "Portrait d'un boulanger", classement: 2, dateRemise: "2024-03-05", leDessin: "👨‍🍳🥖", titre: "L'Artisan du Matin", numCompetiteur: 10, numConcours: 2 },
    { numDessin: 7, commentaire: "Enfant au marché", classement: 1, dateRemise: "2024-03-10", leDessin: "👧🍎", titre: "Regards d'Enfance", numCompetiteur: 12, numConcours: 2 },
    { numDessin: 8, commentaire: "Musicien de rue", classement: 3, dateRemise: "2024-03-12", leDessin: "🎵🎸", titre: "Mélodie Urbaine", numCompetiteur: 14, numConcours: 2 },
    { numDessin: 9, commentaire: "Vieille dame au parc", classement: 4, dateRemise: "2024-03-15", leDessin: "👵🌺", titre: "Sérénité", numCompetiteur: 15, numConcours: 2 },
    { numDessin: 10, commentaire: "Couple dans le métro", classement: 5, dateRemise: "2024-03-20", leDessin: "👫🚇", titre: "Transit", numCompetiteur: 22, numConcours: 2 },
    { numDessin: 11, commentaire: "Livreur à vélo", classement: null, dateRemise: "2024-04-01", leDessin: "🚴📦", titre: "Vitesse Moderne", numCompetiteur: 9, numConcours: 2 },
    // Concours 3
    { numDessin: 12, commentaire: "Cathédrale inversée", classement: 1, dateRemise: "2024-04-20", leDessin: "⛪🔄", titre: "Reflet Inversé", numCompetiteur: 16, numConcours: 3 },
    { numDessin: 13, commentaire: "Ville dans les nuages", classement: 2, dateRemise: "2024-05-01", leDessin: "☁️🏙️", titre: "Cité Céleste", numCompetiteur: 18, numConcours: 3 },
    { numDessin: 14, commentaire: "Pont organique", classement: 3, dateRemise: "2024-05-10", leDessin: "🌉🌿", titre: "Passerelle Vivante", numCompetiteur: 11, numConcours: 3 },
    { numDessin: 15, commentaire: "Maison-arbre", classement: null, dateRemise: "2024-05-15", leDessin: "🏡🌳", titre: "Symbiose", numCompetiteur: 21, numConcours: 3 },
    // Concours 4
    { numDessin: 16, commentaire: "Printemps en aquarelle", classement: null, dateRemise: "2024-07-01", leDessin: "🌸🎨", titre: "Renaissance Printanière", numCompetiteur: 9, numConcours: 4 },
    { numDessin: 17, commentaire: "Été brûlant", classement: null, dateRemise: "2024-07-10", leDessin: "☀️🏖️", titre: "Canicule", numCompetiteur: 12, numConcours: 4 },
    { numDessin: 18, commentaire: "Automne doré", classement: null, dateRemise: "2024-07-15", leDessin: "🍂🌅", titre: "Feuilles d'Or", numCompetiteur: 14, numConcours: 4 },
    { numDessin: 19, commentaire: "Hiver silencieux", classement: null, dateRemise: "2024-07-20", leDessin: "❄️🏔️", titre: "Silence Blanc", numCompetiteur: 20, numConcours: 4 },
    { numDessin: 20, commentaire: "Transition des saisons", classement: null, dateRemise: "2024-08-01", leDessin: "🔄🌍", titre: "Le Cycle", numCompetiteur: 24, numConcours: 4 },
    // Concours 5
    { numDessin: 21, commentaire: "Méditation abstraite", classement: null, dateRemise: "2024-08-10", leDessin: "🧘‍♀️🎨", titre: "Introspection", numCompetiteur: 15, numConcours: 5 },
    { numDessin: 22, commentaire: "Rêve éveillé", classement: null, dateRemise: "2024-08-15", leDessin: "💭🌈", titre: "Onirisme", numCompetiteur: 17, numConcours: 5 },
    { numDessin: 23, commentaire: "Labyrinthe mental", classement: null, dateRemise: "2024-08-20", leDessin: "🧠🔮", titre: "Dédale", numCompetiteur: 27, numConcours: 5 },
  ],

  evaluations: [
    // Concours 1 dessins
    { numEvaluateur: 33, numDessin: 1, dateEvaluation: "2024-03-20", note: 18, commentaire: "Composition magistrale", appreciation: "excellent" },
    { numEvaluateur: 34, numDessin: 1, dateEvaluation: "2024-03-21", note: 17, commentaire: "Très beau travail sur les détails", appreciation: "tres_bien" },
    { numEvaluateur: 33, numDessin: 2, dateEvaluation: "2024-03-20", note: 14, commentaire: "Bonne idée, exécution correcte", appreciation: "bien" },
    { numEvaluateur: 35, numDessin: 2, dateEvaluation: "2024-03-22", note: 13, commentaire: "Manque un peu de profondeur", appreciation: "bien" },
    { numEvaluateur: 34, numDessin: 3, dateEvaluation: "2024-03-21", note: 16, commentaire: "Dynamisme remarquable", appreciation: "tres_bien" },
    { numEvaluateur: 35, numDessin: 3, dateEvaluation: "2024-03-22", note: 15, commentaire: "Bon mouvement", appreciation: "tres_bien" },
    { numEvaluateur: 33, numDessin: 4, dateEvaluation: "2024-03-20", note: 11, commentaire: "Concept intéressant mais technique à améliorer", appreciation: "passable" },
    { numEvaluateur: 34, numDessin: 4, dateEvaluation: "2024-03-21", note: 10, commentaire: "Idée originale", appreciation: "passable" },
    { numEvaluateur: 35, numDessin: 5, dateEvaluation: "2024-03-22", note: 12, commentaire: "Dessin solide", appreciation: "bien" },
    { numEvaluateur: 34, numDessin: 5, dateEvaluation: "2024-03-23", note: 13, commentaire: "Bon rendu de l'arbre", appreciation: "bien" },
    // Concours 2 dessins
    { numEvaluateur: 36, numDessin: 6, dateEvaluation: "2024-05-05", note: 15, commentaire: "Expressif et chaleureux", appreciation: "tres_bien" },
    { numEvaluateur: 37, numDessin: 6, dateEvaluation: "2024-05-06", note: 16, commentaire: "Excellent travail sur la lumière", appreciation: "tres_bien" },
    { numEvaluateur: 36, numDessin: 7, dateEvaluation: "2024-05-05", note: 19, commentaire: "Émotion pure, chef d'œuvre", appreciation: "excellent" },
    { numEvaluateur: 38, numDessin: 7, dateEvaluation: "2024-05-07", note: 18, commentaire: "Regard captivant", appreciation: "excellent" },
    { numEvaluateur: 37, numDessin: 8, dateEvaluation: "2024-05-06", note: 14, commentaire: "Bonne ambiance", appreciation: "bien" },
    { numEvaluateur: 38, numDessin: 8, dateEvaluation: "2024-05-07", note: 13, commentaire: "Proportions à revoir", appreciation: "bien" },
    { numEvaluateur: 36, numDessin: 9, dateEvaluation: "2024-05-05", note: 12, commentaire: "Doux et apaisant", appreciation: "bien" },
    { numEvaluateur: 37, numDessin: 10, dateEvaluation: "2024-05-06", note: 9, commentaire: "Manque de contraste", appreciation: "insuffisant" },
    // Concours 3 dessins
    { numEvaluateur: 33, numDessin: 12, dateEvaluation: "2024-07-01", note: 17, commentaire: "Vision audacieuse", appreciation: "tres_bien" },
    { numEvaluateur: 39, numDessin: 12, dateEvaluation: "2024-07-02", note: 18, commentaire: "Très imaginatif", appreciation: "excellent" },
    { numEvaluateur: 40, numDessin: 13, dateEvaluation: "2024-07-03", note: 16, commentaire: "Magnifique perspective", appreciation: "tres_bien" },
    { numEvaluateur: 33, numDessin: 13, dateEvaluation: "2024-07-01", note: 15, commentaire: "Belle maîtrise", appreciation: "tres_bien" },
    { numEvaluateur: 39, numDessin: 14, dateEvaluation: "2024-07-02", note: 13, commentaire: "Concept original", appreciation: "bien" },
    { numEvaluateur: 40, numDessin: 14, dateEvaluation: "2024-07-03", note: 14, commentaire: "Bonne exécution", appreciation: "bien" },
  ],
};
