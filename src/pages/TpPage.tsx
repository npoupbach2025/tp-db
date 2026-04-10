import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TpPayload {
  meta: { title: string; sourceRoot: string };
  docs: {
    etape0: string;
    etape2: string;
    etape3: string;
    schemaTextuel: string;
  };
  sql: Record<string, string>;
  uml: {
    diagrammeClassesPuml: string;
    schemaLogiquePuml: string;
    diagrammeClassesDrawioXml: string;
    schemaLogiqueDrawioXml: string;
  };
}

interface SqlConsoleResult {
  query: string;
  sqliteQuery?: string;
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
  truncated: boolean;
  maxRows: number;
  executionMs: number;
  mode?: "read" | "write";
  changes?: number;
  lastInsertRowid?: number | null;
}

interface SqlHistoryEntry {
  id: number;
  query: string;
  createdAt: string;
  status: "success" | "error";
  result?: SqlConsoleResult;
  error?: string;
}

function CodeBlock({ content }: { content: string }) {
  return (
    <pre className="rounded-md border bg-muted/40 p-3 text-xs leading-relaxed whitespace-pre-wrap overflow-auto max-h-[520px]">
      {content || "(vide)"}
    </pre>
  );
}

export default function TpPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tp, setTp] = useState<TpPayload | null>(null);
  const [sqlInput, setSqlInput] = useState("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  const [sqlLoading, setSqlLoading] = useState(false);
  const [sqlHistory, setSqlHistory] = useState<SqlHistoryEntry[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.getTpContent() as TpPayload;
        setTp(data);
      } catch (e: any) {
        setError(e.message || "Impossible de charger le contenu TP");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const requetes = useMemo(() => {
    if (!tp) return [] as { key: string; label: string; content: string }[];
    return Object.entries(tp.sql)
      .filter(([k]) => /^requete\d+$/i.test(k))
      .sort((a, b) => Number(a[0].replace(/\D/g, "")) - Number(b[0].replace(/\D/g, "")))
      .map(([k, v]) => ({ key: k, label: k.replace("requete", "Requête "), content: v }));
  }, [tp]);

  const runSql = async () => {
    const query = sqlInput.trim();
    if (!query) return;

    try {
      setSqlLoading(true);
      const result = await api.executeSqlConsole(query) as SqlConsoleResult;
      setSqlHistory((prev) => [{
        id: Date.now(),
        query,
        createdAt: new Date().toLocaleTimeString(),
        status: "success",
        result,
      }, ...prev].slice(0, 20));
    } catch (e: any) {
      setSqlHistory((prev) => [{
        id: Date.now(),
        query,
        createdAt: new Date().toLocaleTimeString(),
        status: "error",
        error: e.message || "Erreur SQL",
      }, ...prev].slice(0, 20));
    } finally {
      setSqlLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">TP — Dossier complet</h1>
        <p className="text-sm text-muted-foreground">Toutes les sections du TP au même endroit : docs, SQL, schémas UML</p>
      </div>

      {loading ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Chargement du contenu TP...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-6 text-sm text-destructive">{error}</CardContent></Card>
      ) : !tp ? (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Aucune donnée TP.</CardContent></Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-3">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="docs">Docs</TabsTrigger>
            <TabsTrigger value="sql">SQL</TabsTrigger>
            <TabsTrigger value="requetes">Requêtes 1-10</TabsTrigger>
            <TabsTrigger value="uml">UML</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Console SQL (lecture)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={sqlInput}
                    onChange={(e) => setSqlInput(e.target.value)}
                    placeholder="Écris une requête SQL..."
                    className="min-h-[120px] font-mono text-xs"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                        e.preventDefault();
                        runSql();
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={runSql} disabled={sqlLoading}>{sqlLoading ? "Exécution..." : "Exécuter (Ctrl+Entrée)"}</Button>
                    <Button variant="outline" onClick={() => setSqlHistory([])}>Vider l'historique</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Autorisé: SELECT / WITH / PRAGMA / EXPLAIN / INSERT / UPDATE / DELETE (une seule requête à la fois). Mots de passe et comptes admin protégés.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Historique SQL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sqlHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucune requête exécutée pour le moment.</p>
                  ) : sqlHistory.map((entry) => (
                    <div key={entry.id} className="rounded-md border p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{entry.createdAt}</span>
                        <span className={entry.status === "success" ? "text-green-600" : "text-destructive"}>
                          {entry.status === "success" ? "OK" : "Erreur"}
                        </span>
                      </div>
                      <pre className="rounded-md bg-muted/40 p-2 text-xs overflow-auto">{entry.query}</pre>

                      {entry.status === "error" ? (
                        <p className="text-sm text-destructive">{entry.error}</p>
                      ) : entry.result ? (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            {entry.result.totalRows} ligne(s) en {entry.result.executionMs} ms
                            {entry.result.truncated ? ` (affichage limité à ${entry.result.maxRows})` : ""}
                          </p>
                          {entry.result.mode === "write" ? (
                            <p className="text-xs text-muted-foreground">
                              Écriture appliquée: {entry.result.changes ?? 0} ligne(s) modifiée(s)
                              {entry.result.lastInsertRowid != null ? `, lastInsertRowid=${entry.result.lastInsertRowid}` : ""}
                            </p>
                          ) : null}
                          {entry.result.columns.length > 0 ? (
                            <div className="rounded-md border overflow-auto max-h-[280px]">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {entry.result.columns.map((col) => <TableHead key={col}>{col}</TableHead>)}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {entry.result.rows.map((row, idx) => (
                                    <TableRow key={idx}>
                                      {entry.result!.columns.map((col) => (
                                        <TableCell key={col} className="text-xs">{String(row[col] ?? "")}</TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Requête exécutée, aucun jeu de résultats.</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Étape 0 — Compréhension</CardTitle></CardHeader>
                <CardContent><CodeBlock content={tp.docs.etape0} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Étape 2 — Contraintes</CardTitle></CardHeader>
                <CardContent><CodeBlock content={tp.docs.etape2} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Étape 3 — Schéma logique</CardTitle></CardHeader>
                <CardContent><CodeBlock content={tp.docs.etape3} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Schéma logique textuel</CardTitle></CardHeader>
                <CardContent><CodeBlock content={tp.docs.schemaTextuel} /></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sql">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">creationConcoursDessins.sql</CardTitle></CardHeader>
                <CardContent><CodeBlock content={tp.sql.creation} /></CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">triggers.sql</CardTitle></CardHeader>
                <CardContent><CodeBlock content={tp.sql.triggers} /></CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requetes">
            <div className="grid gap-4">
              {requetes.map((q) => (
                <Card key={q.key}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{q.label}</CardTitle></CardHeader>
                  <CardContent><CodeBlock content={q.content} /></CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="uml">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Diagramme de classes</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <img
                    src="/classes.png"
                    alt="Diagramme de classes"
                    className="w-full max-h-[62vh] object-contain rounded-md border bg-white"
                    loading="lazy"
                  />
                  <div>
                    <a
                      href="/classes.png"
                      download="diagramme-classes.png"
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Télécharger PNG
                    </a>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-sm text-muted-foreground">Voir le code PlantUML</summary>
                    <div className="mt-2"><CodeBlock content={tp.uml.diagrammeClassesPuml} /></div>
                  </details>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">Schéma logique relationnel</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <img
                    src="/logique.png"
                    alt="Schéma logique relationnel"
                    className="w-full max-h-[62vh] object-contain rounded-md border bg-white"
                    loading="lazy"
                  />
                  <div>
                    <a
                      href="/logique.png"
                      download="schema-logique.png"
                      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Télécharger PNG
                    </a>
                  </div>
                  <details>
                    <summary className="cursor-pointer text-sm text-muted-foreground">Voir le code PlantUML</summary>
                    <div className="mt-2"><CodeBlock content={tp.uml.schemaLogiquePuml} /></div>
                  </details>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
