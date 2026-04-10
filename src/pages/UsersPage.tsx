import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import type { Utilisateur } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const roleBadgeColors: Record<string, string> = {
  administrateur: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  directeur: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  president: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  competiteur: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  evaluateur: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  aucun: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

const emptyUser = { nom: "", prenom: "", adresse: "", login: "", motDePasse: "", email: "", dateNaissance: "", numClub: 0 };

export default function UsersPage() {
  const { data, addUtilisateur, updateUtilisateur, deleteUtilisateur, getUserRole } = useData();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterClub, setFilterClub] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [form, setForm] = useState(emptyUser);
  const [roleType, setRoleType] = useState("competiteur");
  const [roleDetails, setRoleDetails] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = data.utilisateurs.filter(u => {
    const role = getUserRole(u.numUtilisateur);
    const matchSearch = `${u.nom} ${u.prenom} ${u.login} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || role === filterRole;
    const matchClub = filterClub === "all" || u.numClub === parseInt(filterClub);
    return matchSearch && matchRole && matchClub;
  });

  const openAdd = () => {
    setEditing(null); setForm(emptyUser); setRoleType("competiteur"); setRoleDetails({});
    setModalOpen(true);
  };
  const openEdit = (u: Utilisateur) => {
    setEditing(u); setForm({ nom: u.nom, prenom: u.prenom, adresse: u.adresse, login: u.login, motDePasse: u.motDePasse, email: u.email, dateNaissance: u.dateNaissance, numClub: u.numClub });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenom.trim() || !form.login.trim()) {
      toast({ title: "Erreur", description: "Nom, prénom et login requis.", variant: "destructive" }); return;
    }
    if (editing) {
      const err = await updateUtilisateur({ ...editing, ...form });
      if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
      toast({ title: "Utilisateur modifié" });
    } else {
      const details: any = {};
      if (roleType === 'competiteur') { details.datePremiereParticipation = roleDetails.datePremiereParticipation || new Date().toISOString().slice(0,10); details.categorie = roleDetails.categorie || 'junior'; }
      else if (roleType === 'evaluateur') { details.specialite = roleDetails.specialite || ''; details.niveau = roleDetails.niveau || 'debutant'; details.experience = roleDetails.experience || 0; }
      else if (roleType === 'directeur') { details.dateDebut = roleDetails.dateDebut || new Date().toISOString().slice(0,10); details.numClub = form.numClub; }
      else if (roleType === 'president') { details.prime = roleDetails.prime || 0; details.dateElection = roleDetails.dateElection || new Date().toISOString().slice(0,10); }
      else if (roleType === 'administrateur') { details.dateDebut = roleDetails.dateDebut || new Date().toISOString().slice(0,10); }
      const err = await addUtilisateur(form, { type: roleType, details });
      if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; }
      toast({ title: "Utilisateur ajouté" });
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: number) => { const err = await deleteUtilisateur(id); setDeleteConfirm(null); if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; } toast({ title: "Utilisateur supprimé" }); };

  const getClubName = (numClub: number) => data.clubs.find(c => c.numClub === numClub)?.nomClub || "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">{data.utilisateurs.length} utilisateurs</p>
        </div>
        <Button onClick={openAdd} className="active:scale-[0.97]"><Plus className="h-4 w-4 mr-1" />Nouvel utilisateur</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {['administrateur','directeur','president','competiteur','evaluateur'].map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterClub} onValueChange={setFilterClub}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clubs</SelectItem>
                {data.clubs.map(c => <SelectItem key={c.numClub} value={String(c.numClub)}>{c.nomClub}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Club</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Aucun utilisateur trouvé</TableCell></TableRow>
                ) : filtered.map(u => {
                  const role = getUserRole(u.numUtilisateur);
                  return (
                    <TableRow key={u.numUtilisateur}>
                      <TableCell className="font-medium">{u.prenom} {u.nom}</TableCell>
                      <TableCell className="text-muted-foreground">{u.login}</TableCell>
                      <TableCell className="text-sm">{getClubName(u.numClub)}</TableCell>
                      <TableCell><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleBadgeColors[role]}`}>{role}</span></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(u)} className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(u.numUtilisateur)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nom *</Label><Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} /></div>
              <div><Label>Prénom *</Label><Input value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Login *</Label><Input value={form.login} onChange={e => setForm({ ...form, login: e.target.value })} /></div>
              <div><Label>Mot de passe</Label><Input type="password" value={form.motDePasse} onChange={e => setForm({ ...form, motDePasse: e.target.value })} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date de naissance</Label><Input type="date" value={form.dateNaissance} onChange={e => setForm({ ...form, dateNaissance: e.target.value })} /></div>
              <div><Label>Club</Label>
                <Select value={String(form.numClub)} onValueChange={v => setForm({ ...form, numClub: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{data.clubs.map(c => <SelectItem key={c.numClub} value={String(c.numClub)}>{c.nomClub}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Adresse</Label><Input value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} /></div>

            {!editing && (
              <>
                <div><Label>Rôle</Label>
                  <Select value={roleType} onValueChange={v => { setRoleType(v); setRoleDetails({}); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['administrateur','directeur','president','competiteur','evaluateur'].map(r => <SelectItem key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {roleType === 'competiteur' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Catégorie</Label>
                      <Select value={roleDetails.categorie || 'junior'} onValueChange={v => setRoleDetails({ ...roleDetails, categorie: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="junior">Junior</SelectItem><SelectItem value="senior">Senior</SelectItem><SelectItem value="pro">Pro</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>1ère participation</Label><Input type="date" value={roleDetails.datePremiereParticipation || ''} onChange={e => setRoleDetails({ ...roleDetails, datePremiereParticipation: e.target.value })} /></div>
                  </div>
                )}
                {roleType === 'evaluateur' && (
                  <div className="grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Spécialité</Label><Input value={roleDetails.specialite || ''} onChange={e => setRoleDetails({ ...roleDetails, specialite: e.target.value })} /></div>
                      <div><Label>Expérience (ans)</Label><Input type="number" value={roleDetails.experience || 0} onChange={e => setRoleDetails({ ...roleDetails, experience: parseInt(e.target.value) || 0 })} /></div>
                    </div>
                    <div><Label>Niveau</Label>
                      <Select value={roleDetails.niveau || 'debutant'} onValueChange={v => setRoleDetails({ ...roleDetails, niveau: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="debutant">Débutant</SelectItem><SelectItem value="intermediaire">Intermédiaire</SelectItem><SelectItem value="avance">Avancé</SelectItem><SelectItem value="expert">Expert</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {roleType === 'president' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Prime (€)</Label><Input type="number" value={roleDetails.prime || 0} onChange={e => setRoleDetails({ ...roleDetails, prime: parseFloat(e.target.value) || 0 })} /></div>
                    <div><Label>Date d'élection</Label><Input type="date" value={roleDetails.dateElection || ''} onChange={e => setRoleDetails({ ...roleDetails, dateElection: e.target.value })} /></div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave} className="active:scale-[0.97]">{editing ? "Enregistrer" : "Ajouter"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Supprimer cet utilisateur et toutes ses données associées ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
