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
  const TYPE_Y = BADGE_Y + 48;

  const lines = [
    ">_Staging Automation: Web Designer | Frontend Engineer | Next.js",
    ">_System Target: CyberSecurity | Open for Work | PHT UTC+8",
    ">_Pipeline Status: Building real projects, ignoring tutorials...",
  ];

  const duration = 4; // seconds per line
  const totalDuration = lines.length * duration;

  let clipPaths = "";
  let linesSVG = "";

  lines.forEach((line, i) => {
    const startTime = i * duration;
    const typeTime = 1.5; // time it takes to "type" the sentence

    // Calculate keyframe percentages for SMIL animation
    const p1 = startTime / totalDuration;
    const p2 = (startTime + typeTime) / totalDuration;
    const p3 = (startTime + duration - 0.1) / totalDuration;
    const p4 = (startTime + duration) / totalDuration;

    // Animates clip path width to reveal text (typing effect)
    const clipKeyTimes = `0; ${p1}; ${p2}; ${p3}; ${p4}; 1`;
    const clipValues = `0; 0; 800; 800; 0; 0`; // 800px ensures it clears long text

    // Visibility toggle so only one line shows at a time
    const opacValues = `0; 0; 1; 1; 0; 0`;

    clipPaths += `
      <clipPath id="type-clip-${i}">
        <rect x="${PAD_X}" y="${TYPE_Y - 20}" height="30" width="0">
          <animate attributeName="width" values="${clipValues}" keyTimes="${clipKeyTimes}" dur="${totalDuration}s" repeatCount="indefinite" />
        </rect>
      </clipPath>
    `;

    // The text element for the typing animation (cursor removed)
    linesSVG += `
      <text x="${PAD_X}" y="${TYPE_Y}"
            font-family="'Courier New', Consolas, monospace" font-size="14" font-weight="700"
            fill="${c.accent}"
            clip-path="url(#type-clip-${i})"
            opacity="0">
        ${line}
        <animate attributeName="opacity" values="${opacValues}" keyTimes="${clipKeyTimes}" dur="${totalDuration}s" repeatCount="indefinite" />
      </text>
    `;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="bc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
  <linearGradient id="typeBarGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${c.bg}"/>
    <stop offset="5%" stop-color="${c.bar}"/>
    <stop offset="100%" stop-color="${c.bg}"/>
  </linearGradient>
  ${clipPaths}
</defs>
<g clip-path="url(#bc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="${BAR_H}" fill="${c.bar}"/>
  <rect y="${BAR_H}" width="${W}" height="1" fill="${c.border}" opacity="0.5"/>

  <circle cx="20" cy="16" r="5" fill="#ff5f56"/>
  <circle cx="36" cy="16" r="5" fill="#ffbd2e"/>
  <circle cx="52" cy="16" r="5" fill="#27c93f"/>
  <text x="72" y="20" font-family="'Courier New', Consolas, monospace" font-size="11" fill="${c.dim}">~/kyrell-santillan — zsh</text>

  <text x="${PAD_X}" y="${NAME_Y}" font-family="monospace" font-size="28" font-weight="bold" fill="${c.text}">Kyrell Santillan</text>
  <text x="${PAD_X}" y="${ROLE_Y}" font-family="'Courier New', Consolas, monospace" font-size="11" font-weight="700" fill="${c.muted}">Web Designer · Frontend Engineer · CyberSecurity · Philippines · UTC+8</text>

  <rect x="${PAD_X}" y="${BADGE_Y}" width="122" height="18" rx="9" fill="${c.aBg}"/>
  <circle cx="${PAD_X + 13}" cy="${BADGE_Y + 9}" r="3.5" fill="${c.accent}"/>
  <text x="${PAD_X + 25}" y="${BADGE_Y + 12.5}"
        font-family="'Courier New', Consolas, monospace"
        font-size="9.5" font-weight="700"
        fill="${c.accent}" letter-spacing="0.5">OPEN FOR WORK</text>

  <rect x="0" y="${TYPE_Y - 24}" width="${W}" height="40" fill="url(#typeBarGrad)"/>
  <line x1="0" y1="${TYPE_Y - 24}" x2="${W}" y2="${TYPE_Y - 24}" stroke="${c.border}" stroke-width="0.5" opacity="0.8"/>

  ${linesSVG}

  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
