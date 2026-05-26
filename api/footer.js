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
        accent: "#00ff66",   // crisp terminal green
        neon:   "#ff0055",   // cyber-pink neon
      }
    : {
        bg:     "#ffffff",
        bar:    "#f6f8fa",
        text:   "#1a1a1a",
        muted:  "#57606a",
        dim:    "#8c959f",
        border: "#d0d7de",
        accent: "#1a7f37",
        neon:   "#cc0044",
      };

  const W = 900, H = 115;

  // ── Signal strength bars (4 bars, tallest = fully lit) ───────────────
  const BAR_BOTTOM = 107;
  const barDefs = [
    { h: 6,  x: 24 },
    { h: 11, x: 32 },
    { h: 16, x: 40 },
    { h: 22, x: 48 },
  ];
  const barsSVG = barDefs
    .map(({ h, x }, i) => {
      const cls = ["np", "np2", "np3", "np"][i];
      const op  = i < 3 ? 1 : 0.45;   // 4th bar slightly dimmer = "no full signal"
      return `<rect x="${x}" y="${BAR_BOTTOM - h}" width="5" height="${h}" rx="1" fill="${c.accent}" opacity="${op}" class="${cls}"/>`;
    })
    .join("\n  ");

  // ── Small neon × cross (3×3 pixel art, 4 px pixels, 1 px gap → step=5) ──
  // X-shape: (0,0)(2,0) / (1,1) / (0,2)(2,2)
  const CX = 110, CY = 84, CPS = 4, CSTEP = 5;
  const smallCross = [[0,0],[2,0],[1,1],[0,2],[2,2]]
    .map(([col, row]) =>
      `<rect x="${CX + col * CSTEP}" y="${CY + row * CSTEP}" width="${CPS}" height="${CPS}" fill="${c.neon}"/>`
    )
    .join("\n  ");

  // ── Horizontal pulse lines (three staggered neon bands) ──────────────
  const pulseLinesY = [82, 91, 100];
  const pulseLinesSVG = pulseLinesY
    .map((y, i) => {
      const cls = ["np", "np2", "np3"][i];
      const col = i % 2 === 0 ? c.neon : c.accent;
      const op  = [0.18, 0.12, 0.10][i];
      return `<rect x="160" y="${y}" width="530" height="2" rx="1" fill="${col}" opacity="${op}" class="${cls}"/>`;
    })
    .join("\n  ");

  // ── Pixel grid decoration (checkerboard, right side) ─────────────────
  const gridEls = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      if ((row + col) % 2 !== 0) continue;   // checkerboard
      const gx = W - 100 + col * 8;
      if (gx > W - 16) continue;
      const gy  = 80 + row * 8;
      const cls = col % 2 === 0 ? "np" : "np2";
      const op  = (0.55 - row * 0.12).toFixed(2);
      gridEls.push(
        `<rect x="${gx}" y="${gy}" width="5" height="5" rx="0.5" fill="${c.neon}" opacity="${op}" class="${cls}"/>`
      );
    }
  }
  const pixelGridSVG = gridEls.join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
  <style>
    .np  { animation: neonPulse 2.2s ease-in-out infinite; }
    .np2 { animation: neonPulse 2.2s ease-in-out infinite 0.5s; }
    .np3 { animation: neonPulse 2.2s ease-in-out infinite 1s; }
    .cb  { animation: cursorBlink 1s step-end infinite; }
    @keyframes neonPulse {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.18; }
    }
    @keyframes cursorBlink {
      0%,49%   { opacity: 1; }
      50%,100% { opacity: 0; }
    }
  </style>
</defs>
<g clip-path="url(#fc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ── TITLEBAR ─────────────────────────────────────── -->
  <rect width="${W}" height="34" fill="${c.bar}"/>
  <rect y="33.5" width="${W}" height="0.5" fill="${c.border}"/>
  <circle cx="22" cy="17" r="5" fill="#ff5f57"/>
  <circle cx="40" cy="17" r="5" fill="#febc2e"/>
  <circle cx="58" cy="17" r="5" fill="#28c840"/>
  <text x="76" y="22" font-family="'Courier New',monospace" font-size="11" fill="${c.dim}">connect · collaborate · build</text>

  <!-- ── LINKS + OFW ─────────────────────────────────── -->
  <text x="${W / 2}" y="56" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${c.muted}">LinkedIn  ·  GitHub  ·  Discord  ·  hazy.cosedevs.com</text>
  <circle cx="${W - 40}" cy="55" r="3.5" fill="${c.accent}" class="np"/>
  <text x="${W - 32}" y="59" font-family="'Courier New',monospace" font-size="9" font-weight="700" fill="${c.accent}">OFW</text>

  <!-- ── PIXEL ART ZONE (y = 71 → 114) ───────────────────
       Strict dedicated strip at the very bottom.
  ────────────────────────────────────────────────────────── -->
  <line x1="0" y1="71" x2="${W}" y2="71" stroke="${c.border}" stroke-width="0.5"/>

  <!-- [A] SIGNAL STRENGTH BARS ── -->
  ${barsSVG}
  <text x="60" y="109" font-family="'Courier New',monospace" font-size="8" letter-spacing="1" fill="${c.dim}">SIG.OK</text>

  <!-- [B] SMALL NEON × CROSS ── -->
  <g class="np2">
    ${smallCross}
  </g>

  <!-- [C] HORIZONTAL PULSE LINES ── -->
  ${pulseLinesSVG}

  <!-- [D] STATUS TEXT + BLINKING CURSOR ── -->
  <text x="168" y="98" font-family="'Courier New',monospace" font-size="9" letter-spacing="0.5" fill="${c.dim}">// EOF  ·  © Hazy019  ·  Kyrell Santillan  ·  Open for Work</text>
  <rect x="168" y="84" width="6" height="11" rx="1" fill="${c.accent}" class="cb" opacity="0.8"/>

  <!-- [E] PIXEL GRID DECORATION ── -->
  ${pixelGridSVG}

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
