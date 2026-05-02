export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#0d1117", text: "#e6edf3", muted: "#8b949e",
        dim: "#6e7681", border: "#30363d", border2: "#21262d",
        accent: "#39d353", tagBg: "#161b22", tagText: "#8b949e",
      }
    : {
        bg: "#ffffff", text: "#1a1a1a", muted: "#57606a",
        dim: "#8c959f", border: "#d0d7de", border2: "#eaecef",
        accent: "#1a7f37", tagBg: "#f6f8fa", tagText: "#57606a",
      };

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

  const BAR_X = 172, BAR_W = 640;
  const ROW_H = 28, START_Y = 72;

  const bars = skills.map((s, i) => {
    const y = START_Y + i * ROW_H;
    const fw = Math.round((s.pct / 100) * BAR_W);
    return `
  <text x="162" y="${y + 14}" text-anchor="end" font-family="'Courier New',monospace" font-size="11" fill="${c.muted}">${s.label}</text>
  <rect x="${BAR_X}" y="${y + 8}" width="${BAR_W}" height="5" rx="2.5" fill="${c.border2}"/>
  <rect x="${BAR_X}" y="${y + 8}" width="${fw}" height="5" rx="2.5" fill="${c.accent}"/>
  <text x="${BAR_X + BAR_W + 12}" y="${y + 14}" font-family="'Courier New',monospace" font-size="10" fill="${c.dim}">${s.pct}%</text>`;
  }).join("");

  const tags = [
    "Python", "HTML", "CSS", "JavaScript", "React",
    "Next.js", "Tailwind", "Flask", "PostgreSQL", "PyQt6",
    "Figma", "Git", "CyberSec",
  ];
  const TAG_W = 100, TAG_H = 20, TAG_GAP = 8, PER_ROW = 8;

  const SEP_Y    = START_Y + skills.length * ROW_H + 20;
  const LABEL_Y  = SEP_Y + 22;
  const TAGS_Y   = LABEL_Y + 16;
  const H        = TAGS_Y + Math.ceil(tags.length / PER_ROW) * 30 + 32;

  const tagEls = tags.map((t, i) => {
    const col = i % PER_ROW;
    const row = Math.floor(i / PER_ROW);
    const x   = 24 + col * (TAG_W + TAG_GAP);
    const ty  = TAGS_Y + row * 30;
    return `
  <rect x="${x}" y="${ty}" width="${TAG_W}" height="${TAG_H}" rx="3" fill="${c.tagBg}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${x + TAG_W / 2}" y="${ty + 13}" text-anchor="middle" font-family="'Courier New',monospace" font-size="9" fill="${c.tagText}">${t}</text>`;
  }).join("");

  const W = 900;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><clipPath id="sc"><rect width="${W}" height="${H}"/></clipPath></defs>
<g clip-path="url(#sc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- Header -->
  <text x="24" y="28" font-family="'Courier New',monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// SKILLS &amp; STACK</text>
  <line x1="24" y1="36" x2="${W - 24}" y2="36" stroke="${c.border}" stroke-width="0.5"/>

  ${bars}

  <!-- Technologies section -->
  <line x1="24" y1="${SEP_Y}" x2="${W - 24}" y2="${SEP_Y}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="24" y="${LABEL_Y}" font-family="'Courier New',monospace" font-size="9" letter-spacing="1.5" fill="${c.dim}">// TECHNOLOGIES</text>
  ${tagEls}

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
