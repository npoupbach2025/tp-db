import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, Medal, Award } from "lucide-react";
import { resolveDessinVisual } from "@/lib/dessinVisual";

export default function ResultatsPage() {
  const { data } = useData();
  const [selectedConcours, setSelectedConcours] = useState(String(data.concours[0]?.numConcours || ""));

  // Classement des dessins par concours
  const concoursNum = parseInt(selectedConcours);
  const dessinsForConcours = data.dessins.filter(d => d.numConcours === concoursNum);
  const classement = dessinsForConcours.map(d => {
    const evals = data.evaluations.filter(e => e.numDessin === d.numDessin);
    const avg = evals.length > 0 ? evals.reduce((s, e) => s + e.note, 0) / evals.length : 0;
    const comp = data.utilisateurs.find(u => u.numUtilisateur === d.numCompetiteur);
    const club = comp ? data.clubs.find(c => c.numClub === comp.numClub) : null;
    return { ...d, avg, compName: comp ? `${comp.prenom} ${comp.nom}` : "—", clubName: club?.nomClub || "—", evalCount: evals.length };
  }).sort((a, b) => b.avg - a.avg);

  // Palmarès par club
  const clubStats = data.clubs.map(club => {
    const members = data.utilisateurs.filter(u => u.numClub === club.numClub);
    const memberIds = members.map(m => m.numUtilisateur);
    const clubDessins = data.dessins.filter(d => memberIds.includes(d.numCompetiteur));
    const clubEvals = clubDessins.flatMap(d => data.evaluations.filter(e => e.numDessin === d.numDessin));
    const avgNote = clubEvals.length > 0 ? clubEvals.reduce((s, e) => s + e.note, 0) / clubEvals.length : 0;
    return { name: club.nomClub.length > 18 ? club.nomClub.slice(0, 18) + "…" : club.nomClub, dessins: clubDessins.length, avgNote: parseFloat(avgNote.toFixed(1)), competiteurs: data.competiteurs.filter(c => memberIds.includes(c.numUtilisateur)).length };
  }).filter(c => c.dessins > 0).sort((a, b) => b.avgNote - a.avgNote);

  // Top compétiteurs
  const topComps = data.competiteurs.map(comp => {
    const u = data.utilisateurs.find(u => u.numUtilisateur === comp.numUtilisateur);
    const dessins = data.dessins.filter(d => d.numCompetiteur === comp.numUtilisateur);
    const evals = dessins.flatMap(d => data.evaluations.filter(e => e.numDessin === d.numDessin));
    const avg = evals.length > 0 ? evals.reduce((s, e) => s + e.note, 0) / evals.length : 0;
    return { name: u ? `${u.prenom} ${u.nom}` : "—", avg: parseFloat(avg.toFixed(1)), dessins: dessins.length, categorie: comp.categorie };
  }).filter(c => c.dessins > 0).sort((a, b) => b.avg - a.avg).slice(0, 10);

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-4 w-4 text-amber-500" />;
    if (i === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (i === 2) return <Award className="h-4 w-4 text-amber-700" />;
    return <span className="text-xs text-muted-foreground tabular-nums">{i + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Résultats</h1>
        <p className="text-sm text-muted-foreground">Classements et palmarès</p>
      </div>

      {/* Classement par concours */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base">Classement par concours</CardTitle>
            <Select value={selectedConcours} onValueChange={setSelectedConcours}>
              <SelectTrigger className="w-full sm:w-[250px]"><SelectValue /></SelectTrigger>
              <SelectContent>{data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Dessin</TableHead>
                  <TableHead>Compétiteur</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead className="text-center">Évals</TableHead>
                  <TableHead className="text-center">Moyenne</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classement.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun dessin pour ce concours</TableCell></TableRow>
                ) : classement.map((d, i) => (
                  <TableRow key={d.numDessin} className={i < 3 ? "bg-muted/30" : ""}>
                    <TableCell>{rankIcon(i)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {resolveDessinVisual(d.leDessin, d.titre, data.concours.find(c => c.numConcours === concoursNum)?.theme) ? (
                          <img
                            src={resolveDessinVisual(d.leDessin, d.titre, data.concours.find(c => c.numConcours === concoursNum)?.theme) || ""}
                            alt={d.titre}
                            className="h-8 w-12 rounded object-cover border"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-base">{d.leDessin || "🎨"}</span>
                        )}
                        <span>{d.titre}</span>
                      </div>
                    </TableCell>
                    <TableCell>{d.compName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{d.clubName}</TableCell>
                    <TableCell className="text-center tabular-nums">{d.evalCount}</TableCell>
                    <TableCell className="text-center"><span className="font-semibold tabular-nums">{d.avg.toFixed(1)}</span><span className="text-muted-foreground text-xs">/20</span></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Palmarès par club */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Palmarès par club</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={clubStats.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" domain={[0, 20]} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="avgNote" fill="hsl(217, 91%, 50%)" radius={[0, 4, 4, 0]} name="Moyenne" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top compétiteurs */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Top compétiteurs</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topComps.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    {rankIcon(i)}
                    <span className="text-sm font-medium">{c.name}</span>
                    <Badge variant="secondary" className="text-[10px]">{c.categorie}</Badge>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{c.avg}/20</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
