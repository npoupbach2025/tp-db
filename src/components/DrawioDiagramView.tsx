import { useMemo } from "react";

type TableNode = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  lines: string[];
};

type Link = {
  id: string;
  from: string;
  to: string;
  label: string;
};

function toNumber(v: string | null | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function cleanText(value: string | null) {
  if (!value) return "";
  return value.replace(/\r/g, "").trim();
}

function isTableLikeStyle(style: string) {
  return style.includes("shape=table") || style.includes("swimlane");
}

function parseDrawio(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const cellEls = Array.from(doc.getElementsByTagName("mxCell"));
  const cellsById = new Map<string, Element>();
  const parentById = new Map<string, string>();

  for (const el of cellEls) {
    const id = el.getAttribute("id");
    if (!id) continue;
    cellsById.set(id, el);
    const parent = el.getAttribute("parent");
    if (parent) parentById.set(id, parent);
  }

  const tableCells = cellEls.filter((el) => {
    if (el.getAttribute("vertex") !== "1") return false;
    const style = el.getAttribute("style") || "";
    return isTableLikeStyle(style) && !style.includes("shape=tableRow");
  });

  const tables: TableNode[] = tableCells.map((tableEl) => {
    const id = tableEl.getAttribute("id") || "";
    const value = cleanText(tableEl.getAttribute("value"));
    const geom = tableEl.getElementsByTagName("mxGeometry")[0];

    const x = toNumber(geom?.getAttribute("x"), 0);
    const y = toNumber(geom?.getAttribute("y"), 0);
    const width = toNumber(geom?.getAttribute("width"), 220);
    const height = toNumber(geom?.getAttribute("height"), 120);

    const rowCells = cellEls
      .filter((el) => el.getAttribute("parent") === id)
      .filter((el) => (el.getAttribute("style") || "").includes("shape=tableRow"));

    const directTextCells = cellEls
      .filter((el) => el.getAttribute("parent") === id)
      .filter((el) => {
        if (el.getAttribute("vertex") !== "1") return false;
        const s = el.getAttribute("style") || "";
        return s.includes("text;") || s.startsWith("text");
      });

    const lines: string[] = [];
    for (const row of rowCells) {
      const rowId = row.getAttribute("id") || "";
      const rowChildren = cellEls
        .filter((el) => el.getAttribute("parent") === rowId)
        .sort((a, b) => {
          const ga = a.getElementsByTagName("mxGeometry")[0];
          const gb = b.getElementsByTagName("mxGeometry")[0];
          return toNumber(ga?.getAttribute("x"), 0) - toNumber(gb?.getAttribute("x"), 0);
        });

      const textual = rowChildren
        .map((c) => cleanText(c.getAttribute("value")))
        .filter(Boolean)
        .join(" ")
        .trim();

      if (!textual) continue;

      const split = textual
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((s) => !/^PK$|^FK$|^PK,FK$/i.test(s));

      lines.push(...split);
    }

    for (const textCell of directTextCells) {
      const text = cleanText(textCell.getAttribute("value"));
      if (!text) continue;
      const split = text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      lines.push(...split);
    }

    return { id, title: value || id, x, y, width, height, lines };
  });

  const tableIdSet = new Set(tables.map((t) => t.id));

  const resolveTableId = (id: string | null): string | null => {
    let cur = id;
    while (cur) {
      if (tableIdSet.has(cur)) return cur;
      cur = parentById.get(cur) || null;
    }
    return null;
  };

  const edgeCells = cellEls.filter((el) => el.getAttribute("edge") === "1");
  const links: Link[] = [];

  for (const edge of edgeCells) {
    const edgeId = edge.getAttribute("id") || Math.random().toString(36).slice(2);
    const source = resolveTableId(edge.getAttribute("source"));
    const target = resolveTableId(edge.getAttribute("target"));
    if (!source || !target || source === target) continue;

    links.push({
      id: edgeId,
      from: source,
      to: target,
      label: cleanText(edge.getAttribute("value")),
    });
  }

  const uniqueLinksMap = new Map<string, Link>();
  for (const l of links) {
    const key = `${l.from}->${l.to}:${l.label}`;
    if (!uniqueLinksMap.has(key)) uniqueLinksMap.set(key, l);
  }

  const uniqueLinks = Array.from(uniqueLinksMap.values());

  return { tables, links: uniqueLinks };
}

function centerPoint(t: TableNode) {
  return { x: t.x + t.width / 2, y: t.y + t.height / 2 };
}

export function DrawioDiagramView({ xml, title }: { xml: string; title: string }) {
  const { tables, links } = useMemo(() => parseDrawio(xml), [xml]);

  const bounds = useMemo(() => {
    const maxX = Math.max(...tables.map((t) => t.x + t.width), 1200);
    const maxY = Math.max(...tables.map((t) => t.y + t.height), 900);
    return { width: maxX + 120, height: maxY + 120 };
  }, [tables]);

  const tableMap = useMemo(() => new Map(tables.map((t) => [t.id, t])), [tables]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{title}</p>
      <div className="rounded-md border bg-background overflow-auto">
        <div className="relative" style={{ width: bounds.width, height: bounds.height }}>
          <svg className="absolute inset-0" width={bounds.width} height={bounds.height}>
            <defs>
              <marker id="arrow-end" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {links.map((l) => {
              const a = tableMap.get(l.from);
              const b = tableMap.get(l.to);
              if (!a || !b) return null;
              const p1 = centerPoint(a);
              const p2 = centerPoint(b);
              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2;

              return (
                <g key={l.id} className="text-muted-foreground">
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" strokeWidth="1.1" markerEnd="url(#arrow-end)" />
                  {l.label ? (
                    <text x={mx} y={my - 4} fontSize="10" textAnchor="middle" fill="currentColor">
                      {l.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>

          {tables.map((t) => (
            <div
              key={t.id}
              className="absolute rounded-md border border-slate-300 bg-white shadow-sm text-[11px] leading-snug"
              style={{ left: t.x, top: t.y, width: t.width, minHeight: t.height }}
            >
              <div className="px-2 py-1.5 border-b bg-slate-100 font-semibold tracking-wide">{t.title}</div>
              <div className="px-2 py-1 whitespace-pre-wrap">
                {t.lines.length > 0 ? t.lines.join("\n") : "(détails non extraits)"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
