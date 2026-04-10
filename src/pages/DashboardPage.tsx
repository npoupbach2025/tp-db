import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Trophy, Palette, Star, TrendingUp, Sparkles, ShieldAlert, Database, FilePenLine } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";

const COLORS = [
  "hsl(217, 91%, 50%)", "hsl(160, 60%, 45%)", "hsl(43, 96%, 56%)",
  "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)", "hsl(190, 80%, 45%)",
];

export default function DashboardPage() {
  const { data } = useData();

  const totalNotes = data.evaluations.reduce((s, e) => s + e.note, 0);
  const avgNote = data.evaluations.length > 0 ? (totalNotes / data.evaluations.length).toFixed(1) : "—";
  const totalInscriptions = data.inscriptionsCompetiteurConcours.length + data.inscriptionsEvaluateurConcours.length;
  const concoursActifs = data.concours.filter((c) => c.etat === "en_cours").length;

  const stats = [
    { label: "Clubs", value: data.clubs.length, icon: Building2, color: "text-blue-500" },
    { label: "Utilisateurs", value: data.utilisateurs.length, icon: Users, color: "text-emerald-500" },
    { label: "Concours", value: data.concours.length, icon: Trophy, color: "text-amber-500" },
    { label: "Dessins", value: data.dessins.length, icon: Palette, color: "text-purple-500" },
    { label: "Évaluations", value: data.evaluations.length, icon: Star, color: "text-rose-500" },
    { label: "Moyenne", value: avgNote, icon: TrendingUp, color: "text-cyan-500" },
  ];

  // Category distribution
  const catCounts = data.competiteurs.reduce((acc, c) => {
    acc[c.categorie] = (acc[c.categorie] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const catData = Object.entries(catCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Contest state distribution
  const etatLabels: Record<string, string> = { pas_commence: "Non commencé", en_cours: "En cours", attente: "En attente", resultat: "Résultats", evalue: "Évalué" };
  const etatCounts = data.concours.reduce((acc, c) => {
    acc[c.etat] = (acc[c.etat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const etatData = Object.entries(etatCounts).map(([key, value]) => ({ name: etatLabels[key] || key, value }));

  // Top clubs by members
  const topClubs = [...data.clubs].sort((a, b) => b.nombreAdherents - a.nombreAdherents).slice(0, 6).map(c => ({ name: c.nomClub.length > 15 ? c.nomClub.slice(0, 15) + "…" : c.nomClub, adherents: c.nombreAdherents }));

  const recentConcours = [...data.concours]
    .sort((a, b) => (b.dateDebut || "").localeCompare(a.dateDebut || ""))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Tableau de pilotage</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Art Contest Hub — TP SQL</h1>
              <p className="text-sm text-white/80 max-w-2xl">
                Application pédagogique de gestion de concours de dessins : clubs, inscriptions, dessins, évaluations et résultats.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-white/90 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-medium">Mode démo TP</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <div className="text-xs text-white/70">Concours actifs</div>
              <div className="text-2xl font-bold">{concoursActifs}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <div className="text-xs text-white/70">Inscriptions</div>
              <div className="text-2xl font-bold">{totalInscriptions}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <div className="text-xs text-white/70">Dessins</div>
              <div className="text-2xl font-bold">{data.dessins.length}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3">
              <div className="text-xs text-white/70">Note moyenne</div>
              <div className="text-2xl font-bold">{avgNote}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Parcours rapide professeur (3 minutes)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <p><strong>1.</strong> Ouvrir <strong>Concours</strong> pour voir les concours et leur état.</p>
            <p><strong>2.</strong> Ouvrir <strong>Résultats</strong> pour visualiser les classements.</p>
            <p><strong>3.</strong> Ouvrir <strong>Dossier TP</strong> pour les docs, schémas et SQL.</p>
            <p><strong>4.</strong> Ouvrir <strong>Requêtes 1-10</strong> ou la console SQL pour tester la base.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/concours">Aller à Concours</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/resultats">Voir Résultats</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/tp">Ouvrir Dossier TP</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/requetes-tp">Tester SQL</Link></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-300/60 bg-amber-50/80 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 mt-0.5 text-amber-700 dark:text-amber-300" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Contexte TP (important pour l’évaluation)</p>
              <p className="text-sm text-muted-foreground">
                Cette application est conçue pour un <strong>TP orienté fonctionnel</strong>. L’objectif est de manipuler librement la base (lecture/écriture/modification/suppression)
                pour valider les règles métier et les requêtes SQL. La sécurité avancée n’est pas le focus principal de ce rendu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold tabular-nums">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">État des concours</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={etatData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Résumé opérationnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Database className="h-4 w-4 mt-0.5 text-blue-500" />
              <p className="text-sm">Base active avec <strong>{data.utilisateurs.length}</strong> utilisateurs et <strong>{data.clubs.length}</strong> clubs.</p>
            </div>
            <div className="flex items-start gap-2">
              <FilePenLine className="h-4 w-4 mt-0.5 text-emerald-500" />
              <p className="text-sm"><strong>{data.evaluations.length}</strong> évaluations saisies sur <strong>{data.dessins.length}</strong> dessins.</p>
            </div>
            <div className="rounded-md border p-3 bg-muted/30">
              <p className="text-xs font-medium mb-2">Derniers concours</p>
              <div className="space-y-1">
                {recentConcours.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun concours</p>
                ) : recentConcours.map((c) => (
                  <p key={c.numConcours} className="text-xs">#{c.numConcours} — {c.theme}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compétiteurs par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Répartition des états (camembert)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={etatData} cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {etatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top clubs (adhérents)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topClubs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip />
                <Bar dataKey="adherents" fill="hsl(160, 60%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
