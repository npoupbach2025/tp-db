const API_BASE = '/api';
const AUTH_KEY = 'concours-auth';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const userId = parsed?.user?.numUtilisateur;
    const role = parsed?.role;
    if (!userId || !role) return {};
    return {
      'x-user-id': String(userId),
      'x-user-role': String(role),
    };
  } catch {
    return {};
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const customHeaders = (options?.headers || {}) as Record<string, string>;
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...customHeaders,
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (login: string, motDePasse: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ login, motDePasse }) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Clubs
  getClubs: (params?: Record<string, string>) =>
    request(`/clubs${params ? '?' + new URLSearchParams(params) : ''}`),
  getClub: (id: number) => request(`/clubs/${id}`),
  getClubMembres: (id: number) => request(`/clubs/${id}/membres`),
  createClub: (data: any) => request('/clubs', { method: 'POST', body: JSON.stringify(data) }),
  updateClub: (id: number, data: any) => request(`/clubs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClub: (id: number) => request(`/clubs/${id}`, { method: 'DELETE' }),

  // Utilisateurs
  getUtilisateurs: (params?: Record<string, string>) =>
    request(`/utilisateurs${params ? '?' + new URLSearchParams(params) : ''}`),
  getUtilisateur: (id: number) => request(`/utilisateurs/${id}`),
  createUtilisateur: (data: any) => request('/utilisateurs', { method: 'POST', body: JSON.stringify(data) }),
  updateUtilisateur: (id: number, data: any) => request(`/utilisateurs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUtilisateur: (id: number) => request(`/utilisateurs/${id}`, { method: 'DELETE' }),

  // Concours
  getConcours: (params?: Record<string, string>) =>
    request(`/concours${params ? '?' + new URLSearchParams(params) : ''}`),
  getConcoursDetail: (id: number) => request(`/concours/${id}`),
  createConcours: (data: any) => request('/concours', { method: 'POST', body: JSON.stringify(data) }),
  updateConcours: (id: number, data: any) => request(`/concours/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteConcours: (id: number) => request(`/concours/${id}`, { method: 'DELETE' }),

  // Dessins
  getDessins: (params?: Record<string, string>) =>
    request(`/dessins${params ? '?' + new URLSearchParams(params) : ''}`),
  getDessin: (id: number) => request(`/dessins/${id}`),
  uploadDessinFile: (fileName: string, dataUrl: string) =>
    request('/dessins/upload', { method: 'POST', body: JSON.stringify({ fileName, dataUrl }) }),
  createDessin: (data: any) => request('/dessins', { method: 'POST', body: JSON.stringify(data) }),
  updateDessin: (id: number, data: any) => request(`/dessins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDessin: (id: number) => request(`/dessins/${id}`, { method: 'DELETE' }),

  // Evaluations
  getEvaluations: (params?: Record<string, string>) =>
    request(`/evaluations${params ? '?' + new URLSearchParams(params) : ''}`),
  createEvaluation: (data: any) => request('/evaluations', { method: 'POST', body: JSON.stringify(data) }),
  updateEvaluation: (numEvaluateur: number, numDessin: number, data: any) =>
    request(`/evaluations/${numEvaluateur}/${numDessin}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvaluation: (numEvaluateur: number, numDessin: number) =>
    request(`/evaluations/${numEvaluateur}/${numDessin}`, { method: 'DELETE' }),

  // Inscriptions
  getInscriptionsClubs: (params?: Record<string, string>) =>
    request(`/inscriptions/clubs${params ? '?' + new URLSearchParams(params) : ''}`),
  addInscriptionClub: (data: any) => request('/inscriptions/clubs', { method: 'POST', body: JSON.stringify(data) }),
  deleteInscriptionClub: (numClub: number, numConcours: number) =>
    request(`/inscriptions/clubs/${numClub}/${numConcours}`, { method: 'DELETE' }),

  getInscriptionsCompetiteurs: (params?: Record<string, string>) =>
    request(`/inscriptions/competiteurs${params ? '?' + new URLSearchParams(params) : ''}`),
  addInscriptionCompetiteur: (data: any) => request('/inscriptions/competiteurs', { method: 'POST', body: JSON.stringify(data) }),
  deleteInscriptionCompetiteur: (numCompetiteur: number, numConcours: number) =>
    request(`/inscriptions/competiteurs/${numCompetiteur}/${numConcours}`, { method: 'DELETE' }),

  getInscriptionsEvaluateurs: (params?: Record<string, string>) =>
    request(`/inscriptions/evaluateurs${params ? '?' + new URLSearchParams(params) : ''}`),
  addInscriptionEvaluateur: (data: any) => request('/inscriptions/evaluateurs', { method: 'POST', body: JSON.stringify(data) }),
  deleteInscriptionEvaluateur: (numEvaluateur: number, numConcours: number) =>
    request(`/inscriptions/evaluateurs/${numEvaluateur}/${numConcours}`, { method: 'DELETE' }),

  // Jury (affectation de 2 évaluateurs par dessin)
  getJuryAssignments: (params?: Record<string, string>) =>
    request(`/jury${params ? '?' + new URLSearchParams(params) : ''}`),
  assignJury: (data: any) => request('/jury', { method: 'POST', body: JSON.stringify(data) }),
  removeJury: (numDessin: number, numEvaluateur: number) =>
    request(`/jury/${numDessin}/${numEvaluateur}`, { method: 'DELETE' }),

  // Resultats
  getResultats: (params?: Record<string, string>) =>
    request(`/resultats${params ? '?' + new URLSearchParams(params) : ''}`),
  getPalmaresClubs: () => request('/resultats/palmares-clubs'),
  getPalmaresRegions: () => request('/resultats/palmares-regions'),
  getTopCompetiteurs: () => request('/resultats/top-competiteurs'),

  // Requêtes TP imposées
  getRequetesTp: () => request('/requetes-tp'),
  getRequeteTp: (id: number) => request(`/requetes-tp/${id}`),

  // Contenu complet TP
  getTpContent: () => request('/tp'),

  // Console SQL (lecture)
  executeSqlConsole: (query: string) =>
    request('/sql-console/execute', { method: 'POST', body: JSON.stringify({ query }) }),
};
