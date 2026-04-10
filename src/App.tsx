import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/contexts/DataContext";
import Layout from "@/components/Layout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ClubsPage from "@/pages/ClubsPage";
import UsersPage from "@/pages/UsersPage";
import ConcoursPage from "@/pages/ConcoursPage";
import DessinsPage from "@/pages/DessinsPage";
import EvaluationsPage from "@/pages/EvaluationsPage";
import ResultatsPage from "@/pages/ResultatsPage";
import InscriptionsPage from "@/pages/InscriptionsPage";
import JuryPage from "@/pages/JuryPage";
import RequetesTpPage from "@/pages/RequetesTpPage";
import TpPage from "@/pages/TpPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const AUTH_KEY = 'concours-auth';

const roleAllowedPaths: Record<string, string[]> = {
  administrateur: ["/", "/clubs", "/utilisateurs", "/concours", "/dessins", "/evaluations", "/resultats", "/inscriptions", "/jury", "/requetes-tp", "/tp"],
  directeur: ["/", "/concours", "/dessins", "/evaluations", "/resultats", "/inscriptions", "/jury", "/requetes-tp", "/tp"],
  president: ["/", "/concours", "/dessins", "/evaluations", "/resultats", "/inscriptions", "/jury", "/requetes-tp", "/tp"],
  competiteur: ["/", "/concours", "/dessins", "/resultats", "/tp"],
  evaluateur: ["/", "/concours", "/dessins", "/evaluations", "/resultats", "/tp"],
};

function loadAuth() {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

const App = () => {
  const [auth, setAuth] = useState<{ user: any; role: string } | null>(loadAuth);
  const allowedPaths = auth ? (roleAllowedPaths[auth.role] || ["/"]) : [];
  const firstAllowedPath = allowedPaths[0] || "/";

  const handleLogin = (user: any, role: string) => {
    const authData = { user, role };
    setAuth(authData);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem(AUTH_KEY);
  };

  if (!auth) {
    return (
      <TooltipProvider>
        <LoginPage onLogin={handleLogin} />
      </TooltipProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DataProvider>
          <BrowserRouter>
            <Layout auth={auth} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route
                  path="/clubs"
                  element={allowedPaths.includes('/clubs') ? <ClubsPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/utilisateurs"
                  element={allowedPaths.includes('/utilisateurs') ? <UsersPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/concours"
                  element={allowedPaths.includes('/concours') ? <ConcoursPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/dessins"
                  element={allowedPaths.includes('/dessins') ? <DessinsPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/evaluations"
                  element={allowedPaths.includes('/evaluations') ? <EvaluationsPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/resultats"
                  element={allowedPaths.includes('/resultats') ? <ResultatsPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/inscriptions"
                  element={allowedPaths.includes('/inscriptions') ? <InscriptionsPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/jury"
                  element={allowedPaths.includes('/jury') ? <JuryPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/requetes-tp"
                  element={allowedPaths.includes('/requetes-tp') ? <RequetesTpPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route
                  path="/tp"
                  element={allowedPaths.includes('/tp') ? <TpPage /> : <Navigate to={firstAllowedPath} replace />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </DataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
