export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:         "#0d1117",
        text:       "#e6edf3",
        muted:      "#8b949e",
        dim:        "#6e7681",
        border:     "#30363d",
        accent:     "#39d353",
        panelBg:    "#010409",
        linkBg:     "#161b22",
        linkText:   "#e6edf3",
        linkBorder: "#30363d",
      }
    : {
        bg:         "#ffffff",
        text:       "#1a1a1a",
        muted:      "#57606a",
        dim:        "#8c959f",
        border:     "#d0d7de",
        accent:     "#1a7f37",
        panelBg:    "#f6f8fa",
        linkBg:     "#f6f8fa",
        linkText:   "#1a1a1a",
        linkBorder: "#d0d7de",
      };

  const W = 900;

  // ── Row 1: pixel art panel dimensions ────────────────────────────────────
  const PAD_X        = 24;
  const PANEL_X      = PAD_X;
  const PANEL_Y      = 12;
  const PANEL_W      = W - PAD_X * 2;
  const PANEL_H      = 220; // Allocated generous height for a premium asset
  const PANEL_BOTTOM = PANEL_Y + PANEL_H;

  // ── Row 2: info & links section ──────────────────────────────────────────
  const ROW2_TOP = PANEL_BOTTOM + 24;
  const H        = ROW2_TOP + 80;

  // ── Link pills layout ────────────────────────────────────────────────────
  const LINKS = [
    { label: "GitHub · Hazy019",          w: 130 },
    { label: "LinkedIn · kyrell-santillan", w: 192 },
    { label: "Discord · Hazy019",          w: 136 },
    { label: "Site · hazy.codedevs.com",   w: 170 },
  ];
  const LINK_GAP  = 12;
  const LINK_H    = 24;
  const LINK_Y    = ROW2_TOP + 36;

  let lx = PAD_X;
  const linkPills = LINKS.map(({ label, w }) => {
    const el = `
  <rect x="${lx}" y="${LINK_Y}" width="${w}" height="${LINK_H}" rx="4"
        fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
  <text x="${lx + w / 2}" y="${LINK_Y + 15.5}" text-anchor="middle"
        font-family="'Courier New', Consolas, monospace" font-size="10"
        fill="${c.linkText}">${label}</text>`;
    lx += w + LINK_GAP;
    return el;
  }).join("");

  // Right-side branding x anchor
  const BRAND_X   = W - PAD_X;
  const BRAND_Y   = LINK_Y + 16;
  const OFW_DOT_X = BRAND_X - 146;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>

<!-- ═══════════════════════════════════════════════════════════════════
     ANIMATION CLASSES
     Attach these directly to <image> or <g> elements in the pixel art
     panel to animate them natively without JavaScript.
════════════════════════════════════════════════════════════════════ -->
<style>
  /* Screen-refresh pulse: subtle opacity oscillation */
  @keyframes crtFlickerKF {
    0%   { opacity: 0.96; }
    15%  { opacity: 1;    }
    45%  { opacity: 0.97; }
    70%  { opacity: 1;    }
    88%  { opacity: 0.96; }
    100% { opacity: 0.96; }
  }
  .crt-flicker {
    animation: crtFlickerKF 5s ease-in-out infinite;
  }

  /* Terminal block cursor — sharp step-end blink */
  @keyframes termCursorKF {
    0%,  49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  .terminal-cursor {
    animation: termCursorKF 1s step-end infinite;
  }

  /* Slow breathing glow for brand / neon elements */
  @keyframes subtleGlowKF {
    0%, 100% { opacity: 0.75; filter: drop-shadow(0 0 4px #39d353); }
    50%      { opacity: 1;    filter: drop-shadow(0 0 8px #39d353);  }
  }
  .subtle-glow {
    animation: subtleGlowKF 3s ease-in-out infinite;
  }
</style>

<g clip-path="url(#fc)">

  <!-- Canvas -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ══════════════════════════════════════════════════════
       ROW 1 — PIXEL ART IMAGE CONTAINER
       Replace the href value with your Base64 string/URL.
  ══════════════════════════════════════════════════════ -->

  <!-- Bordered panel background -->
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="8"
        fill="${c.panelBg}" stroke="${c.border}" stroke-width="1"/>

  <!-- Pixel art image slot — crt-flicker animated -->
  <image
    class="crt-flicker"
    href="YOUR_IMAGE_OR_GIF_URL_HERE"
    x="${PANEL_X}" y="${PANEL_Y}"
    width="${PANEL_W}" height="${PANEL_H}"
    preserveAspectRatio="xMidYMid slice"
    clip-path="url(#imgClip)"
  />
  <defs>
    <clipPath id="imgClip">
      <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="8"/>
    </clipPath>
  </defs>

  <!-- ══════════════════════════════════════════════════════
       ROW 2 — SYSTEM INFO & LINKS
  ══════════════════════════════════════════════════════ -->

  <!-- Dividers + section label -->
  <line x1="${PAD_X}" y1="${ROW2_TOP}" x2="${W - PAD_X}" y2="${ROW2_TOP}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${ROW2_TOP + 18}"
        font-family="'Courier New', Consolas, monospace" font-size="10"
        font-weight="700" letter-spacing="1.5" fill="${c.dim}">// connect · collaborate · build</text>
  
  <!-- Terminal cursor element beside title -->
  <text x="${PAD_X + 270}" y="${ROW2_TOP + 18}"
        font-family="'Courier New', Consolas, monospace" font-size="10"
        font-weight="700" fill="${c.accent}" class="terminal-cursor">█</text>

  <line x1="${PAD_X}" y1="${ROW2_TOP + 26}" x2="${W - PAD_X}" y2="${ROW2_TOP + 26}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Link pills -->
  ${linkPills}

  <!-- OFW dot (subtle-glow animation ready) -->
  <circle cx="${OFW_DOT_X}" cy="${BRAND_Y - 3}" r="4"
          fill="${c.accent}" class="subtle-glow"/>
  <text x="${OFW_DOT_X + 10}" y="${BRAND_Y}"
        font-family="'Courier New', Consolas, monospace" font-size="10"
        font-weight="700" fill="${c.accent}">OFW</text>

  <!-- Brand name -->
  <text x="${BRAND_X}" y="${BRAND_Y}" text-anchor="end"
        font-family="'Courier New', Consolas, monospace" font-size="11"
        font-weight="700" fill="${c.text}">Kyrell Santillan</text>

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
