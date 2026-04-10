import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RequeteTpResult {
  id: number;
  titre: string;
  rows: Record<string, any>[];
}

export default function RequetesTpPage() {
  const [loading, setLoading] = useState(true);
  const [requetes, setRequetes] = useState<RequeteTpResult[]>([]);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.getRequetesTp() as RequeteTpResult[];
        setRequetes(data);
        if (data.length > 0) setSelectedId(String(data[0].id));
      } catch (e: any) {
        setError(e.message || "Erreur lors du chargement des requêtes TP");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = requetes.find(r => String(r.id) === selectedId);
  const headers = selected?.rows?.[0] ? Object.keys(selected.rows[0]) : [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Requêtes TP</h1>
        <p className="text-sm text-muted-foreground">Résultats des 10 requêtes SQL du TP (5 imposées + 5 libres)</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sélection d'une requête</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full sm:w-[460px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {requetes.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{`R${r.id} — ${r.titre}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {selected ? `Requête ${selected.id} — ${selected.titre}` : "Résultat"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Aucune requête sélectionnée.</p>
          ) : selected.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun résultat.</p>
          ) : (
            <div className="rounded-md border overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.rows.map((row, idx) => (
                    <TableRow key={idx}>
                      {headers.map(h => (
                        <TableCell key={h} className="text-sm">{String(row[h] ?? "")}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
