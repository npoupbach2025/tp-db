import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import type { Concours, EtatConcours } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const etatLabels: Record<EtatConcours, string> = { pas_commence: "Non commencé", en_cours: "En cours", attente: "En attente", resultat: "Résultats", evalue: "Évalué" };
const etatColors: Record<EtatConcours, string> = {
  pas_commence: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  en_cours: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  attente: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resultat: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  evalue: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const emptyConcours = { theme: "", dateDebut: "", dateFin: "", etat: "pas_commence" as EtatConcours, description: "", nbMaxDessinsParCompetiteur: 3, nbMinClubs: 3, numPresident: 0 };

export default function ConcoursPage() {
  const { data, addConcours, updateConcours, deleteConcours } = useData();
  const [search, setSearch] = useState("");
  const [filterEtat, setFilterEtat] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Concours | null>(null);
  const [form, setForm] = useState(emptyConcours);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = data.concours.filter(c => {
    const matchSearch = `${c.theme} ${c.description}`.toLowerCase().includes(search.toLowerCase());
    const matchEtat = filterEtat === "all" || c.etat === filterEtat;
    return matchSearch && matchEtat;
  });

  const openAdd = () => { setEditing(null); setForm({ ...emptyConcours, numPresident: data.presidents[0]?.numUtilisateur || 0 }); setModalOpen(true); };
  const openEdit = (c: Concours) => { setEditing(c); setForm({ theme: c.theme, dateDebut: c.dateDebut, dateFin: c.dateFin, etat: c.etat, description: c.description, nbMaxDessinsParCompetiteur: c.nbMaxDessinsParCompetiteur, nbMinClubs: c.nbMinClubs, numPresident: c.numPresident }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.theme.trim()) { toast({ title: "Erreur", description: "Le thème est requis.", variant: "destructive" }); return; }
    if (editing) {
      const err = await updateConcours({ ...editing, ...form });
      if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
      toast({ title: "Concours modifié" });
    } else {
      const err = await addConcours(form);
      if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
      toast({ title: "Concours ajouté" });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: number) => { const err = await deleteConcours(id); setDeleteConfirm(null); if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; } toast({ title: "Concours supprimé" }); };

  const getPresidentName = (numP: number) => { const u = data.utilisateurs.find(u => u.numUtilisateur === numP); return u ? `${u.prenom} ${u.nom}` : "—"; };
  const getParticipantCount = (numC: number) => data.inscriptionsCompetiteurConcours.filter(i => i.numConcours === numC).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Concours</h1>
          <p className="text-sm text-muted-foreground">{data.concours.length} concours</p>
        </div>
        <Button onClick={openAdd} className="active:scale-[0.97]"><Plus className="h-4 w-4 mr-1" />Nouveau concours</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par thème..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterEtat} onValueChange={setFilterEtat}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les états</SelectItem>
                {Object.entries(etatLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thème</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Président</TableHead>
                  <TableHead className="text-center">Participants</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun concours trouvé</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.numConcours}>
                    <TableCell className="font-medium">{c.theme}</TableCell>
                    <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${etatColors[c.etat]}`}>{etatLabels[c.etat]}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.dateDebut} → {c.dateFin}</TableCell>
                    <TableCell className="text-sm">{getPresidentName(c.numPresident)}</TableCell>
                    <TableCell className="text-center tabular-nums">{getParticipantCount(c.numConcours)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(c.numConcours)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
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
          <DialogHeader><DialogTitle>{editing ? "Modifier le concours" : "Nouveau concours"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Thème *</Label><Input value={form.theme} onChange={e => setForm({ ...form, theme: e.target.value })} /></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date début</Label><Input type="date" value={form.dateDebut} onChange={e => setForm({ ...form, dateDebut: e.target.value })} /></div>
              <div><Label>Date fin</Label><Input type="date" value={form.dateFin} onChange={e => setForm({ ...form, dateFin: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>État</Label>
                <Select value={form.etat} onValueChange={v => setForm({ ...form, etat: v as EtatConcours })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(etatLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Président</Label>
                <Select value={String(form.numPresident)} onValueChange={v => setForm({ ...form, numPresident: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{data.presidents.map(p => { const u = data.utilisateurs.find(u => u.numUtilisateur === p.numUtilisateur); return <SelectItem key={p.numUtilisateur} value={String(p.numUtilisateur)}>{u ? `${u.prenom} ${u.nom}` : `#${p.numUtilisateur}`}</SelectItem>; })}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Max dessins/compétiteur</Label><Input type="number" min={1} value={form.nbMaxDessinsParCompetiteur} onChange={e => setForm({ ...form, nbMaxDessinsParCompetiteur: parseInt(e.target.value) || 1 })} /></div>
              <div><Label>Min clubs</Label><Input type="number" min={1} value={form.nbMinClubs} onChange={e => setForm({ ...form, nbMinClubs: parseInt(e.target.value) || 1 })} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? "Enregistrer" : "Ajouter"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Supprimer ce concours et toutes les données associées ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
