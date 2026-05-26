export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#080b10",
        text: "#f0f6fc",
        muted: "#8b949e",
        dim: "#00ff66", // Phosphor green
        border: "#1f293d",
        border2: "#121824",
        accent: "#00ff66",
        tagBg: "rgba(0, 255, 102, 0.06)",
        tagText: "#00ff66",
        tagBorder: "rgba(0, 255, 102, 0.35)",
        percentText: "#ff0055", // Neon pink
      }
    : {
        bg: "#ffffff",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#1a7f37",
        border: "#d0d7de",
        border2: "#eaecef",
        accent: "#1a7f37",
        tagBg: "#f6f8fa",
        tagText: "#57606a",
        tagBorder: "#d0d7de",
        percentText: "#0550ae",
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

  const BAR_X = 180, BAR_W = 620;
  const ROW_H = 28, START_Y = 72;

  const bars = skills.map((s, i) => {
    const y = START_Y + i * ROW_H;
    const fw = Math.round((s.pct / 100) * BAR_W);
    return `
  <text x="166" y="${y + 14}" text-anchor="end" font-family="Consolas, 'Courier New', monospace" font-size="11.5" font-weight="700" fill="${c.text}">${s.label}</text>
  <rect x="${BAR_X}" y="${y + 8}" width="${BAR_W}" height="6" rx="3" fill="${c.border2}"/>
  <rect x="${BAR_X}" y="${y + 8}" width="${fw}" height="6" rx="3" fill="url(#skillGrad)"/>
  <text x="${BAR_X + BAR_W + 12}" y="${y + 14}" font-family="Consolas, 'Courier New', monospace" font-size="11" font-weight="700" fill="${c.percentText}">${s.pct}%</text>`;
  }).join("");

  const tags = [
    "Python", "HTML", "CSS", "JavaScript", "React",
    "Next.js", "Tailwind", "Flask", "PostgreSQL", "PyQt6",
    "Figma", "Git", "CyberSec",
  ];
  const TAG_W = 100, TAG_H = 22, TAG_GAP = 8, PER_ROW = 8;

  const SEP_Y    = START_Y + skills.length * ROW_H + 20;
  const LABEL_Y  = SEP_Y + 22;
  const TAGS_Y   = LABEL_Y + 16;
  const H        = TAGS_Y + Math.ceil(tags.length / PER_ROW) * 32 + 32;

  const tagEls = tags.map((t, i) => {
    const col = i % PER_ROW;
    const row = Math.floor(i / PER_ROW);
    const x   = 24 + col * (TAG_W + TAG_GAP);
    const ty  = TAGS_Y + row * 32;
    return `
  <rect x="${x}" y="${ty}" width="${TAG_W}" height="${TAG_H}" rx="11" fill="${c.tagBg}" stroke="${c.tagBorder}" stroke-width="0.5"/>
  <text x="${x + TAG_W / 2}" y="${ty + 14}" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="9.5" font-weight="700" fill="${c.tagText}">${t}</text>`;
  }).join("");

  const W = 900;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="sc"><rect width="${W}" height="${H}"/></clipPath>
  ${dark ? `
  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="4" y2="0" stroke="#00ff66" stroke-width="0.5" stroke-opacity="0.04" />
  </pattern>
  <filter id="neon-glow-small" x="-10%" y="-10%" width="120%" height="120%">
    <feGaussianBlur stdDeviation="1.5" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  <linearGradient id="skillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#00e5ff" />
    <stop offset="100%" stop-color="#00ff66" />
  </linearGradient>
  ` : `
  <linearGradient id="skillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#0550ae" />
    <stop offset="100%" stop-color="#1a7f37" />
  </linearGradient>
  `}
</defs>
<g clip-path="url(#sc)">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  ${dark ? `<rect width="${W}" height="${H}" fill="url(#scanlines)"/>` : ""}
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- Header -->
  <text x="24" y="28" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${dark ? c.dim : c.muted}" ${dark ? 'filter="url(#neon-glow-small)"' : ""}>// SKILLS &amp; STACK</text>
  <line x1="24" y1="36" x2="${W - 24}" y2="36" stroke="${c.border}" stroke-width="0.5"/>

  ${bars}

  <!-- Technologies section -->
  <line x1="24" y1="${SEP_Y}" x2="${W - 24}" y2="${SEP_Y}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="24" y="${LABEL_Y}" font-family="Consolas, 'Courier New', monospace" font-size="10" letter-spacing="1.5" fill="${dark ? c.dim : c.muted}" ${dark ? 'filter="url(#neon-glow-small)"' : ""}>// TECHNOLOGIES</text>
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
