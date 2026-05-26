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
        panelBg:    "#0b0e14",
        linkBg:     "#161b22",
        linkText:   "#79c0ff",
        linkBorder: "#30363d",
      }
    : {
        bg:         "#ffffff",
        text:       "#1a1a1a",
        muted:      "#57606a",
        dim:        "#8c959f",
        border:     "#d0d7de",
        accent:     "#1a7f37",
        panelBg:    "#f0f2f5",
        linkBg:     "#f6f8fa",
        linkText:   "#0550ae",
        linkBorder: "#d0d7de",
      };

  const W = 900;

  // ── Row 1: pixel art panel dimensions ────────────────────────────────────
  const PANEL_X      = 24;
  const PANEL_Y      = 12;
  const PANEL_W      = W - 48;   // 852px
  const PANEL_H      = 180;
  const PANEL_BOTTOM = PANEL_Y + PANEL_H;

  // ── Row 2: info & links section ──────────────────────────────────────────
  const ROW2_TOP = PANEL_BOTTOM + 20;   // 212
  const H        = ROW2_TOP + 64;       // 276

  // ── Link pills layout ────────────────────────────────────────────────────
  const LINKS = [
    { label: "GitHub · Hazy019",          w: 130 },
    { label: "LinkedIn · kyrell-santillan", w: 192 },
    { label: "Discord · Hazy019",          w: 136 },
    { label: "Site · hazy.cosedevs.com",   w: 170 },
  ];
  const LINK_GAP  = 10;
  const LINK_H    = 22;
  const LINK_Y    = ROW2_TOP + 34;

  let lx = 24;
  const linkPills = LINKS.map(({ label, w }) => {
    const el = `
  <rect x="${lx}" y="${LINK_Y}" width="${w}" height="${LINK_H}" rx="11"
        fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
  <text x="${lx + w / 2}" y="${LINK_Y + 14.5}" text-anchor="middle"
        font-family="'Courier New', Consolas, monospace" font-size="9"
        font-weight="700" fill="${c.linkText}">${label}</text>`;
    lx += w + LINK_GAP;
    return el;
  }).join("");

  // Right-side branding x anchor
  const BRAND_X   = W - 24;
  const BRAND_Y   = LINK_Y + 14;
  const OFW_DOT_X = W - 132;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>

<!-- ═══════════════════════════════════════════════════════════════════
     ANIMATION CLASSES
     Attach these directly to <image> or <g> elements in the pixel art
     panel to animate them natively without JavaScript.

     .crt-flicker   — smooth, non-intrusive screen-refresh pulse
     .terminal-cursor — sharp blinking block cursor █
     .subtle-glow   — slow breathing glow for brand / neon elements
════════════════════════════════════════════════════════════════════ -->
<style>
  /* Screen-refresh pulse: subtle opacity oscillation */
  @keyframes crtFlickerKF {
    0%   { opacity: 0.94; }
    8%   { opacity: 1;    }
    16%  { opacity: 0.96; }
    40%  { opacity: 1;    }
    58%  { opacity: 0.95; }
    80%  { opacity: 1;    }
    92%  { opacity: 0.97; }
    100% { opacity: 0.94; }
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
    50%      { opacity: 1;    filter: drop-shadow(0 0 9px #39d353);  }
  }
  .subtle-glow {
    animation: subtleGlowKF 4s ease-in-out infinite;
  }
</style>

<g clip-path="url(#fc)">

  <!-- Canvas -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ══════════════════════════════════════════════════════
       ROW 1 — PIXEL ART IMAGE CONTAINER
       Replace the href value with your Base64 PNG string.
       The container is ${PANEL_W}×${PANEL_H}px.
  ══════════════════════════════════════════════════════ -->

  <!-- Bordered panel background -->
  <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="6"
        fill="${c.panelBg}" stroke="${c.border}" stroke-width="1"/>

  <!-- Pixel art image slot — swap href for your Base64 encoded PNG -->
  <image
    class="crt-flicker"
    href="YOUR_BASE64_IMAGE_STRING_HERE"
    x="${PANEL_X}" y="${PANEL_Y}"
    width="${PANEL_W}" height="${PANEL_H}"
    preserveAspectRatio="xMidYMid meet"
    clip-path="url(#imgClip)"
  />
  <!-- Inner clip so the image respects the panel's rounded corners -->
  <defs>
    <clipPath id="imgClip">
      <rect x="${PANEL_X}" y="${PANEL_Y}" width="${PANEL_W}" height="${PANEL_H}" rx="6"/>
    </clipPath>
  </defs>

  <!-- Placeholder label (remove once image is loaded) -->
  <text x="${PANEL_X + PANEL_W / 2}" y="${PANEL_Y + PANEL_H / 2 - 6}" text-anchor="middle"
        font-family="'Courier New', Consolas, monospace" font-size="11" fill="${c.dim}">
    // pixel art panel
  </text>
  <text x="${PANEL_X + PANEL_W / 2}" y="${PANEL_Y + PANEL_H / 2 + 14}" text-anchor="middle"
        font-family="'Courier New', Consolas, monospace" font-size="10" fill="${c.muted}">
    replace href="YOUR_BASE64_IMAGE_STRING_HERE"
  </text>

  <!-- ══════════════════════════════════════════════════════
       ROW 2 — SYSTEM INFO & LINKS
  ══════════════════════════════════════════════════════ -->

  <!-- Dividers + section label -->
  <line x1="24" y1="${ROW2_TOP}" x2="${W - 24}" y2="${ROW2_TOP}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="24" y="${ROW2_TOP + 18}"
        font-family="'Courier New', Consolas, monospace" font-size="10"
        font-weight="700" letter-spacing="1.5" fill="${c.dim}">// connect · collaborate · build</text>
  <line x1="24" y1="${ROW2_TOP + 25}" x2="${W - 24}" y2="${ROW2_TOP + 25}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Link pills -->
  ${linkPills}

  <!-- OFW dot (subtle-glow animation ready) -->
  <circle cx="${OFW_DOT_X}" cy="${BRAND_Y - 4}" r="4"
          fill="${c.accent}" class="subtle-glow"/>
  <text x="${OFW_DOT_X + 10}" y="${BRAND_Y}"
        font-family="'Courier New', Consolas, monospace" font-size="9"
        font-weight="700" fill="${c.accent}">OFW</text>

  <!-- Brand name -->
  <text x="${BRAND_X}" y="${BRAND_Y}" text-anchor="end"
        font-family="'Courier New', Consolas, monospace" font-size="10"
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
