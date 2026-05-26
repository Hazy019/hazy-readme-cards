export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:      "#0d1117",
        text:    "#e6edf3",
        muted:   "#8b949e",
        dim:     "#6e7681",
        border:  "#30363d",
        border2: "#21262d",
        accent:  "#39d353",
        tagBg:   "#161b22",
        tagText: "#8b949e",
      }
    : {
        bg:      "#ffffff",
        text:    "#1a1a1a",
        muted:   "#57606a",
        dim:     "#8c959f",
        border:  "#d0d7de",
        border2: "#eaecef",
        accent:  "#1a7f37",
        tagBg:   "#f6f8fa",
        tagText: "#57606a",
      };

  // ── Skill bars ────────────────────────────────────────────────────────────
  const skills = [
    { label: "CSS / Tailwind", pct: 88 },
    { label: "Figma / UI",     pct: 80 },
    { label: "React",          pct: 75 },
    { label: "Python",         pct: 72 },
    { label: "Next.js",        pct: 70 },
    { label: "JavaScript",     pct: 68 },
    { label: "Flask",          pct: 58 },
    { label: "PostgreSQL",     pct: 52 },
    { label: "CyberSec",       pct: 45 },
  ];

  const W       = 900;
  const LEFT_X  = 24;
  const LABEL_W = 148;   // right edge of label column
  const BAR_X   = LABEL_W + 16;
  const BAR_W   = W - BAR_X - 80;  // leaves room for pct text
  const PCT_X   = BAR_X + BAR_W + 12;
  const ROW_H   = 26;
  const START_Y = 60;

  const bars = skills.map((s, i) => {
    const y  = START_Y + i * ROW_H;
    const fw = Math.round((s.pct / 100) * BAR_W);
    return `
  <text x="${LABEL_W}" y="${y + 10}" text-anchor="end"
        font-family="'Courier New', Consolas, monospace" font-size="11.5" font-weight="700"
        fill="${c.text}">${s.label}</text>
  <rect x="${BAR_X}" y="${y + 4}" width="${BAR_W}" height="6" rx="3" fill="${c.border2}"/>
  <rect x="${BAR_X}" y="${y + 4}" width="${fw}"  height="6" rx="3" fill="${c.accent}"/>
  <text x="${PCT_X}" y="${y + 10}"
        font-family="'Courier New', Consolas, monospace" font-size="10"
        fill="${c.dim}">${s.pct}%</text>`;
  }).join("");

  // ── Technology badge grid ─────────────────────────────────────────────────
  const tags = [
    "Python", "HTML", "CSS", "JavaScript", "React",
    "Next.js", "Tailwind", "Flask", "PostgreSQL", "PyQt6",
    "Figma", "Git", "CyberSec",
  ];
  // Distribute 13 badges: row1 = 7, row2 = 6
  const PER_ROW = 7;
  const TAG_H   = 22;
  const TAG_GAP = 8;
  // Auto-compute tag widths so rows span the full canvas minus margin
  const TAGS_AREA_W = W - LEFT_X * 2;

  const SEP_Y   = START_Y + skills.length * ROW_H + 20;
  const LABEL_Y = SEP_Y + 22;
  const TAGS_Y  = LABEL_Y + 16;
  const H       = TAGS_Y + 2 * (TAG_H + TAG_GAP) + 20;

  function tagRow(items, baseY) {
    const n       = items.length;
    const totalGap = TAG_GAP * (n - 1);
    const tagW    = Math.floor((TAGS_AREA_W - totalGap) / n);
    return items.map((t, i) => {
      const x = LEFT_X + i * (tagW + TAG_GAP);
      return `
  <rect x="${x}" y="${baseY}" width="${tagW}" height="${TAG_H}" rx="11"
        fill="${c.tagBg}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${x + tagW / 2}" y="${baseY + 14.5}" text-anchor="middle"
        font-family="'Courier New', Consolas, monospace" font-size="9.5"
        fill="${c.tagText}">${t}</text>`;
    }).join("");
  }

  const row1 = tags.slice(0, PER_ROW);
  const row2 = tags.slice(PER_ROW);
  const tagEls = tagRow(row1, TAGS_Y) + tagRow(row2, TAGS_Y + TAG_H + TAG_GAP);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="sc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#sc)">

  <!-- Canvas -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- Section header -->
  <text x="${LEFT_X}" y="24" font-family="'Courier New', Consolas, monospace"
        font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// SKILLS &amp; STACK</text>
  <line x1="${LEFT_X}" y1="32" x2="${W - LEFT_X}" y2="32"
        stroke="${c.border}" stroke-width="0.5"/>

  ${bars}

  <!-- Technologies separator -->
  <line x1="${LEFT_X}" y1="${SEP_Y}" x2="${W - LEFT_X}" y2="${SEP_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${LEFT_X}" y="${LABEL_Y}" font-family="'Courier New', Consolas, monospace"
        font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// TECHNOLOGIES</text>

  ${tagEls}

  <!-- Bottom rule -->
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
