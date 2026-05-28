export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens (Perfectly matched to profile.js & header.js) ──────────
  const c = dark
    ? {
        bg:      "#0a0c10",
        text:    "#e6edf3",
        muted:   "#8b949e",
        dim:     "#6e7681",
        border:  "#30363d",
        border2: "#21262d",
        accent:  "#39d353",
        mid:     "#79c0ff",
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
        mid:     "#0550ae",
        tagBg:   "#f5f2eb",
        tagText: "#57606a",
        tagBdr:  "#e5e1d8",
        shimmer: "0.35"
      };

  const STRIP_W = 3; 

  // ── 1. Curated Skills Portfolio ────────────────────────────────────────────
  // Free from GitHub API limitations, allowing you to showcase tools like Figma
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

  const tierColor = {
    expert:  c.accent,
    strong:  c.mid,
    growing: c.muted,
  };

  // ── 2. Technology Stack ────────────────────────────────────────────────────
  const tags = [
    "Python", "HTML", "CSS", "JavaScript", "React",
    "Next.js", "Tailwind", "Flask", "PostgreSQL", "PyQt6",
    "Figma", "Git", "CyberSec",
  ];

  // ── Layout Mathematics ─────────────────────────────────────────────────────
  const W       = 900;
  const PAD_X   = 24;
  const LABEL_W = 140;
  const BAR_X   = PAD_X + LABEL_W + 16;
  const BAR_W   = W - BAR_X - 60;
  const PCT_X   = BAR_X + BAR_W + 12;
  const ROW_H   = 28;
  const START_Y = 56;

  // Render Proficiency Bars
  const barsSVG = skills.map((s, i) => {
    const y = START_Y + i * ROW_H;
    const fw = Math.round((s.pct / 100) * BAR_W);
    const fill = tierColor[s.tier];
    return `
  <text x="${PAD_X + LABEL_W}" y="${y + 10}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="11.5" font-weight="600" fill="${c.text}">${s.label}</text>
  
  <rect x="${BAR_X}" y="${y + 2}" width="${BAR_W}" height="8" rx="4" fill="${c.border2}"/>
  <rect x="${BAR_X}" y="${y + 2}" width="${fw}" height="8" rx="4" fill="${fill}"/>
  <rect x="${BAR_X}" y="${y + 2}" width="${fw}" height="3.5" rx="1.5" fill="white" opacity="${c.shimmer}"/>
  
  <text x="${PCT_X}" y="${y + 10}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" font-weight="600" fill="${c.dim}">${s.pct}%</text>`;
  }).join("");

  // Render Legend
  const LEG_Y = START_Y + skills.length * ROW_H + 10;
  const legendSVG = [
    { label: "Expert",  color: c.accent },
    { label: "Strong",  color: c.mid },
    { label: "Growing", color: c.muted },
  ].map(({ label, color }, i) => {
    const lx = PAD_X + i * 110;
    return `
  <circle cx="${lx + 4}" cy="${LEG_Y - 3}" r="3.5" fill="${color}"/>
  <text x="${lx + 14}" y="${LEG_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" fill="${c.dim}">${label}</text>`;
  }).join("");

  // Render Technology Badges
  const TAG_GAP = 8;
  const TAG_H   = 26;
  const PER_ROW = 7;
  const SEP_Y   = LEG_Y + 20;
  const LABEL_Y = SEP_Y + 20;
  const TAGS_Y  = LABEL_Y + 16;
  
  function fullStretchRow(items, yPos) {
    const n = items.length;
    const total_gap = TAG_GAP * (n - 1);
    const tw = Math.floor((W - PAD_X * 2 - total_gap) / n);
    return items.map((t, i) => {
      const x = PAD_X + i * (tw + TAG_GAP);
      return `
  <rect x="${x}" y="${yPos}" width="${tw}" height="${TAG_H}" rx="13"
        fill="${c.tagBg}" stroke="${c.tagBdr}" stroke-width="0.5"/>
  <circle cx="${x + 12}" cy="${yPos + 13}" r="2.5" fill="${c.accent}" opacity="0.45"/>
  <text x="${x + 22 + (tw - 22) / 2}" y="${yPos + 17}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="10.5" font-weight="600" fill="${c.tagText}">${t}</text>`;
    }).join("");
  }

  const tagEls = fullStretchRow(tags.slice(0, PER_ROW), TAGS_Y)
               + fullStretchRow(tags.slice(PER_ROW), TAGS_Y + TAG_H + TAG_GAP);

  const FINAL_H = TAGS_Y + 2 * (TAG_H + TAG_GAP) + 16;

  // ── SVG Assembly ───────────────────────────────────────────────────────────
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${FINAL_H}" viewBox="0 0 ${W} ${FINAL_H}">
<defs>
  <clipPath id="sc"><rect width="${W}" height="${FINAL_H}"/></clipPath>
</defs>
<g clip-path="url(#sc)">

  <rect width="${W}" height="${FINAL_H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <text x="${PAD_X}" y="20"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// SKILLS &amp; STACK</text>
  <line x1="${PAD_X}" y1="28" x2="${W - PAD_X}" y2="28" stroke="${c.border}" stroke-width="0.5"/>

  <text x="${PAD_X + LABEL_W}" y="44" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1" fill="${c.dim}">SKILL</text>
  <text x="${BAR_X}" y="44"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1" fill="${c.dim}">PROFICIENCY</text>

  ${barsSVG}
  ${legendSVG}

  <line x1="${PAD_X}" y1="${SEP_Y}" x2="${W - PAD_X}" y2="${SEP_Y}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${LABEL_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// TECHNOLOGIES</text>

  ${tagEls}

  <rect x="0" y="0" width="${STRIP_W}" height="${FINAL_H}" fill="${c.accent}" opacity="0.7"/>
  <rect y="${FINAL_H - 1}" width="${W}" height="1" fill="${c.border}"/>

</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // Very long cache since this data is static and manual
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
