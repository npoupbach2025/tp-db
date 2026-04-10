import { useMemo, useState } from "react";
import { useData } from "@/contexts/DataContext";
import type { Dessin } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { resolveDessinVisual } from "@/lib/dessinVisual";
import { api } from "@/lib/api";
import { Plus, Pencil, Trash2, Search, LayoutGrid, List } from "lucide-react";

export default function DessinsPage() {
  const { data, addDessin, updateDessin, deleteDessin } = useData();
  const auth = useMemo(() => {
    try {
      const raw = localStorage.getItem("concours-auth");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const currentRole = auth?.role || "";
  const currentUserId = Number(auth?.user?.numUtilisateur || 0);
  const canManage = ["administrateur", "directeur", "president", "competiteur"].includes(currentRole);
  const isCompetiteur = currentRole === "competiteur";

  const [search, setSearch] = useState("");
  const [filterConcours, setFilterConcours] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Dessin | null>(null);
  const [form, setForm] = useState({ titre: "", commentaire: "", dateRemise: "", leDessin: "", numCompetiteur: 0, numConcours: 0 });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = data.dessins.filter(d => {
    const matchSearch = `${d.titre} ${d.commentaire}`.toLowerCase().includes(search.toLowerCase());
    const matchConcours = filterConcours === "all" || d.numConcours === parseInt(filterConcours);
    return matchSearch && matchConcours;
  });

  const getCompName = (numC: number) => { const u = data.utilisateurs.find(u => u.numUtilisateur === numC); return u ? `${u.prenom} ${u.nom}` : "—"; };
  const getConcoursTheme = (numC: number) => data.concours.find(c => c.numConcours === numC)?.theme || "—";
  const getAvgNote = (numDessin: number) => {
    const evals = data.evaluations.filter(e => e.numDessin === numDessin);
    if (evals.length === 0) return null;
    return (evals.reduce((s, e) => s + e.note, 0) / evals.length).toFixed(1);
  };

  const openAdd = () => {
    setEditing(null);
    setSelectedFile(null);
    const defaultCompetiteur = isCompetiteur ? currentUserId : (data.competiteurs[0]?.numUtilisateur || 0);
    setForm({ titre: "", commentaire: "", dateRemise: new Date().toISOString().slice(0,10), leDessin: "", numCompetiteur: defaultCompetiteur, numConcours: data.concours[0]?.numConcours || 0 });
    setModalOpen(true);
  };
  const openEdit = (d: Dessin) => {
    setEditing(d);
    setSelectedFile(null);
    setForm({ titre: d.titre, commentaire: d.commentaire, dateRemise: d.dateRemise, leDessin: d.leDessin, numCompetiteur: d.numCompetiteur, numConcours: d.numConcours });
    setModalOpen(true);
  };

  const canEditDessin = (d: Dessin) => {
    if (!canManage) return false;
    if (isCompetiteur) return Number(d.numCompetiteur) === currentUserId;
    return true;
  };

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });

  const handleSave = async () => {
    if (!form.titre.trim()) { toast({ title: "Erreur", description: "Le titre est requis.", variant: "destructive" }); return; }
    if (isCompetiteur && Number(form.numCompetiteur) !== currentUserId) {
      toast({ title: "Erreur", description: "Un compétiteur ne peut déposer que ses propres dessins.", variant: "destructive" });
      return;
    }

    let leDessinFinal = form.leDessin;
    if (selectedFile) {
      try {
        setUploading(true);
        const dataUrl = await readFileAsDataUrl(selectedFile);
        const uploadRes = await api.uploadDessinFile(selectedFile.name, dataUrl) as { path: string };
        leDessinFinal = uploadRes.path;
      } catch (e: any) {
        toast({ title: "Erreur upload", description: e.message || "Upload impossible.", variant: "destructive" });
        return;
      } finally {
        setUploading(false);
      }
    }

    if (editing) {
      await updateDessin({ ...editing, ...form, leDessin: leDessinFinal });
      toast({ title: "Dessin modifié" });
    }
    else {
      const err = await addDessin({ ...form, leDessin: leDessinFinal, classement: null });
      if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
      toast({ title: "Dessin ajouté" });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: number) => { deleteDessin(id); setDeleteConfirm(null); toast({ title: "Dessin supprimé" }); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dessins</h1>
          <p className="text-sm text-muted-foreground">{data.dessins.length} dessins</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-md">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")} className="h-9 w-9 rounded-r-none"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("table")} className="h-9 w-9 rounded-l-none"><List className="h-4 w-4" /></Button>
          </div>
          {canManage && <Button onClick={openAdd} className="active:scale-[0.97]"><Plus className="h-4 w-4 mr-1" />Déposer un dessin</Button>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterConcours} onValueChange={setFilterConcours}>
          <SelectTrigger className="w-full sm:w-[220px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les concours</SelectItem>
            {data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length === 0 ? <p className="text-muted-foreground col-span-full text-center py-8">Aucun dessin trouvé</p> :
            filtered.map(d => {
              const avg = getAvgNote(d.numDessin);
              const imageSrc = resolveDessinVisual(d.leDessin, d.titre, getConcoursTheme(d.numConcours));
              return (
                <Card key={d.numDessin} className="hover:shadow-md transition-shadow duration-200 group">
                  <CardContent className="p-4">
                    {imageSrc ? (
                      <div className="mb-3 bg-muted/40 rounded-lg overflow-hidden border">
                        <img
                          src={imageSrc}
                          alt={d.titre}
                          className="w-full h-36 object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="text-4xl mb-3 text-center py-6 bg-muted/50 rounded-lg">{d.leDessin || "🎨"}</div>
                    )}
                    <h3 className="font-semibold text-sm truncate">{d.titre}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{getCompName(d.numCompetiteur)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-[10px]">{getConcoursTheme(d.numConcours)}</Badge>
                      {avg && <span className="text-xs font-medium tabular-nums">{avg}/20</span>}
                    </div>
                    {d.classement && <Badge className="mt-2 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-0">#{d.classement}</Badge>}
                    {canEditDessin(d) ? (
                      <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(d.numDessin)} className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Compétiteur</TableHead>
                    <TableHead>Concours</TableHead>
                    <TableHead className="text-center">Note moy.</TableHead>
                    <TableHead className="text-center">Classement</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun dessin</TableCell></TableRow>
                  ) : filtered.map(d => (
                    <TableRow key={d.numDessin}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {resolveDessinVisual(d.leDessin, d.titre, getConcoursTheme(d.numConcours)) ? (
                            <img
                              src={resolveDessinVisual(d.leDessin, d.titre, getConcoursTheme(d.numConcours)) || ""}
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
                      <TableCell>{getCompName(d.numCompetiteur)}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{getConcoursTheme(d.numConcours)}</Badge></TableCell>
                      <TableCell className="text-center tabular-nums">{getAvgNote(d.numDessin) || "—"}</TableCell>
                      <TableCell className="text-center">{d.classement ? `#${d.classement}` : "—"}</TableCell>
                      <TableCell className="text-right">
                        {canEditDessin(d) ? (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(d)} className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(d.numDessin)} className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">Lecture seule</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={modalOpen} onOpenChange={(open) => { setModalOpen(open); if (!open) setSelectedFile(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Modifier le dessin" : "Déposer un dessin"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Titre *</Label><Input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} /></div>
            <div>
              <Label>Image (PNG / JPG / WEBP, max 5 Mo)</Label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              {selectedFile ? <p className="text-xs text-muted-foreground mt-1">Fichier sélectionné: {selectedFile.name}</p> : null}
            </div>
            <div>
              <Label>Chemin image / illustration</Label>
              <Input
                value={form.leDessin}
                onChange={e => setForm({ ...form, leDessin: e.target.value })}
                placeholder="/uploads/dessins/... (auto), URL image, data:image..."
              />
            </div>
            <div><Label>Commentaire</Label><Input value={form.commentaire} onChange={e => setForm({ ...form, commentaire: e.target.value })} /></div>
            <div><Label>Date de remise</Label><Input type="date" value={form.dateRemise} onChange={e => setForm({ ...form, dateRemise: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Compétiteur</Label>
                {isCompetiteur ? (
                  <Input value={getCompName(currentUserId)} disabled />
                ) : (
                  <Select value={String(form.numCompetiteur)} onValueChange={v => setForm({ ...form, numCompetiteur: parseInt(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{data.competiteurs.map(c => { const u = data.utilisateurs.find(u => u.numUtilisateur === c.numUtilisateur); return <SelectItem key={c.numUtilisateur} value={String(c.numUtilisateur)}>{u ? `${u.prenom} ${u.nom}` : `#${c.numUtilisateur}`}</SelectItem>; })}</SelectContent>
                  </Select>
                )}
              </div>
              <div><Label>Concours</Label>
                <Select value={String(form.numConcours)} onValueChange={v => setForm({ ...form, numConcours: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={uploading}>{uploading ? "Upload..." : (editing ? "Enregistrer" : "Déposer")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Supprimer ce dessin et ses évaluations ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
