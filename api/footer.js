export const config = { runtime: "edge" };

// ─────────────────────────────────────────────────────────────────────────────
// GitHub's SVG sandbox strips ALL external <image> href references.
// The only reliable way to embed raster art inside a GitHub-rendered SVG is
// to base64-encode the asset and embed it as a data: URI inline.
// This function fetches the GIF from the same Vercel deployment's public dir
// and encodes it.  The result is cached at the CDN layer via Cache-Control.
// ─────────────────────────────────────────────────────────────────────────────
async function encodeAsset(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const u8  = new Uint8Array(buf);
    // chunk-encode to avoid call-stack overflow on large arrays
    let bin = "";
    for (let i = 0; i < u8.length; i += 32768)
      bin += String.fromCharCode(...u8.subarray(i, Math.min(i + 32768, u8.length)));
    return `data:image/gif;base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

export default async function handler(req) {
  const url   = new URL(req.url);
  const dark  = url.searchParams.get("theme") !== "light";
  const host  = req.headers.get("host") ?? "localhost";
  const proto = host.startsWith("localhost") ? "http" : "https";

  // ── Fetch + inline the pixel art GIF ──────────────────────────────────────
  // Place pexil_art.gif in your project's /public folder.
  // Vercel serves /public/* at the root, so the URL is /{filename}.
  const gifDataUri = await encodeAsset(`${proto}://${host}/pexil_art.gif`);

  // ── Color tokens ──────────────────────────────────────────────────────────
  const c = dark
    ? {
        bg:         "#0d1117",
        text:       "#e6edf3",
        muted:      "#8b949e",
        dim:        "#6e7681",
        border:     "#30363d",
        accent:     "#39d353",
        linkBg:     "#161b22",
        linkText:   "#e6edf3",
        linkBorder: "#30363d",
        panelBg:    "#010409",
      }
    : {
        bg:         "#ffffff",
        text:       "#1a1a1a",
        muted:      "#57606a",
        dim:        "#8c959f",
        border:     "#d0d7de",
        accent:     "#1a7f37",
        linkBg:     "#f6f8fa",
        linkText:   "#1a1a1a",
        linkBorder: "#d0d7de",
        panelBg:    "#f0f0f0",
      };

  // ── Canvas geometry ────────────────────────────────────────────────────────
  const W       = 900;
  const IMG_H   = 220;   // pixel art zone height
  const INFO_H  = 72;    // info / links bar height
  const H       = IMG_H + INFO_H;
  const PAD_X   = 24;

  // ── Link pills ─────────────────────────────────────────────────────────────
  const LINKS = [
    { label: "GitHub · Hazy019",            w: 134 },
    { label: "LinkedIn · kyrell-santillan",  w: 194 },
    { label: "Discord · Hazy019",            w: 138 },
    { label: "Site · hazy.cosedevs.com",     w: 172 },
  ];
  const LINK_H   = 26;
  const LINK_GAP = 10;
  const LINK_Y   = IMG_H + 36;

  let lx = PAD_X;
  const linkPills = LINKS.map(({ label, w }) => {
    const el = `
  <rect x="${lx}" y="${LINK_Y}" width="${w}" height="${LINK_H}" rx="13"
        fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
  <text x="${lx + w / 2}" y="${LINK_Y + 16.5}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace" font-size="10"
        fill="${c.linkText}">${label}</text>`;
    lx += w + LINK_GAP;
    return el;
  }).join("");

  const OFW_X = W - PAD_X - 90;   // right-side OFW zone

  // ── Pixel art placeholder (shown when GIF hasn't loaded yet) ──────────────
  const placeholderSVG = `
  <rect x="0" y="0" width="${W}" height="${IMG_H}" fill="${c.panelBg}"/>
  <!-- Scanline grid texture (atmospheric, no image needed) -->
  <rect x="0" y="0" width="${W}" height="${IMG_H}" fill="url(#scanlines)" opacity="0.08"/>
  <text x="${W / 2}" y="${IMG_H / 2 - 8}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace" font-size="11" fill="${c.dim}">[ loading pixel art... ]</text>
  <rect class="terminal-cursor"
        x="${W / 2 + 74}" y="${IMG_H / 2 - 20}" width="8" height="14" rx="1"
        fill="${c.accent}" opacity="0.8"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="imgclip"><rect width="${W}" height="${IMG_H}"/></clipPath>
  <clipPath id="fc"><rect width="${W}" height="${H}"/></clipPath>

  <!-- Scanline pattern overlay (CSS-free, pure SVG) -->
  <pattern id="scanlines" x="0" y="0" width="${W}" height="3" patternUnits="userSpaceOnUse">
    <rect width="${W}" height="1" fill="${c.dim}" opacity="0.35"/>
  </pattern>

  <!-- Bottom vignette gradient over the image zone -->
  <linearGradient id="vign" x1="0" y1="0" x2="0" y2="1">
    <stop offset="60%" stop-color="${c.bg}" stop-opacity="0"/>
    <stop offset="100%" stop-color="${c.bg}" stop-opacity="0.72"/>
  </linearGradient>

  <style>
    /* ── CRT screen flicker ─────────────────────────────────────────
       Subtly modulates opacity to emulate phosphor-screen emission.
       GitHub strips JS but preserves inline <style> CSS animations. */
    @keyframes __crt {
      0%   { opacity: 0.95; }
      12%  { opacity: 1;    }
      24%  { opacity: 0.97; }
      50%  { opacity: 1;    }
      76%  { opacity: 0.96; }
      88%  { opacity: 1;    }
      100% { opacity: 0.95; }
    }
    .crt-screen-glow { animation: __crt 6s ease-in-out infinite; }

    /* ── Terminal block cursor (step blink) ─────────────────────── */
    @keyframes __cur {
      0%, 49%  { opacity: 1; }
      50%, 100%{ opacity: 0; }
    }
    .terminal-cursor { animation: __cur 1s step-end infinite; }

    /* ── OFW breathing pulse ────────────────────────────────────── */
    @keyframes __pulse {
      0%, 100%{ opacity: 0.65; }
      50%     { opacity: 1;    }
    }
    .brand-glow { animation: __pulse 2.8s ease-in-out infinite; }
  </style>
</defs>

<g clip-path="url(#fc)">

  <!-- ── CANVAS ─────────────────────────────────────────────────────────── -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ══════════════════════════════════════════════════════════════════════
       ROW 1 — PIXEL ART PANEL
       The GIF is base64-encoded at request time so GitHub's SVG sandbox
       sees a data: URI — the only format it will actually render.
  ══════════════════════════════════════════════════════════════════════ -->
  <g clip-path="url(#imgclip)">

    ${gifDataUri
      /* ── GIF loaded: render inline with CRT flicker ─────────────────── */
      ? `<image
           class="crt-screen-glow"
           href="${gifDataUri}"
           x="0" y="0"
           width="${W}" height="${IMG_H}"
           preserveAspectRatio="xMidYMid slice"/>`
      /* ── GIF failed: atmospheric placeholder ─────────────────────────── */
      : placeholderSVG
    }

    <!-- Scanline overlay (dark glass effect on top of GIF) -->
    <rect width="${W}" height="${IMG_H}" fill="url(#scanlines)" opacity="0.06"/>

    <!-- Bottom fade: blends image into the info bar seamlessly -->
    <rect width="${W}" height="${IMG_H}" fill="url(#vign)"/>

  </g>

  <!-- ══════════════════════════════════════════════════════════════════════
       ROW 2 — INFO & LINKS BAR
  ══════════════════════════════════════════════════════════════════════ -->

  <!-- Top divider of info bar -->
  <line x1="0" y1="${IMG_H}" x2="${W}" y2="${IMG_H}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Section label -->
  <text x="${PAD_X}" y="${IMG_H + 18}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// connect · collaborate · build</text>

  <!-- Blinking cursor beside label -->
  <rect class="terminal-cursor"
        x="${PAD_X + 252}" y="${IMG_H + 6}"
        width="7" height="12" rx="1"
        fill="${c.accent}" opacity="0.85"/>

  <!-- Under-label rule -->
  <line x1="${PAD_X}" y1="${IMG_H + 24}" x2="${W - PAD_X}" y2="${IMG_H + 24}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Link pills -->
  ${linkPills}

  <!-- OFW dot + label (right side) -->
  <circle class="brand-glow"
          cx="${OFW_X}" cy="${LINK_Y + 13}"
          r="4.5" fill="${c.accent}"/>
  <text x="${OFW_X + 11}" y="${LINK_Y + 17}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9.5" font-weight="700" fill="${c.accent}">OFW</text>

  <!-- Brand name (far right) -->
  <text x="${W - PAD_X}" y="${LINK_Y + 17}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="10.5" font-weight="700" fill="${c.text}">Kyrell Santillan</text>

  <!-- Outer frame rules -->
  <rect width="${W}" height="0.5" fill="${c.border}"/>
  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>
  <line x1="0"     y1="0" x2="0"     y2="${H}" stroke="${c.border}" stroke-width="1"/>
  <line x1="${W}" y1="0" x2="${W}"   y2="${H}" stroke="${c.border}" stroke-width="1"/>

</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type":  "image/svg+xml",
      // Moderate cache: allows GIF updates to propagate within an hour
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
