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
        accent: "#39d353",
        aBg:    "#0f2a18",
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
      };

  const W = 900, H = 120;

  // ── Geometry ────────────────────────────────────────────────────────────────
  const BAR_H   = 32;         // titlebar height
  const PAD_X   = 28;         // left content margin
  const NAME_Y  = BAR_H + 42; // baseline of name text
  const ROLE_Y  = NAME_Y + 20; // baseline of role line
  const BADGE_Y = ROLE_Y + 8;  // top of "open for work" pill

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>

<style>
  @keyframes crtFlickerKF {
    0%   { opacity: 0.96; }
    15%  { opacity: 1;    }
    45%  { opacity: 0.97; }
    70%  { opacity: 1;    }
    88%  { opacity: 0.96; }
    100% { opacity: 0.96; }
  }
  .crt-flicker { animation: crtFlickerKF 6s ease-in-out infinite; }

  @keyframes termCursorKF {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .terminal-cursor { animation: termCursorKF 1s step-end infinite; }
</style>

<g clip-path="url(#hc)">
  <!-- Canvas -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- Titlebar -->
  <rect width="${W}" height="${BAR_H}" fill="${c.bar}"/>
  <rect y="${BAR_H - 0.5}" width="${W}" height="0.5" fill="${c.border}"/>

  <!-- macOS traffic-light dots -->
  <circle cx="20" cy="${BAR_H / 2}" r="5" fill="#ff5f57"/>
  <circle cx="38" cy="${BAR_H / 2}" r="5" fill="#febc2e"/>
  <circle cx="56" cy="${BAR_H / 2}" r="5" fill="#28c840"/>

  <!-- Shell path label -->
  <text x="74" y="${BAR_H / 2 + 4}"
        font-family="'Courier New', Consolas, monospace" font-size="11"
        fill="${c.dim}">~/kyrell-santillan — zsh</text>

  <!-- Accent accent dot (crt-flicker applied) -->
  <circle cx="${W - 20}" cy="${BAR_H / 2}" r="4"
          fill="${c.accent}" class="crt-flicker"/>

  <!-- Name -->
  <text x="${PAD_X}" y="${NAME_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="30" font-weight="700" fill="${c.text}">Kyrell Santillan</text>

  <!-- Terminal cursor after name -->
  <text x="${PAD_X + 280}" y="${NAME_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="30" font-weight="700"
        fill="${c.accent}" class="terminal-cursor">█</text>

  <!-- Roles -->
  <text x="${PAD_X}" y="${ROLE_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="11" fill="${c.muted}">Web Designer  ·  Frontend Engineer  ·  Cybersecurity  ·  Philippines  ·  UTC+8</text>

  <!-- Open-for-work badge -->
  <rect x="${PAD_X}" y="${BADGE_Y}" width="116" height="17" rx="8.5" fill="${c.aBg}"/>
  <circle cx="${PAD_X + 13}" cy="${BADGE_Y + 8.5}" r="3" fill="${c.accent}"/>
  <text x="${PAD_X + 22}" y="${BADGE_Y + 12}"
        font-family="'Courier New', Consolas, monospace"
        font-size="9.5" font-weight="700" fill="${c.accent}">Open for Work</text>

  <!-- Bottom rule -->
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
