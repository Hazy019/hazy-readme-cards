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
        border2:"#21262d",
        accent: "#39d353",
        aBg:    "#0d2114",
        blue:   "#79c0ff",
      }
    : {
        bg:     "#ffffff",
        bar:    "#f6f8fa",
        text:   "#1a1a1a",
        muted:  "#57606a",
        dim:    "#8c959f",
        border: "#d0d7de",
        border2:"#eaecef",
        accent: "#1a7f37",
        aBg:    "#dafbe1",
        blue:   "#0550ae",
      };

  const W = 900, H = 136;
  const BAR_H  = 32;
  const PAD_X  = 28;
  const DIVX   = 460;   // column split x

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="hc"><rect width="${W}" height="${H}"/></clipPath>
  <style>
    /* Step-blink: matches real terminal block cursor */
    @keyframes __blink {
      0%,49%  { opacity:1; }
      50%,100%{ opacity:0; }
    }
    .cur { animation:__blink 1s step-end infinite; }

    /* Soft pulse for OFW dot */
    @keyframes __pulse {
      0%,100%{ opacity:0.7; }
      50%    { opacity:1;   }
    }
    .ofw-dot { animation:__pulse 2.4s ease-in-out infinite; }
  </style>
</defs>
<g clip-path="url(#hc)">

  <!-- Canvas -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ── TITLEBAR ─────────────────────────────────────────────────────── -->
  <rect width="${W}" height="${BAR_H}" fill="${c.bar}"/>
  <rect y="${BAR_H - 0.5}" width="${W}" height="0.5" fill="${c.border}"/>

  <!-- Traffic-light dots -->
  <circle cx="20" cy="16" r="5.5" fill="#ff5f57"/>
  <circle cx="38" cy="16" r="5.5" fill="#febc2e"/>
  <circle cx="56" cy="16" r="5.5" fill="#28c840"/>

  <!-- Shell path -->
  <text x="76" y="21"
        font-family="'Courier New',Consolas,monospace" font-size="11" fill="${c.dim}">~/kyrell-santillan — zsh</text>

  <!-- Active-status dot, right side -->
  <circle class="ofw-dot" cx="${W - 20}" cy="16" r="4" fill="${c.accent}"/>

  <!-- ── LEFT — NAME + ROLES ─────────────────────────────────────────── -->
  <text x="${PAD_X}" y="80"
        font-family="'Courier New',Consolas,monospace"
        font-size="30" font-weight="700" fill="${c.text}">Kyrell Santillan</text>

  <!-- Block cursor after name -->
  <rect class="cur" x="291" y="53" width="10" height="28" rx="1" fill="${c.accent}" opacity="0.85"/>

  <!-- Roles -->
  <text x="${PAD_X}" y="100"
        font-family="'Courier New',Consolas,monospace"
        font-size="11" fill="${c.muted}">Web Designer  ·  Frontend Engineer  ·  Cybersecurity  ·  Philippines</text>

  <!-- Open for Work pill -->
  <rect x="${PAD_X}" y="108" width="118" height="18" rx="9" fill="${c.aBg}"/>
  <circle class="ofw-dot" cx="${PAD_X + 13}" cy="117" r="3.5" fill="${c.accent}"/>
  <text x="${PAD_X + 24}" y="121"
        font-family="'Courier New',Consolas,monospace"
        font-size="9.5" font-weight="700" fill="${c.accent}">Open for Work</text>

  <!-- ── COLUMN DIVIDER ──────────────────────────────────────────────── -->
  <line x1="${DIVX}" y1="${BAR_H + 10}" x2="${DIVX}" y2="${H - 10}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- ── RIGHT — IDENTITY META ──────────────────────────────────────── -->
  <text x="${DIVX + 20}" y="56"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// IDENTITY</text>
  <line x1="${DIVX + 20}" y1="62" x2="${W - PAD_X}" y2="62"
        stroke="${c.border2}" stroke-width="0.5"/>

  <!-- GitHub -->
  <text x="${DIVX + 20}" y="80"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.muted}">GitHub</text>
  <text x="${W - PAD_X}" y="80" text-anchor="end"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.blue}">Hazy019</text>

  <!-- Site -->
  <text x="${DIVX + 20}" y="97"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.muted}">Site</text>
  <text x="${W - PAD_X}" y="97" text-anchor="end"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.blue}">hazy.cosedevs.com</text>

  <!-- Discord -->
  <text x="${DIVX + 20}" y="114"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.muted}">Discord</text>
  <text x="${W - PAD_X}" y="114" text-anchor="end"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.blue}">Hazy019</text>

  <!-- LinkedIn -->
  <text x="${DIVX + 20}" y="131"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.muted}">LinkedIn</text>
  <text x="${W - PAD_X}" y="131" text-anchor="end"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.blue}">kyrell-santillan</text>

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
