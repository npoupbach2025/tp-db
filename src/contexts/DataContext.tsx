import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppData, Club, Utilisateur, Concours, Dessin, Evaluation, ParticipationClubConcours, InscriptionCompetiteurConcours, InscriptionEvaluateurConcours } from '@/types';
import { api } from '@/lib/api';

const emptyData: AppData = {
  clubs: [], utilisateurs: [], administrateurs: [], directeurs: [],
  presidents: [], competiteurs: [], evaluateurs: [], concours: [],
  participationsClubConcours: [], inscriptionsCompetiteurConcours: [],
  inscriptionsEvaluateurConcours: [], dessins: [], evaluations: [],
};

interface DataContextType {
  data: AppData;
  loading: boolean;
  refreshAll: () => Promise<void>;
  resetData: () => void;
  // Club CRUD
  addClub: (club: Omit<Club, 'numClub'>) => Promise<string | null>;
  updateClub: (club: Club) => Promise<string | null>;
  deleteClub: (numClub: number) => Promise<string | null>;
  // Utilisateur CRUD
  addUtilisateur: (user: Omit<Utilisateur, 'numUtilisateur'>, role: { type: string; details: any }) => Promise<string | null>;
  updateUtilisateur: (user: Utilisateur) => Promise<string | null>;
  deleteUtilisateur: (numUtilisateur: number) => Promise<string | null>;
  // Concours CRUD
  addConcours: (c: Omit<Concours, 'numConcours'>) => Promise<string | null>;
  updateConcours: (c: Concours) => Promise<string | null>;
  deleteConcours: (numConcours: number) => Promise<string | null>;
  // Dessin CRUD
  addDessin: (d: Omit<Dessin, 'numDessin'>) => Promise<string | null>;
  updateDessin: (d: Dessin) => Promise<string | null>;
  deleteDessin: (numDessin: number) => Promise<string | null>;
  // Evaluation CRUD
  addEvaluation: (e: Evaluation) => Promise<string | null>;
  updateEvaluation: (e: Evaluation) => Promise<string | null>;
  deleteEvaluation: (numEvaluateur: number, numDessin: number) => Promise<string | null>;
  // Inscriptions
  addParticipationClub: (p: ParticipationClubConcours) => Promise<string | null>;
  deleteParticipationClub: (numClub: number, numConcours: number) => Promise<string | null>;
  addInscriptionCompetiteur: (i: InscriptionCompetiteurConcours) => Promise<string | null>;
  deleteInscriptionCompetiteur: (numCompetiteur: number, numConcours: number) => Promise<string | null>;
  addInscriptionEvaluateur: (i: InscriptionEvaluateurConcours) => Promise<string | null>;
  deleteInscriptionEvaluateur: (numEvaluateur: number, numConcours: number) => Promise<string | null>;
  // Helpers
  getUserRole: (numUtilisateur: number) => string;
  getNextId: (list: { [key: string]: number }[], key: string) => number;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      const tasks = await Promise.allSettled([
        api.getClubs() as Promise<any[]>,
        api.getUtilisateurs() as Promise<any[]>,
        api.getConcours() as Promise<any[]>,
        api.getDessins() as Promise<any[]>,
        api.getEvaluations() as Promise<any[]>,
        api.getInscriptionsClubs() as Promise<any[]>,
        api.getInscriptionsCompetiteurs() as Promise<any[]>,
        api.getInscriptionsEvaluateurs() as Promise<any[]>,
      ]);

      const readList = (index: number) => {
        const item = tasks[index];
        return item.status === 'fulfilled' ? item.value : [];
      };

      const clubs = readList(0);
      const utilisateurs = readList(1);
      const concoursList = readList(2);
      const dessins = readList(3);
      const evaluations = readList(4);
      const participationsClubConcours = readList(5);
      const inscriptionsCompetiteurConcours = readList(6);
      const inscriptionsEvaluateurConcours = readList(7);

      // Extract role arrays from utilisateurs with role field
      const administrateurs = utilisateurs.filter((u: any) => u.role === 'administrateur').map((u: any) => ({ numUtilisateur: u.numUtilisateur, dateDebut: '' }));
      const directeurs = utilisateurs.filter((u: any) => u.role === 'directeur').map((u: any) => ({ numUtilisateur: u.numUtilisateur, dateDebut: '', numClub: u.numClub }));
      const presidents = utilisateurs.filter((u: any) => u.role === 'president').map((u: any) => ({ numUtilisateur: u.numUtilisateur, prime: 0, dateElection: '' }));
      const competiteurs = utilisateurs.filter((u: any) => u.role === 'competiteur').map((u: any) => ({ numUtilisateur: u.numUtilisateur, datePremiereParticipation: '', categorie: 'junior' as const }));
      const evaluateurs = utilisateurs.filter((u: any) => u.role === 'evaluateur').map((u: any) => ({ numUtilisateur: u.numUtilisateur, specialite: '', niveau: 'debutant' as const, experience: 0 }));

      setData({
        clubs,
        utilisateurs,
        administrateurs,
        directeurs,
        presidents,
        competiteurs,
        evaluateurs,
        concours: concoursList,
        participationsClubConcours,
        inscriptionsCompetiteurConcours,
        inscriptionsEvaluateurConcours,
        dessins,
        evaluations,
      });
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  const getNextId = (list: any[], key: string) => {
    if (list.length === 0) return 1;
    return Math.max(...list.map((item: any) => item[key])) + 1;
  };

  const getUserRole = (numUtilisateur: number): string => {
    const user = data.utilisateurs.find((u: any) => u.numUtilisateur === numUtilisateur);
    return (user as any)?.role || 'aucun';
  };

  const resetData = () => { refreshAll(); };

  // Wrapper pour les appels API avec refresh
  async function apiCall(fn: () => Promise<any>): Promise<string | null> {
    try {
      await fn();
      await refreshAll();
      return null;
    } catch (err: any) {
      return err.message || 'Erreur inconnue';
    }
  }

  // CLUB
  const addClub = (club: Omit<Club, 'numClub'>) => apiCall(() => api.createClub(club));
  const updateClub = (club: Club) => apiCall(() => api.updateClub(club.numClub, club));
  const deleteClub = (numClub: number) => apiCall(() => api.deleteClub(numClub));

  // UTILISATEUR
  const addUtilisateur = (user: Omit<Utilisateur, 'numUtilisateur'>, role: { type: string; details: any }) =>
    apiCall(() => api.createUtilisateur({ ...user, role: role.type, roleData: role.details }));
  const updateUtilisateur = (user: Utilisateur) => apiCall(() => api.updateUtilisateur(user.numUtilisateur, user));
  const deleteUtilisateur = (numUtilisateur: number) => apiCall(() => api.deleteUtilisateur(numUtilisateur));

  // CONCOURS
  const addConcours = (c: Omit<Concours, 'numConcours'>) => apiCall(() => api.createConcours(c));
  const updateConcours = (c: Concours) => apiCall(() => api.updateConcours(c.numConcours, c));
  const deleteConcours = (numConcours: number) => apiCall(() => api.deleteConcours(numConcours));

  // DESSIN
  const addDessin = (d: Omit<Dessin, 'numDessin'>) => apiCall(() => api.createDessin(d));
  const updateDessin = (d: Dessin) => apiCall(() => api.updateDessin(d.numDessin, d));
  const deleteDessin = (numDessin: number) => apiCall(() => api.deleteDessin(numDessin));

  // EVALUATION
  const addEvaluation = (e: Evaluation) => apiCall(() => api.createEvaluation(e));
  const updateEvaluation = (e: Evaluation) => apiCall(() => api.updateEvaluation(e.numEvaluateur, e.numDessin, e));
  const deleteEvaluation = (numEvaluateur: number, numDessin: number) => apiCall(() => api.deleteEvaluation(numEvaluateur, numDessin));

  // INSCRIPTIONS
  const addParticipationClub = (p: ParticipationClubConcours) => apiCall(() => api.addInscriptionClub(p));
  const deleteParticipationClub = (numClub: number, numConcours: number) => apiCall(() => api.deleteInscriptionClub(numClub, numConcours));
  const addInscriptionCompetiteur = (i: InscriptionCompetiteurConcours) => apiCall(() => api.addInscriptionCompetiteur(i));
  const deleteInscriptionCompetiteur = (numCompetiteur: number, numConcours: number) => apiCall(() => api.deleteInscriptionCompetiteur(numCompetiteur, numConcours));
  const addInscriptionEvaluateur = (i: InscriptionEvaluateurConcours) => apiCall(() => api.addInscriptionEvaluateur(i));
  const deleteInscriptionEvaluateur = (numEvaluateur: number, numConcours: number) => apiCall(() => api.deleteInscriptionEvaluateur(numEvaluateur, numConcours));

  return (
    <DataContext.Provider value={{
      data, loading, refreshAll, resetData, addClub, updateClub, deleteClub,
      addUtilisateur, updateUtilisateur, deleteUtilisateur,
      addConcours, updateConcours, deleteConcours,
      addDessin, updateDessin, deleteDessin,
      addEvaluation, updateEvaluation, deleteEvaluation,
      addParticipationClub, deleteParticipationClub,
      addInscriptionCompetiteur, deleteInscriptionCompetiteur,
      addInscriptionEvaluateur, deleteInscriptionEvaluateur,
      getUserRole, getNextId,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
