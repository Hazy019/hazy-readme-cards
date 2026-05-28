export const config = { runtime: "edge" };

const USERNAME = "Hazy019";

// ── Language Aesthetics Map ──────────────────────────────────────────────────
const LANG_META = {
  TypeScript:  { color: "#3178c6" },
  Python:      { color: "#3572a5" },
  JavaScript:  { color: "#f1e05a" },
  CSS:         { color: "#8b5cf6" },
  HTML:        { color: "#e34c26" },
  Shell:       { color: "#89e051" },
  default:     { color: "#8b949e" },
};

// ── Secure System Fallbacks ──────────────────────────────────────────────────
const FB_LANGS = [
  { name: "TypeScript", bytes: 41000 },
  { name: "Python",     bytes: 36000 },
  { name: "CSS",        bytes: 11000 },
  { name: "JavaScript", bytes:  7000 },
  { name: "HTML",       bytes:  3200 },
];

function fmtBytes(b) {
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)}MB`;
  if (b >= 1_000)     return `${Math.round(b / 1_000)}KB`;
  return `${b}B`;
}

// ── Live Automated Data Fetching ──────────────────────────────────────────────
async function fetchEngineData() {
  const token = typeof globalThis !== "undefined" && globalThis.GITHUB_TOKEN;
  const hdrs = {
    "User-Agent": "hazy-skills-pipeline/3.5",
    Accept: "application/vnd.github.v3+json",
    ...(token && { Authorization: `Bearer ${token}` })
  };

  try {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=40&type=owner`, { headers: hdrs });
    if (!res.ok) throw new Error("FALLBACK_TRIGGER");
    const repos = await res.json();

    if (!Array.isArray(repos) || repos.length === 0) throw new Error("EMPTY_DATA");

    const langMap = {};
    // Query individual language splits for high fidelity analysis
    const languagesData = await Promise.allSettled(
      repos.slice(0, 15).map(r =>
        fetch(`https://api.github.com/repos/${USERNAME}/${r.name}/languages`, { headers: hdrs })
          .then(res => res.ok ? res.json() : {}).catch(() => ({}))
      )
    );

    languagesData.forEach(result => {
      if (result.status === "fulfilled") {
        Object.entries(result.value).forEach(([lang, bytes]) => {
          langMap[lang] = (langMap[lang] || 0) + bytes;
        });
      }
    });

    const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);
    if (totalBytes === 0) throw new Error("NO_BYTES");

    const langs = Object.entries(langMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, bytes]) => ({
        name,
        bytes,
        pct: Math.round((bytes / totalBytes) * 100)
      }));

    return { langs, totalBytes, source: "LIVE · Code Extraction Engine" };
  } catch {
    const fbTotal = FB_LANGS.reduce((a, l) => a + l.bytes, 0);
    return {
      langs: FB_LANGS.map(l => ({ ...l, pct: Math.round((l.bytes / fbTotal) * 100) })),
      totalBytes: fbTotal,
      source: "SYSTEM · Cached Matrix"
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  RENDER ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:      "#0a0c10",
        text:    "#e6edf3",
        muted:   "#8b949e",
        dim:     "#6e7681",
        border:  "#30363d",
        border2: "#21262d",
        accent:  "#39d353",
        tagBg:   "#12151b",
        tagText: "#8b949e",
        tagBdr:  "#30363d",
        shimmer: "0.12"
      }
    : {
        bg:      "#fcfbf9",
        text:    "#1a1a1a",
        muted:   "#57606a",
        dim:     "#8c959f",
        border:  "#e5e1d8",
        border2: "#d4cdbc",
        accent:  "#16a34a",
        tagBg:   "#f5f2eb",
        tagText: "#57606a",
        tagBdr:  "#e5e1d8",
        shimmer: "0.35"
      };

  const { langs, totalBytes, source } = await fetchEngineData();

  // Core tech stacks to display beautifully below raw code analytics
  const techStack = [
    "TypeScript", "Python", "React", "Next.js", "Tailwind", 
    "Flask", "PostgreSQL", "PyQt6", "Figma", "Git", "CyberSec"
  ];

  // Layout Canvas Calculations
  const W       = 900;
  const PAD_X   = 28;
  const STRIP_W = 3;
  const LABEL_W = 130;
  const BAR_X   = PAD_X + LABEL_W + 16;
  const BAR_W   = W - BAR_X - 110;
  const PCT_X   = BAR_X + BAR_W + 16;
  const ROW_H   = 30;
  const START_Y = 54;

  // Render Horizontal Language Slices
  const barsSVG = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const y = START_Y + i * ROW_H;
    const fw = Math.max(6, Math.round((lang.pct / 100) * BAR_W));
    
    return `
  <circle cx="${PAD_X + 6}" cy="${y + 10}" r="3.5" fill="${meta.color}"/>
  <text x="${PAD_X + LABEL_W}" y="${y + 14}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="11.5" font-weight="700" fill="${c.text}">${lang.name}</text>
  <rect x="${BAR_X}" y="${y + 6}" width="${BAR_W}" height="8" rx="4" fill="${c.border2}"/>
  <rect x="${BAR_X}" y="${y + 6}" width="${fw}" height="8" rx="4" fill="${meta.color}"/>
  <rect x="${BAR_X}" y="${y + 6}" width="${fw}" height="3.5" rx="1.5" fill="white" opacity="${c.shimmer}"/>
  <text x="${PCT_X}" y="${y + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="11" font-weight="700" fill="${meta.color}">${lang.pct}%</text>
  <text x="${PCT_X + 44}" y="${y + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.dim}">${fmtBytes(lang.bytes)}</text>`;
  }).join("");

  // Segmented Composition Component
  const COMP_Y = START_Y + langs.length * ROW_H + 24;
  const COMP_H = 10;
  const COMP_W = W - (PAD_X * 2);
  
  let currentSegX = PAD_X;
  const segmentsSVG = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const sw = Math.max(4, Math.round((lang.pct / 100) * COMP_W));
    const rect = `<rect x="${currentSegX}" y="${COMP_Y}" width="${sw}" height="${COMP_H}" rx="${i === 0 || i === langs.length - 1 ? 5 : 0}" fill="${meta.color}" opacity="0.9"/>`;
    currentSegX += sw;
    return rect;
  }).join("");

  // Technologies Section Setup
  const SEC2_Y    = COMP_Y + COMP_H + 32;
  const TAGS_HDR  = SEC2_Y + 20;
  const TAGS_Y    = TAGS_HDR + 16;
  const TAG_H     = 26;
  const TAG_GAP   = 8;
  const PER_ROW   = 6;

  function renderFluidBadgeRow(items, yPos) {
    const n = items.length;
    const gaps = TAG_GAP * (n - 1);
    const boxW = Math.floor((W - (PAD_X * 2) - gaps) / n);
    return items.map((tag, i) => {
      const x = PAD_X + i * (boxW + TAG_GAP);
      return `
  <rect x="${x}" y="${yPos}" width="${boxW}" height="${TAG_H}" rx="4"
        fill="${c.tagBg}" stroke="${c.tagBdr}" stroke-width="0.5"/>
  <circle cx="${x + 12}" cy="${yPos + 13}" r="2" fill="${c.accent}" opacity="0.7"/>
  <text x="${x + 20 + (boxW - 20) / 2}" y="${yPos + 16.5}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="10.5" font-weight="700" fill="${c.tagText}">${tag}</text>`;
    }).join("");
  }

  const badgesSVG = renderFluidBadgeRow(techStack.slice(0, PER_ROW), TAGS_Y)
                  + renderFluidBadgeRow(techStack.slice(PER_ROW), TAGS_Y + TAG_H + TAG_GAP);

  const FINAL_H = TAGS_Y + 2 * (TAG_H + TAG_GAP) + 16;

  // ── SVG Assembly ───────────────────────────────────────────────────────────
  return new Response(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${FINAL_H}" viewBox="0 0 ${W} ${FINAL_H}">
<defs>
  <clipPath id="canvasClip"><rect width="${W}" height="${FINAL_H}"/></clipPath>
</defs>
<g clip-path="url(#canvasClip)">
  <rect width="${W}" height="${FINAL_H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <text x="${PAD_X}" y="22"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// AUTOMATED LANGUAGE METRICS</text>
  <text x="${W - PAD_X}" y="22" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="8" font-weight="700" fill="${c.accent}" opacity="0.8">${source}</text>
  <line x1="${PAD_X}" y1="30" x2="${W - PAD_X}" y2="30" stroke="${c.border}" stroke-width="0.5"/>

  <text x="${PAD_X + LABEL_W}" y="44" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1" fill="${c.dim}">LANGUAGE</text>
  <text x="${BAR_X}" y="44"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1" fill="${c.dim}">ACCUMULATED VOLUME BYTES</text>

  ${barsSVG}
  <rect x="${PAD_X}" y="${COMP_Y}" width="${COMP_W}" height="${COMP_H}" rx="5" fill="${c.border2}"/>
  ${segmentsSVG}
  <rect x="${PAD_X}" y="${COMP_Y}" width="${COMP_W}" height="4" rx="5" fill="white" opacity="${c.shimmer}"/>

  <line x1="${PAD_X}" y1="${SEC2_Y}" x2="${W - PAD_X}" y2="${SEC2_Y}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${TAGS_HDR}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// TECHNOLOGIES &amp; FRAMEWORKS</text>

  ${badgesSVG}

  <rect x="0" y="0" width="${STRIP_W}" height="${FINAL_H}" fill="${c.accent}" opacity="0.7"/>
  <rect y="${FINAL_H - 1}" width="${W}" height="1" fill="${c.border}"/>
</g>
</svg>`, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
    },
  });
}
