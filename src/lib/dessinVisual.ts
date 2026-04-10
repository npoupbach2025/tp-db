const palettes = [
  ["#f8fafc", "#dbeafe", "#bfdbfe", "#2563eb"],
  ["#f0fdf4", "#dcfce7", "#86efac", "#16a34a"],
  ["#fff7ed", "#ffedd5", "#fdba74", "#ea580c"],
  ["#fdf4ff", "#fae8ff", "#d8b4fe", "#9333ea"],
  ["#ecfeff", "#cffafe", "#67e8f9", "#0891b2"],
];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = ((h << 5) - h + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function looksLikeImagePath(value: string): boolean {
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(value);
}

function isDirectImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("/") || value.startsWith("data:image/");
}

function makeSvgDataUrl(seedText: string, caption: string): string {
  const seed = hash(seedText || caption || "dessin");
  const palette = palettes[seed % palettes.length];
  const rotation = seed % 14;
  const c1x = 30 + (seed % 40);
  const c1y = 24 + ((seed >> 2) % 30);
  const c2x = 120 + ((seed >> 3) % 50);
  const c2y = 36 + ((seed >> 4) % 35);
  const label = (caption || "Dessin").slice(0, 30).replace(/[&<>]/g, "");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette[0]}" />
      <stop offset="100%" stop-color="${palette[1]}" />
    </linearGradient>
  </defs>
  <rect width="480" height="300" rx="22" fill="url(#bg)" />
  <circle cx="${c1x}" cy="${c1y}" r="88" fill="${palette[2]}" opacity="0.35" />
  <circle cx="${c2x}" cy="${c2y}" r="76" fill="${palette[3]}" opacity="0.22" />
  <g transform="translate(240,150) rotate(${rotation})">
    <rect x="-140" y="-84" width="280" height="168" rx="14" fill="#ffffff" opacity="0.86" />
    <path d="M -112 52 C -76 -6 -22 4 9 -26 C 39 -56 74 -40 110 -64" stroke="${palette[3]}" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M -102 12 C -60 0 -12 30 22 10 C 62 -16 80 4 120 -8" stroke="${palette[2]}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9" />
    <circle cx="-62" cy="-24" r="12" fill="${palette[2]}" />
    <circle cx="22" cy="-44" r="10" fill="${palette[3]}" opacity="0.8" />
    <circle cx="92" cy="22" r="14" fill="${palette[2]}" opacity="0.85" />
  </g>
  <text x="240" y="278" text-anchor="middle" font-size="18" fill="#1f2937" font-family="Segoe UI, Arial, sans-serif">${label}</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function resolveDessinVisual(leDessin: string | null | undefined, titre: string, concoursTheme?: string): string | null {
  const value = (leDessin || "").trim();
  if (!value) {
    return makeSvgDataUrl(`${titre}-${concoursTheme || ""}`, titre || "Dessin");
  }

  if (isDirectImageUrl(value)) {
    return value;
  }

  if (looksLikeImagePath(value) || value.startsWith("img_")) {
    return makeSvgDataUrl(`${value}-${titre}-${concoursTheme || ""}`, titre || value);
  }

  return null;
}
