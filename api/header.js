export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:     "#0d1117",
        bar:    "#161b22",
        text:   "#e6edf3",
        muted:  "#8b949e",
        dim:    "#6e7681",
        border: "#30363d",
        accent: "#00ff66",   // crisp terminal green (upgraded from #39d353)
        aBg:    "#071910",
        neon:   "#ff0055",   // cyber-pink neon
        crtBg:  "#010d05",   // near-black CRT screen
        px:     "#0f1318",   // pixel art body fill
      }
    : {
        bg:     "#ffffff",
        bar:    "#f6f8fa",
        text:   "#1a1a1a",
        muted:  "#57606a",
        dim:    "#8c959f",
        border: "#d0d7de",
        accent: "#1a7f37",
        aBg:    "#dafbe1",
        neon:   "#cc0044",
        crtBg:  "#e8f5e9",
        px:     "#eaeef2",
      };

  const W = 900, H = 178;

  // ── Pre-build scan dots (static, staggered pulse) ────────────────────────
  const scanDots = [];
  for (let i = 0; i < 24; i++) {
    const x = 228 + i * 28;
    if (x > W - 140) break;
    const op  = [0.75, 0.35, 0.18][i % 3];
    const cls = ["np", "np2", "np3"][i % 3];
    scanDots.push(
      `<rect x="${x}" y="157" width="3" height="3" rx="0.5" fill="${c.neon}" opacity="${op}" class="${cls}"/>`
    );
  }
  const scanDotsSVG = scanDots.join("\n  ");

  // ── Neon × Cross — 5×5 pixel art (5 px per pixel, 1 px gap → step = 6) ──
  const BX = 116, BY = 138, PS = 5, STEP = 6;
  const crossCoords = [[0,0],[4,0],[1,1],[3,1],[2,2],[1,3],[3,3],[0,4],[4,4]];
  const crossPixelsSVG = crossCoords
    .map(([col, row]) =>
      `<rect x="${BX + col * STEP}" y="${BY + row * STEP}" width="${PS}" height="${PS}" fill="${c.neon}"/>`
    )
    .join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
  <style>
    .np  { animation: neonPulse 2s ease-in-out infinite; }
    .np2 { animation: neonPulse 2s ease-in-out infinite 0.45s; }
    .np3 { animation: neonPulse 2s ease-in-out infinite 0.9s; }
    .cf  { animation: crtFlicker 5.5s step-end infinite; }
    .cb  { animation: cursorBlink 1s step-end infinite; }
    @keyframes neonPulse {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.18; }
    }
    @keyframes crtFlicker {
      0%,86%,91%,97%,100% { opacity: 1; }
      87%  { opacity: 0.25; }
      88%  { opacity: 0.9;  }
      89%  { opacity: 0.15; }
      90%  { opacity: 1;    }
      93%  { opacity: 0.65; }
      94%  { opacity: 1;    }
    }
    @keyframes cursorBlink {
      0%,49%   { opacity: 1; }
      50%,100% { opacity: 0; }
    }
  </style>
</defs>
<g clip-path="url(#hc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ── TITLEBAR ─────────────────────────────────────── -->
  <rect width="${W}" height="34" fill="${c.bar}"/>
  <rect y="33.5" width="${W}" height="0.5" fill="${c.border}"/>
  <circle cx="22" cy="17" r="5" fill="#ff5f57"/>
  <circle cx="40" cy="17" r="5" fill="#febc2e"/>
  <circle cx="58" cy="17" r="5" fill="#28c840"/>
  <text x="76" y="22" font-family="'Courier New',monospace" font-size="11" fill="${c.dim}">~/kyrell-santillan — zsh</text>
  <rect x="216" y="10" width="6" height="12" rx="1" fill="${c.accent}" opacity="0.7" class="cb"/>

  <!-- ── IDENTITY ───────────────────────────────────────── -->
  <text x="32" y="76" font-family="'Courier New',monospace" font-size="30" font-weight="700" fill="${c.text}">Kyrell Santillan</text>
  <text x="32" y="96" font-family="'Courier New',monospace" font-size="12" fill="${c.muted}">Web Designer  ·  Frontend Engineer  ·  Cybersecurity  ·  Philippines  ·  UTC+8</text>
  <rect x="32" y="104" width="118" height="18" rx="9" fill="${c.aBg}"/>
  <circle cx="46" cy="113" r="3.5" fill="${c.accent}" class="np3"/>
  <text x="54" y="117" font-family="'Courier New',monospace" font-size="9.5" font-weight="700" fill="${c.accent}">Open for Work</text>

  <!-- ── PIXEL ART ZONE (y = 133 → 177) ───────────────────
       Strict dedicated strip — zero overlap with text above.
  ────────────────────────────────────────────────────────── -->
  <line x1="0" y1="133" x2="${W}" y2="133" stroke="${c.border}" stroke-width="0.5"/>

  <!-- [A] CRT DESK MONITOR — pixel art ── -->
  <rect x="24" y="138" width="50" height="32" rx="3" fill="${c.px}" stroke="${c.border}" stroke-width="1.5"/>
  <g class="cf">
    <rect x="28" y="141" width="42" height="23" rx="1" fill="${c.crtBg}"/>
    <rect x="31" y="145" width="28" height="2" rx="1" fill="${c.accent}" opacity="0.92"/>
    <rect x="31" y="149" width="20" height="2" rx="1" fill="${c.accent}" opacity="0.70"/>
    <rect x="31" y="153" width="32" height="2" rx="1" fill="${c.accent}" opacity="0.85"/>
    <rect x="31" y="157" width="15" height="2" rx="1" fill="${c.accent}" opacity="0.55"/>
    <rect x="31" y="159" width="5"  height="3"         fill="${c.accent}" opacity="0.9" class="cb"/>
  </g>
  <rect x="44" y="170" width="10" height="5"           fill="${c.border}"/>
  <rect x="37" y="174" width="24" height="3"  rx="1.5" fill="${c.border}"/>

  <!-- [B] NEON × CROSS — pulsing cyber-pink ── -->
  <g class="np">
    ${crossPixelsSVG}
  </g>
  <circle cx="${BX + 2 * STEP + Math.round(PS / 2)}" cy="${BY + 2 * STEP + Math.round(PS / 2)}" r="18" fill="none" stroke="${c.neon}" stroke-width="1" opacity="0.2" class="np2"/>

  <!-- [C] TERMINAL PROMPT + CURSOR ── -->
  <text x="168" y="164" font-family="'Courier New',monospace" font-size="11" fill="${c.dim}">$</text>
  <rect x="182" y="152" width="7" height="13" rx="1" fill="${c.accent}" class="cb"/>

  <!-- [D] SCANLINE DOT ROW ── -->
  ${scanDotsSVG}

  <!-- [E] ZONE LABEL ── -->
  <text x="${W - 24}" y="163" text-anchor="end" font-family="'Courier New',monospace" font-size="9" letter-spacing="1.8" fill="${c.dim}">TERMINAL.NOIR</text>
  <circle cx="${W - 20}" cy="143" r="3" fill="${c.neon}" class="np3"/>

  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type":  "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
