import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

interface JuryAssign {
  numDessin: number;
  numEvaluateur: number;
  dateAffectation: string;
  dessinTitre: string;
  numConcours: number;
  concoursTheme: string;
  evaluateurNom: string;
  evaluateurPrenom: string;
}

export default function JuryPage() {
  const { data } = useData();
  const [assignments, setAssignments] = useState<JuryAssign[]>([]);
  const [filterConcours, setFilterConcours] = useState<string>("all");
  const [numDessin, setNumDessin] = useState<string>("");
  const [numEvaluateur, setNumEvaluateur] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = filterConcours !== "all" ? { numConcours: filterConcours } : undefined;
      const res = await api.getJuryAssignments(params) as JuryAssign[];
      setAssignments(res);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Chargement jury impossible", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, [filterConcours]);

  const dessinsFiltered = useMemo(() => {
    return data.dessins.filter(d => filterConcours === "all" || d.numConcours === Number(filterConcours));
  }, [data.dessins, filterConcours]);

  const evalsFiltered = useMemo(() => {
    if (filterConcours === "all") return data.evaluateurs;
    const allowed = new Set(
      data.inscriptionsEvaluateurConcours
        .filter(i => i.numConcours === Number(filterConcours))
        .map(i => i.numEvaluateur)
    );
    return data.evaluateurs.filter(e => allowed.has(e.numUtilisateur));
  }, [data.evaluateurs, data.inscriptionsEvaluateurConcours, filterConcours]);

  const groupedCount = useMemo(() => {
    const map: Record<number, number> = {};
    for (const a of assignments) map[a.numDessin] = (map[a.numDessin] || 0) + 1;
    return map;
  }, [assignments]);

  const handleAssign = async () => {
    if (!numDessin || !numEvaluateur) {
      toast({ title: "Erreur", description: "Sélectionne un dessin et un évaluateur", variant: "destructive" });
      return;
    }
    try {
      await api.assignJury({ numDessin: Number(numDessin), numEvaluateur: Number(numEvaluateur) });
      toast({ title: "Affectation ajoutée" });
      await fetchAssignments();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message || "Affectation impossible", variant: "destructive" });
    }
  };

  const handleDelete = async (d: number, e: number) => {
    try {
      await api.removeJury(d, e);
      toast({ title: "Affectation supprimée" });
      await fetchAssignments();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Suppression impossible", variant: "destructive" });
    }
  };

  const getUserName = (id: number) => {
    const u = data.utilisateurs.find(x => x.numUtilisateur === id);
    return u ? `${u.prenom} ${u.nom}` : `#${id}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Affectation Jury</h1>
        <p className="text-sm text-muted-foreground">Affecter exactement 2 évaluateurs par dessin</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Nouvelle affectation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-4 gap-3">
            <Select value={filterConcours} onValueChange={setFilterConcours}>
              <SelectTrigger><SelectValue placeholder="Concours" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les concours</SelectItem>
                {data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={numDessin} onValueChange={setNumDessin}>
              <SelectTrigger><SelectValue placeholder="Dessin" /></SelectTrigger>
              <SelectContent>
                {dessinsFiltered.map(d => (
                  <SelectItem key={d.numDessin} value={String(d.numDessin)}>
                    {`#${d.numDessin} ${d.titre}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={numEvaluateur} onValueChange={setNumEvaluateur}>
              <SelectTrigger><SelectValue placeholder="Évaluateur" /></SelectTrigger>
              <SelectContent>
                {evalsFiltered.map(e => (
                  <SelectItem key={e.numUtilisateur} value={String(e.numUtilisateur)}>{getUserName(e.numUtilisateur)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleAssign}>Affecter</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Affectations existantes {loading ? "(chargement...)" : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dessin</TableHead>
                  <TableHead>Concours</TableHead>
                  <TableHead>Évaluateur</TableHead>
                  <TableHead className="text-center">Jury actuel</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune affectation</TableCell></TableRow>
                ) : assignments.map((a, idx) => (
                  <TableRow key={`${a.numDessin}-${a.numEvaluateur}-${idx}`}>
                    <TableCell className="font-medium">{`#${a.numDessin} ${a.dessinTitre}`}</TableCell>
                    <TableCell>{a.concoursTheme}</TableCell>
                    <TableCell>{`${a.evaluateurPrenom} ${a.evaluateurNom}`}</TableCell>
                    <TableCell className="text-center">{groupedCount[a.numDessin] || 0}/2</TableCell>
                    <TableCell>{a.dateAffectation || "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(a.numDessin, a.numEvaluateur)}>
                        Retirer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
