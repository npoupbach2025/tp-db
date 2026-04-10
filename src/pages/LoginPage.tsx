import { useState } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette, LogIn, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: any, role: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result: any = await api.login(login, motDePasse);
      onLogin(result.user, result.role);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg mb-4">
            <Palette className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Art Contest Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Concours de Dessins Inter-Clubs</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription>Entrez vos identifiants pour accéder à l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50/80 dark:border-blue-900/50 dark:bg-blue-950/20 p-3 text-sm">
              <p className="font-semibold text-blue-700 dark:text-blue-300">Accès recommandé pour la correction</p>
              <p className="text-blue-700/90 dark:text-blue-200 mt-1">Utiliser le compte <strong>adminAL / Syst3m!2020</strong> pour voir toutes les sections.</p>
              <p className="text-blue-700/80 dark:text-blue-200/90 text-xs mt-1">Parcours conseillé: Accueil → Concours → Résultats → Dossier TP.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login">Identifiant</Label>
                <Input
                  id="login"
                  type="text"
                  placeholder="Votre login..."
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe..."
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3">Comptes de démonstration :</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Admin</span>
                  <div className="text-gray-500">adminAL / Syst3m!2020</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-semibold text-green-600 dark:text-green-400">Compétiteur</span>
                  <div className="text-gray-500">jmarch / aZ3k9pQ</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Évaluateur</span>
                  <div className="text-gray-500">sbern / wW2i5pM</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-semibold text-orange-600 dark:text-orange-400">Directeur</span>
                  <div className="text-gray-500">cmorel / Hk4$pLm9</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          Projet Base de Données — Concours de Dessins Inter-Clubs
        </p>
      </div>
    </div>
  );
}
