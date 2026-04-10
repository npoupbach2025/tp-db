import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import type { Evaluation, Appreciation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Search } from "lucide-react";

const appLabels: Record<Appreciation, string> = { insuffisant: "Insuffisant", passable: "Passable", bien: "Bien", tres_bien: "Très bien", excellent: "Excellent" };
const appColors: Record<Appreciation, string> = {
  insuffisant: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  passable: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  bien: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  tres_bien: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  excellent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function EvaluationsPage() {
  const { data, addEvaluation, deleteEvaluation } = useData();
  const [filterConcours, setFilterConcours] = useState("all");
  const [filterEvaluateur, setFilterEvaluateur] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ numEvaluateur: 0, numDessin: 0, dateEvaluation: new Date().toISOString().slice(0,10), note: 10, commentaire: "", appreciation: "bien" as Appreciation });
  const [deleteConfirm, setDeleteConfirm] = useState<{ numEvaluateur: number; numDessin: number } | null>(null);

  const filtered = data.evaluations.filter(e => {
    const dessin = data.dessins.find(d => d.numDessin === e.numDessin);
    const matchConcours = filterConcours === "all" || (dessin && dessin.numConcours === parseInt(filterConcours));
    const matchEval = filterEvaluateur === "all" || e.numEvaluateur === parseInt(filterEvaluateur);
    return matchConcours && matchEval;
  });

  const getName = (id: number) => { const u = data.utilisateurs.find(u => u.numUtilisateur === id); return u ? `${u.prenom} ${u.nom}` : "—"; };
  const getDessinTitle = (id: number) => data.dessins.find(d => d.numDessin === id)?.titre || "—";

  const openAdd = () => {
    setForm({ numEvaluateur: data.evaluateurs[0]?.numUtilisateur || 0, numDessin: data.dessins[0]?.numDessin || 0, dateEvaluation: new Date().toISOString().slice(0,10), note: 10, commentaire: "", appreciation: "bien" });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const err = await addEvaluation(form);
    if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
    toast({ title: "Évaluation ajoutée" });
    setModalOpen(false);
  };

  const handleDelete = (numEvaluateur: number, numDessin: number) => {
    deleteEvaluation(numEvaluateur, numDessin);
    setDeleteConfirm(null);
    toast({ title: "Évaluation supprimée" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Évaluations</h1>
          <p className="text-sm text-muted-foreground">{data.evaluations.length} évaluations</p>
        </div>
        <Button onClick={openAdd} className="active:scale-[0.97]"><Plus className="h-4 w-4 mr-1" />Nouvelle évaluation</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Select value={filterConcours} onValueChange={setFilterConcours}>
              <SelectTrigger className="w-full sm:w-[220px]"><SelectValue placeholder="Concours" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les concours</SelectItem>
                {data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterEvaluateur} onValueChange={setFilterEvaluateur}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Évaluateur" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les évaluateurs</SelectItem>
                {data.evaluateurs.map(e => <SelectItem key={e.numUtilisateur} value={String(e.numUtilisateur)}>{getName(e.numUtilisateur)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Évaluateur</TableHead>
                  <TableHead>Dessin</TableHead>
                  <TableHead className="text-center">Note</TableHead>
                  <TableHead>Appréciation</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune évaluation</TableCell></TableRow>
                ) : filtered.map((e, i) => (
                  <TableRow key={`${e.numEvaluateur}-${e.numDessin}`}>
                    <TableCell className="font-medium">{getName(e.numEvaluateur)}</TableCell>
                    <TableCell>{getDessinTitle(e.numDessin)}</TableCell>
                    <TableCell className="text-center"><span className="tabular-nums font-semibold">{e.note}</span><span className="text-muted-foreground text-xs">/20</span></TableCell>
                    <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${appColors[e.appreciation]}`}>{appLabels[e.appreciation]}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{e.commentaire}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{e.dateEvaluation}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ numEvaluateur: e.numEvaluateur, numDessin: e.numDessin })} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouvelle évaluation</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Évaluateur</Label>
              <Select value={String(form.numEvaluateur)} onValueChange={v => setForm({ ...form, numEvaluateur: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{data.evaluateurs.map(e => <SelectItem key={e.numUtilisateur} value={String(e.numUtilisateur)}>{getName(e.numUtilisateur)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Dessin</Label>
              <Select value={String(form.numDessin)} onValueChange={v => setForm({ ...form, numDessin: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{data.dessins.map(d => <SelectItem key={d.numDessin} value={String(d.numDessin)}>{d.titre}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Note (0-20)</Label><Input type="number" min={0} max={20} value={form.note} onChange={e => setForm({ ...form, note: Math.min(20, Math.max(0, parseInt(e.target.value) || 0)) })} /></div>
              <div><Label>Appréciation</Label>
                <Select value={form.appreciation} onValueChange={v => setForm({ ...form, appreciation: v as Appreciation })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(appLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Commentaire</Label><Input value={form.commentaire} onChange={e => setForm({ ...form, commentaire: e.target.value })} /></div>
            <div><Label>Date</Label><Input type="date" value={form.dateEvaluation} onChange={e => setForm({ ...form, dateEvaluation: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave}>Ajouter</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Supprimer cette évaluation ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm.numEvaluateur, deleteConfirm.numDessin)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
