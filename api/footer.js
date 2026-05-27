export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const host = req.headers.get('host') || 'hazy.codedevs.com';
  const proto = host.includes('localhost') ? 'http' : 'https';
  const assetUrl = `${proto}://${host}/api/pexil_art.gif`;

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

  // ── Layout Geometry ────────────────────────────────────────────────────────
  const W          = 900;
  const ART_H      = 280; // Scaled height for the pixel panel to preserve grid balance
  const CTRL_H     = 72;  // Controls zone height
  const H          = ART_H + CTRL_H; // Total Footer Canvas Height
  
  const PAD_X      = 28;
  const ROW2_TOP   = ART_H;
  const BRAND_X    = W - PAD_X;
  const BRAND_Y    = ROW2_TOP + 46;

  // Links data configuration
  const LINKS = [
    { label: "LinkedIn", url: "https://linkedin.com/in/kyrell-santillan" },
    { label: "GitHub",   url: "https://github.com/Hazy019" },
    { label: "Discord",  url: "https://discord.gg/Hazy019" },
    { label: "Website",  url: "https://hazy.codedevs.com" }
  ];

  let currentX = PAD_X;
  const linkPills = LINKS.map(link => {
    const textLen = link.label.length;
    const pW      = textLen * 7 + 20; 
    const pH      = 20;
    const pY      = ROW2_TOP + 34;
    const tX      = currentX + pW / 2;
    const tY      = pY + 13;

    const el = `
    <a href="${link.url}" target="_blank">
      <rect x="${currentX}" y="${pY}" width="${pW}" height="${pH}" rx="4"
            fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
      <text x="${tX}" y="${tY}" text-anchor="middle"
            font-family="'Courier New', Consolas, monospace" font-size=\"9.5\"
            font-weight="700" fill="${c.linkText}">${link.label}</text>
    </a>`;
    currentX += pW + 8;
    return el;
  }).join("");

  const OFW_DOT_X = currentX + 8;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>
<style>
  @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
  .terminal-cursor { animation: blink 1s step-end infinite; }
  @keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
  .subtle-glow { animation: pulse 2s ease-in-out infinite; }
  /* Enforce sharp pixel scaling rendering for the GIF asset */
  .pixelated { image-rendering: pixelated; image-rendering: crisp-edges; }
</style>
<g clip-path="url(#fc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <rect width="${W}" height="${ART_H}" fill="${c.panelBg}"/>
  <g class="pixelated">
    <image href="${assetUrl}" x="0" y="0" width="${W}" height="${ART_H}" preserveAspectRatio="xMidYMid slice" />
  </g>
  <rect y="${ART_H - 0.5}" width="${W}" height="0.5" fill="${c.border}"/>

  <rect y="${ROW2_TOP}" width="${W}" height="${CTRL_H}" fill="${c.bg}"/>
  
  <circle cx="22" cy="${ROW2_TOP + 17}" r="4" fill="#ff5f57"/>
  <circle cx="36" cy="${ROW2_TOP + 17}" r="4" fill="#febc2e"/>
  <circle cx="50" cy="${ROW2_TOP + 17}" r="4" fill="#28c840"/>
  
  <text x="68" y="${ROW2_TOP + 20}" font-family="'Courier New', Consolas, monospace" font-size="10.5" font-weight="700" fill="${c.dim}">connect · collaborate · build</text>
  
  <text x="274" y="${ROW2_TOP + 20}"
        font-family="'Courier New', Consolas, monospace" font-size="10.5"
        font-weight="700" fill="${c.accent}" class="terminal-cursor">█</text>

  <line x1="${PAD_X}" y1="${ROW2_TOP + 28}" x2="${W - PAD_X}" y2="${ROW2_TOP + 28}"
        stroke="${c.border}" stroke-width="0.5"/>

  ${linkPills}

  <circle cx="${OFW_DOT_X}" cy="${BRAND_Y - 3.5}" r="3.5"
          fill="${c.accent}" class="subtle-glow"/>
  <text x="${OFW_DOT_X + 10}" y="${BRAND_Y}"
        font-family="'Courier New', Consolas, monospace" font-size="10"
        font-weight="700" fill="${c.accent}">OFW</text>

  <text x="${BRAND_X}" y="${BRAND_Y}" text-anchor="end"
        font-family="'Courier New', Consolas, monospace" font-size="11"
        font-weight="700" fill="${c.text}">Kyrell Santillan</text>

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
