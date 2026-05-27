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
  const BAR_H   = 32;         
  const PAD_X   = 28;         
  const NAME_Y  = BAR_H + 42; 
  const ROLE_Y  = NAME_Y + 20; 
  const BADGE_Y = ROLE_Y + 8;  

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>
<g clip-path="url(#hc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <rect width="${W}" height="${BAR_H}" fill="${c.bar}"/>
  <rect y="${BAR_H - 0.5}" width="${W}" height="0.5" fill="${c.border}"/>

  <circle cx="22" cy="16" r="4.5" fill="#ff5f57"/>
  <circle cx="38" cy="16" r="4.5" fill="#febc2e"/>
  <circle cx="54" cy="16" r="4.5" fill="#28c840"/>
  <text x="74" y="20" font-family="'Courier New', Consolas, monospace" font-size="11" fill="${c.dim}">~/kyrell-santillan — zsh</text>

  <text x="${PAD_X}" y="${NAME_Y}" font-family="'Courier New', Consolas, monospace" font-size="30" font-weight="700" fill="${c.text}">Kyrell Santillan</text>

  <text x="${PAD_X}" y="${ROLE_Y}" font-family="'Courier New', Consolas, monospace" font-size="11" fill="${c.muted}">Web Designer  ·  Frontend Engineer  ·  Cybersecurity  ·  Philippines  ·  UTC+8</text>

  <rect x="${PAD_X}" y="${BADGE_Y}" width="116" height="17" rx="8.5" fill="${c.aBg}"/>
  <circle cx="${PAD_X + 13}" cy="${BADGE_Y + 8.5}" r="3" fill="${c.accent}"/>
  <text x="${PAD_X + 24}" y="${BADGE_Y + 11.5}" font-family="'Courier New', Consolas, monospace" font-size="9.5" font-weight="700" fill="${c.accent}">OPEN FOR WORK</text>

  <rect width="${W}" height="1" fill="${c.border}"/>
  <rect x="0" y="0" width="1" height="${H}" fill="${c.border}"/>
  <rect x="${W - 1}" y="0" width="1" height="${H}" fill="${c.border}"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
