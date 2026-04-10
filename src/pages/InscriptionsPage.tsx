import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

export default function InscriptionsPage() {
  const { data, addParticipationClub, deleteParticipationClub, addInscriptionCompetiteur, deleteInscriptionCompetiteur, addInscriptionEvaluateur, deleteInscriptionEvaluateur } = useData();
  const [tab, setTab] = useState("clubs");
  const [filterConcours, setFilterConcours] = useState("all");
  const [modalType, setModalType] = useState<string | null>(null);
  const [formClub, setFormClub] = useState({ numClub: 0, numConcours: 0 });
  const [formComp, setFormComp] = useState({ numCompetiteur: 0, numConcours: 0 });
  const [formEval, setFormEval] = useState({ numEvaluateur: 0, numConcours: 0 });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; a: number; b: number } | null>(null);

  const getName = (id: number) => { const u = data.utilisateurs.find(u => u.numUtilisateur === id); return u ? `${u.prenom} ${u.nom}` : "—"; };
  const getClubName = (id: number) => data.clubs.find(c => c.numClub === id)?.nomClub || "—";
  const getConcoursTheme = (id: number) => data.concours.find(c => c.numConcours === id)?.theme || "—";

  const filteredClubs = data.participationsClubConcours.filter(p => filterConcours === "all" || p.numConcours === parseInt(filterConcours));
  const filteredComps = data.inscriptionsCompetiteurConcours.filter(i => filterConcours === "all" || i.numConcours === parseInt(filterConcours));
  const filteredEvals = data.inscriptionsEvaluateurConcours.filter(i => filterConcours === "all" || i.numConcours === parseInt(filterConcours));

  const openModal = (type: string) => {
    const defaultConcours = data.concours[0]?.numConcours || 0;
    if (type === "club") setFormClub({ numClub: data.clubs[0]?.numClub || 0, numConcours: defaultConcours });
    if (type === "comp") setFormComp({ numCompetiteur: data.competiteurs[0]?.numUtilisateur || 0, numConcours: defaultConcours });
    if (type === "eval") setFormEval({ numEvaluateur: data.evaluateurs[0]?.numUtilisateur || 0, numConcours: defaultConcours });
    setModalType(type);
  };

  const handleSave = async () => {
    if (modalType === "club") { await addParticipationClub(formClub); toast({ title: "Participation ajoutée" }); }
    if (modalType === "comp") { const err = await addInscriptionCompetiteur(formComp); if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; } toast({ title: "Inscription ajoutée" }); }
    if (modalType === "eval") { const err = await addInscriptionEvaluateur(formEval); if (err) { toast({ title: "Erreur", description: err, variant: "destructive" }); return; } toast({ title: "Inscription ajoutée" }); }
    setModalType(null);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "club") deleteParticipationClub(deleteConfirm.a, deleteConfirm.b);
    if (deleteConfirm.type === "comp") deleteInscriptionCompetiteur(deleteConfirm.a, deleteConfirm.b);
    if (deleteConfirm.type === "eval") deleteInscriptionEvaluateur(deleteConfirm.a, deleteConfirm.b);
    setDeleteConfirm(null);
    toast({ title: "Inscription supprimée" });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inscriptions</h1>
        <p className="text-sm text-muted-foreground">Gestion des inscriptions aux concours</p>
      </div>

      <div className="flex gap-3">
        <Select value={filterConcours} onValueChange={setFilterConcours}>
          <SelectTrigger className="w-full sm:w-[250px]"><SelectValue placeholder="Filtrer par concours" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les concours</SelectItem>
            {data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="clubs">Clubs ({filteredClubs.length})</TabsTrigger>
          <TabsTrigger value="competiteurs">Compétiteurs ({filteredComps.length})</TabsTrigger>
          <TabsTrigger value="evaluateurs">Évaluateurs ({filteredEvals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="clubs">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Participations Clubs ↔ Concours</CardTitle>
              <Button size="sm" onClick={() => openModal("club")}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Club</TableHead><TableHead>Concours</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredClubs.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Aucune participation</TableCell></TableRow> :
                      filteredClubs.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{getClubName(p.numClub)}</TableCell>
                          <TableCell>{getConcoursTheme(p.numConcours)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm({ type: "club", a: p.numClub, b: p.numConcours })}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competiteurs">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Inscriptions Compétiteurs ↔ Concours</CardTitle>
              <Button size="sm" onClick={() => openModal("comp")}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Compétiteur</TableHead><TableHead>Concours</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredComps.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Aucune inscription</TableCell></TableRow> :
                      filteredComps.map((i, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{getName(i.numCompetiteur)}</TableCell>
                          <TableCell>{getConcoursTheme(i.numConcours)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm({ type: "comp", a: i.numCompetiteur, b: i.numConcours })}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluateurs">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Inscriptions Évaluateurs ↔ Concours</CardTitle>
              <Button size="sm" onClick={() => openModal("eval")}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Évaluateur</TableHead><TableHead>Concours</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredEvals.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">Aucune inscription</TableCell></TableRow> :
                      filteredEvals.map((i, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{getName(i.numEvaluateur)}</TableCell>
                          <TableCell>{getConcoursTheme(i.numConcours)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm({ type: "eval", a: i.numEvaluateur, b: i.numConcours })}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add modals */}
      <Dialog open={modalType !== null} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nouvelle inscription</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            {modalType === "club" && (
              <>
                <div><Label>Club</Label><Select value={String(formClub.numClub)} onValueChange={v => setFormClub({ ...formClub, numClub: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{data.clubs.map(c => <SelectItem key={c.numClub} value={String(c.numClub)}>{c.nomClub}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Concours</Label><Select value={String(formClub.numConcours)} onValueChange={v => setFormClub({ ...formClub, numConcours: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}</SelectContent></Select></div>
              </>
            )}
            {modalType === "comp" && (
              <>
                <div><Label>Compétiteur</Label><Select value={String(formComp.numCompetiteur)} onValueChange={v => setFormComp({ ...formComp, numCompetiteur: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{data.competiteurs.map(c => <SelectItem key={c.numUtilisateur} value={String(c.numUtilisateur)}>{getName(c.numUtilisateur)}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Concours</Label><Select value={String(formComp.numConcours)} onValueChange={v => setFormComp({ ...formComp, numConcours: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}</SelectContent></Select></div>
              </>
            )}
            {modalType === "eval" && (
              <>
                <div><Label>Évaluateur</Label><Select value={String(formEval.numEvaluateur)} onValueChange={v => setFormEval({ ...formEval, numEvaluateur: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{data.evaluateurs.map(e => <SelectItem key={e.numUtilisateur} value={String(e.numUtilisateur)}>{getName(e.numUtilisateur)}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Concours</Label><Select value={String(formEval.numConcours)} onValueChange={v => setFormEval({ ...formEval, numConcours: parseInt(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{data.concours.map(c => <SelectItem key={c.numConcours} value={String(c.numConcours)}>{c.theme}</SelectItem>)}</SelectContent></Select></div>
              </>
            )}
          </div>
          <DialogFooter><Button onClick={handleSave}>Ajouter</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirmer la suppression</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Supprimer cette inscription ?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
