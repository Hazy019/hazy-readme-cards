export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens ──────────────────────────────────────────────────────────
  const c = dark
    ? {
      bg: "#0a0c10",
      bar: "#12151b",
      text: "#e6edf3",
      muted: "#8b949e",
      dim: "#6e7681",
      border: "#30363d",
      accent: "#39d353",
      aBg: "#0f2a18",
    }
    : {
      bg: "#fcfbf9",
      bar: "#f5f2eb",
      text: "#1a1a1a",
      muted: "#57606a",
      dim: "#8c959f",
      border: "#e5e1d8",
      accent: "#16a34a",
      aBg: "#dcfce7",
    };

  const W = 900, H = 196;
  const BAR_H = 32;
  const PAD_X = 28;
  const STRIP_W = 3; // left accent strip — visual rhyme anchor across all cards

  // Vertical layout
  const NAME_Y = BAR_H + 48;
  const ROLE_Y = NAME_Y + 24;
  const BADGE_Y = ROLE_Y + 12;

  // Typing row
  const TYPE_Y = H - 32; // baseline of the typing prompt separator line

  // Typing lines — rotate through these with CSS animation
  const LINES = [
    `>_Status: CS Graduate | Software Engineer | UI/UX Designer`,
    `>_Focus: Resilient Systems | Clean Architecture | Cybersecurity`,
    `>_Pipeline: Building human-centered products since 2024`,
  ];
  const LINE_DUR = 4; // seconds each line is visible
  const TOTAL = LINES.length * LINE_DUR;

  const linesSVG = LINES.map((line, i) => {
    const start = i * LINE_DUR;
    return `<text x="${PAD_X + 4}" y="${TYPE_Y + 13}"
      font-family="'Courier New',Consolas,monospace" font-size="12" font-weight="600"
      fill="${c.accent}" opacity="0"
      style="animation:line${i} ${TOTAL}s steps(1,end) infinite">${line}<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;${(start/TOTAL).toFixed(3)};${((start+0.3)/TOTAL).toFixed(3)};${((start+LINE_DUR-0.3)/TOTAL).toFixed(3)};${((start+LINE_DUR)/TOTAL).toFixed(3)};1" dur="${TOTAL}s" repeatCount="indefinite"/></text>`;
  }).join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
  <!-- Gradient on title bar: solid left → fades to bg right (depth) -->
  <linearGradient id="hBarGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${c.bar}"/>
    <stop offset="100%" stop-color="${c.bg}"/>
  </linearGradient>
  <!-- Typing row background gradient: darker strip at bottom -->
  <linearGradient id="typeBarGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%"   stop-color="${c.bar}" stop-opacity="0.6"/>
    <stop offset="100%" stop-color="${c.bar}" stop-opacity="0.9"/>
  </linearGradient>
</defs>
<g clip-path="url(#hc)">

  <!-- Base background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ── TITLE BAR ──────────────────────────────────────────────────────── -->
  <rect width="${W}" height="${BAR_H}" fill="url(#hBarGrad)"/>
  <rect y="${BAR_H - 0.5}" width="${W}" height="0.5" fill="${c.border}" opacity="0.6"/>

  <!-- Mac traffic-light dots (visual rhyme: also in footer) -->
  <circle cx="22" cy="16" r="4.5" fill="#ff5f57"/>
  <circle cx="38" cy="16" r="4.5" fill="#febc2e"/>
  <circle cx="54" cy="16" r="4.5" fill="#28c840"/>
  <text x="74" y="20.5"
        font-family="'Courier New', Consolas, monospace"
        font-size="11" font-weight="600"
        fill="${c.dim}" letter-spacing="0.5">~/kyrell-santillan — zsh</text>

  <!-- ── HERO NAME (star typography moment) ────────────────────────────── -->
  <text x="${PAD_X}" y="${NAME_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="34" font-weight="900"
        fill="${c.text}" letter-spacing="-0.5">Kyrell Santillan</text>

  <!-- Accent underline under name (depth: makes name feel grounded) -->
  <rect x="${PAD_X}" y="${NAME_Y + 5}" width="248" height="2" rx="1"
        fill="${c.accent}" opacity="0.35"/>

  <!-- ── ROLE LINE ──────────────────────────────────────────────────────── -->
  <text x="${PAD_X}" y="${ROLE_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="11" fill="${c.muted}" letter-spacing="0.5">Software Engineer  ·  System Architecture  ·  UI/UX Design  ·  Philippines  ·  UTC+8</text>

  <!-- ── OPEN FOR WORK BADGE ───────────────────────────────────────────── -->
  <rect x="${PAD_X}" y="${BADGE_Y}" width="122" height="18" rx="9" fill="${c.aBg}"/>
  <!-- Dot bullet (visual rhyme: same motif in footer link pills + profile bullets) -->
  <circle cx="${PAD_X + 13}" cy="${BADGE_Y + 9}" r="3.5" fill="${c.accent}"/>
  <text x="${PAD_X + 25}" y="${BADGE_Y + 12.5}"
        font-family="'Courier New', Consolas, monospace"
        font-size="9.5" font-weight="700"
        fill="${c.accent}" letter-spacing="0.5">OPEN FOR WORK</text>

  <!-- ── TYPING ANIMATION ROW ─────────────────────────────────────────── -->
  <rect x="0" y="${TYPE_Y - 8}" width="${W}" height="40" fill="url(#typeBarGrad)"/>
  <line x1="0" y1="${TYPE_Y - 8}" x2="${W}" y2="${TYPE_Y - 8}" stroke="${c.border}" stroke-width="0.5" opacity="0.8"/>

  <!-- Blinking cursor dot (visual rhyme: same accent green everywhere) -->
  <rect x="${PAD_X}" y="${TYPE_Y + 3}" width="7" height="11" rx="1" fill="${c.accent}" opacity="0.85">
    <animate attributeName="opacity" values="0.85;0.1;0.85" dur="1.1s" repeatCount="indefinite"/>
  </rect>

  <!-- Rotating typing lines (SVG SMIL animation — no JS, works on GitHub) -->
  ${linesSVG}

  <!-- ── LEFT ACCENT STRIP (visual rhyme anchor — on every card) ────────── -->
  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>

  <!-- Card border -->
  <rect y="0" width="${W}" height="1" fill="${c.border}"/>
  <rect x="${W - 1}" y="0" width="1" height="${H}" fill="${c.border}"/>
  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>

</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
