export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens ──────────────────────────────────────────────────────────
  const c = dark
    ? {
      bg: "#0a0c10",
      text: "#e6edf3",
      muted: "#8b949e",
      dim: "#6e7681",
      border: "#30363d",
      border2: "#21262d",
      accent: "#39d353",
      accentD: "#238636",
      mid: "#79c0ff",
      tagBg: "#12151b",
      tagText: "#8b949e",
      tagBdr: "#30363d",
    }
    : {
      bg: "#fcfbf9",
      text: "#1a1a1a",
      muted: "#57606a",
      dim: "#8c959f",
      border: "#e5e1d8",
      border2: "#d4cdbc",
      accent: "#16a34a",
      accentD: "#15803d",
      mid: "#0550ae",
      tagBg: "#f5f2eb",
      tagText: "#57606a",
      tagBdr: "#e5e1d8",
    };

  const STRIP_W = 3;  // left accent strip — visual rhyme anchor

  // ── Skill definitions ──────────────────────────────────────────────────────
  // tier: "expert" | "strong" | "growing"
  const skills = [
    { label: "CSS / Tailwind", pct: 88, tier: "expert" },
    { label: "Figma / UI",     pct: 80, tier: "expert" },
    { label: "React",          pct: 75, tier: "expert" },
    { label: "Python",         pct: 72, tier: "strong" },
    { label: "Next.js",        pct: 70, tier: "strong" },
    { label: "JavaScript",     pct: 68, tier: "strong" },
    { label: "Flask",          pct: 58, tier: "strong" },
    { label: "PostgreSQL",     pct: 52, tier: "growing" },
    { label: "CyberSec",       pct: 45, tier: "growing" },
  ];

  // Bar color by tier
  const tierColor = {
    expert:  c.accent,
    strong:  c.mid,
    growing: c.muted,
  };

  // Technology badge grid (13 items, full-stretch per row)
  const tags = [
    "Python", "HTML", "CSS", "JavaScript", "React",
    "Next.js", "Tailwind", "Flask", "PostgreSQL", "PyQt6",
    "Figma", "Git", "CyberSec",
  ];

  // ── Layout ─────────────────────────────────────────────────────────────────
  const W = 900;
  const PAD_X = 24;
  const LABEL_W = 150;
  const BAR_X = PAD_X + LABEL_W + 12;
  const BAR_W = W - BAR_X - 64;
  const PCT_X = BAR_X + BAR_W + 8;
  const ROW_H = 28;
  const START_Y = 52;

  // Bars SVG — 8px height with physical sheen overlay for depth
  const barsSVG = skills.map((s, i) => {
    const y = START_Y + i * ROW_H;
    const fw = Math.round((s.pct / 100) * BAR_W);
    const fill = tierColor[s.tier];
    return `
  <!-- ${s.label} -->
  <text x="${PAD_X + LABEL_W}" y="${y + 10}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="11.5" fill="${c.text}">${s.label}</text>
  <!-- Track -->
  <rect x="${BAR_X}" y="${y + 2}" width="${BAR_W}" height="8" rx="4" fill="${c.border2}"/>
  <!-- Fill -->
  <rect x="${BAR_X}" y="${y + 2}" width="${fw}" height="8" rx="4" fill="${fill}"/>
  <!-- Sheen highlight (depth — makes bar feel physical) -->
  <rect x="${BAR_X}" y="${y + 2}" width="${fw}" height="3.5" rx="1.5" fill="white" opacity="${dark ? "0.12" : "0.35"}"/>
  <text x="${PCT_X}" y="${y + 10}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.dim}">${s.pct}%</text>`;
  }).join("");

  // ── Tier legend (circles, not rects — rhymes with badge/bullet dots) ───────
  const LEG_Y = START_Y + skills.length * ROW_H + 8;
  const legendSVG = [
    { label: "Expert",  color: c.accent },
    { label: "Strong",  color: c.mid },
    { label: "Growing", color: c.muted },
  ].map(({ label, color }, i) => {
    const lx = PAD_X + i * 100;
    return `
  <!-- Dot (circle rhymes with badge/bullet/OFW dots across all cards) -->
  <circle cx="${lx + 4}" cy="${LEG_Y - 3}" r="4" fill="${color}"/>
  <text x="${lx + 13}" y="${LEG_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" fill="${c.dim}">${label}</text>`;
  }).join("");

  // ── Technology badges ──────────────────────────────────────────────────────
  const TAG_GAP = 8;
  const TAG_H = 24;
  const PER_ROW = 7;    // 7 on row1, 6 on row2
  const SEP_Y = LEG_Y + 18;
  const LABEL_Y = SEP_Y + 20;
  const TAGS_Y = LABEL_Y + 14;
  const H = TAGS_Y + 2 * (TAG_H + TAG_GAP) + 20;

  function fullStretchRow(items, yPos) {
    const n = items.length;
    const total_gap = TAG_GAP * (n - 1);
    const tw = Math.floor((W - PAD_X * 2 - total_gap) / n);
    return items.map((t, i) => {
      const x = PAD_X + i * (tw + TAG_GAP);
      return `
  <rect x="${x}" y="${yPos}" width="${tw}" height="${TAG_H}" rx="12"
        fill="${c.tagBg}" stroke="${c.tagBdr}" stroke-width="0.5"/>
  <text x="${x + tw / 2}" y="${yPos + 15.5}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.tagText}">${t}</text>`;
    }).join("");
  }

  const row1 = tags.slice(0, PER_ROW);
  const row2 = tags.slice(PER_ROW);
  const tagEls = fullStretchRow(row1, TAGS_Y)
    + fullStretchRow(row2, TAGS_Y + TAG_H + TAG_GAP);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="sc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#sc)">

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ── SECTION HEADER (// comment prefix — visual rhyme across all cards) -->
  <text x="${PAD_X}" y="16"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// SKILLS &amp; STACK</text>
  <line x1="${PAD_X}" y1="24" x2="${W - PAD_X}" y2="24"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Column headers (micro typography — opacity tier 3) -->
  <text x="${PAD_X + LABEL_W}" y="40" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" letter-spacing="1" fill="${c.dim}">SKILL</text>
  <text x="${BAR_X}" y="40"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" letter-spacing="1" fill="${c.dim}">PROFICIENCY</text>

  ${barsSVG}

  <!-- Tier legend -->
  ${legendSVG}

  <!-- ── TECHNOLOGIES section ──────────────────────────────────────────── -->
  <line x1="${PAD_X}" y1="${SEP_Y}" x2="${W - PAD_X}" y2="${SEP_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${LABEL_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// TECHNOLOGIES</text>

  ${tagEls}

  <!-- ── LEFT ACCENT STRIP (visual rhyme anchor — on every card) ────────── -->
  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>

  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
