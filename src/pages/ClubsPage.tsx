import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import type { Club } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Users } from "lucide-react";

const emptyClub = { nomClub: "", adresse: "", numTelephone: "", nombreAdherents: 0, ville: "", departement: "", region: "", dateCreation: "" };

export default function ClubsPage() {
  const { data, addClub, updateClub, deleteClub } = useData();
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Club | null>(null);
  const [form, setForm] = useState(emptyClub);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const regions = [...new Set(data.clubs.map(c => c.region))].sort();

  const filtered = data.clubs.filter(c => {
    const matchSearch = `${c.nomClub} ${c.ville} ${c.departement}`.toLowerCase().includes(search.toLowerCase());
    const matchRegion = filterRegion === "all" || c.region === filterRegion;
    return matchSearch && matchRegion;
  });

  const openAdd = () => { setEditing(null); setForm(emptyClub); setModalOpen(true); };
  const openEdit = (c: Club) => { setEditing(c); setForm({ nomClub: c.nomClub, adresse: c.adresse, numTelephone: c.numTelephone, nombreAdherents: c.nombreAdherents, ville: c.ville, departement: c.departement, region: c.region, dateCreation: c.dateCreation }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.nomClub.trim()) { toast({ title: "Erreur", description: "Le nom du club est requis.", variant: "destructive" }); return; }
    if (editing) {
      const err = await updateClub({ ...editing, ...form });
      if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
      toast({ title: "Club modifié" });
    } else {
      const err = await addClub(form);
      if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
      toast({ title: "Club ajouté" });
    }
    setModalOpen(false);
  };

  const handleDelete = async (numClub: number) => {
    const err = await deleteClub(numClub);
    setDeleteConfirm(null);
    if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
    toast({ title: "Club supprimé" });
  };

  const getMemberCount = (numClub: number) => data.utilisateurs.filter(u => u.numClub === numClub).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clubs</h1>
          <p className="text-sm text-muted-foreground">{data.clubs.length} clubs enregistrés</p>
        </div>
        <Button onClick={openAdd} className="active:scale-[0.97] transition-transform"><Plus className="h-4 w-4 mr-1" />Nouveau club</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Région" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Région</TableHead>
                  <TableHead className="text-center">Adhérents</TableHead>
                  <TableHead className="text-center">Membres</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun club trouvé</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.numClub}>
                    <TableCell className="font-medium">{c.nomClub}</TableCell>
                    <TableCell>{c.ville}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{c.region}</Badge></TableCell>
                    <TableCell className="text-center tabular-nums">{c.nombreAdherents}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" /><span className="tabular-nums">{getMemberCount(c.numClub)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(c.numClub)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Modifier le club" : "Nouveau club"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Nom *</Label><Input value={form.nomClub} onChange={e => setForm({ ...form, nomClub: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Ville</Label><Input value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} /></div>
              <div><Label>Département</Label><Input value={form.departement} onChange={e => setForm({ ...form, departement: e.target.value })} /></div>
            </div>
            <div><Label>Région</Label><Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
            <div><Label>Adresse</Label><Input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Téléphone</Label><Input value={form.numTelephone} onChange={e => setForm({ ...form, numTelephone: e.target.value })} /></div>
              <div><Label>Adhérents</Label><Input type="number" value={form.nombreAdherents} onChange={e => setForm({ ...form, nombreAdherents: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div><Label>Date de création</Label><Input type="date" value={form.dateCreation} onChange={e => setForm({ ...form, dateCreation: e.target.value })} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave} className="active:scale-[0.97]">{editing ? "Enregistrer" : "Ajouter"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible. Voulez-vous supprimer ce club ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="active:scale-[0.97]">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
