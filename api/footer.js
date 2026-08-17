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
      linkBg: "#12151b",
      linkText: "#8b949e",
      linkBorder: "#30363d",
    }
    : {
      bg: "#fcfbf9",
      bar: "#f5f2eb",
      text: "#1a1a1a",
      muted: "#57606a",
      dim: "#8c959f",
      border: "#e5e1d8",
      accent: "#16a34a",
      linkBg: "#f5f2eb",
      linkText: "#57606a",
      linkBorder: "#e5e1d8",
    };

  const W = 900;
  const H = 92;
  const PAD_X = 28;
  const STRIP_W = 3;   // left accent strip — visual rhyme anchor

  const LINKS = [
    { label: "LinkedIn", url: "https://linkedin.com/in/kyrell-santillan" },
    { label: "GitHub",   url: "https://github.com/Hazy019" },
    { label: "Discord",  url: "https://discord.gg/Hazy019" },
    { label: "Website",  url: "https://hazy.codedevs.com" },
  ];

  const TAG_H = 26;
  const TAG_Y = 52;

  // Build pill links
  let currentX = PAD_X + STRIP_W + 4;
  const linkPills = LINKS.map(link => {
    // Pill width based on label length, generously padded
    const pW = link.label.length * 7.2 + 30;
    const cx = currentX;
    const el = `
    <a href="${link.url}" target="_blank">
      <!-- Pill shape (rx=13 — rhymes with badge rx=9 in header) -->
      <rect x="${cx}" y="${TAG_Y}" width="${pW}" height="${TAG_H}" rx="13"
            fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
      <!-- Accent dot prefix (visual rhyme: badge dot in header, bullet dots in profile) -->
      <circle cx="${cx + 11}" cy="${TAG_Y + 13}" r="2.5" fill="${c.accent}" opacity="0.65"/>
      <text x="${cx + 22 + (pW - 22) / 2}" y="${TAG_Y + 17}" text-anchor="middle"
            font-family="'Courier New', Consolas, monospace"
            font-size="10" font-weight="700"
            fill="${c.linkText}" letter-spacing="0.5">${link.label}</text>
    </a>`;
    currentX += pW + 10;
    return el;
  }).join("");

  const OFW_DOT_X = currentX + 14;
  const BRAND_X = W - PAD_X - 1;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
  <!-- Gradient on title bar: solid left → fades to bg right (depth — mirrors header) -->
  <linearGradient id="fBarGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${c.bar}"/>
    <stop offset="100%" stop-color="${c.bg}"/>
  </linearGradient>
</defs>
<style>
  @keyframes pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
  .ofw-dot { animation: pulse 2.2s ease-in-out infinite; }
  a { cursor: pointer; text-decoration: none; }
  a:hover rect { stroke: ${c.accent}; stroke-width: 1px; }
</style>
<g clip-path="url(#fc)">

  <!-- Base background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ── TITLE BAR ──────────────────────────────────────────────────────── -->
  <rect width="${W}" height="34" fill="url(#fBarGrad)"/>
  <rect y="34" width="${W}" height="0.5" fill="${c.border}" opacity="0.6"/>

  <!-- Mac traffic-light dots (visual rhyme — mirrors header exactly) -->
  <circle cx="22" cy="17" r="4.5" fill="#ff5f57"/>
  <circle cx="38" cy="17" r="4.5" fill="#febc2e"/>
  <circle cx="54" cy="17" r="4.5" fill="#28c840"/>
  <text x="74" y="21"
        font-family="'Courier New', Consolas, monospace"
        font-size="11" font-weight="600"
        fill="${c.dim}" letter-spacing="1">connect  ·  collaborate  ·  build</text>

  <!-- ── LINK PILLS ────────────────────────────────────────────────────── -->
  ${linkPills}

  <!-- ── OFW STATUS (pulsing dot — visual rhyme with badge dot in header) -->
  <circle cx="${OFW_DOT_X}" cy="${TAG_Y + 13}" r="4" fill="${c.accent}" class="ofw-dot"/>
  <text x="${OFW_DOT_X + 13}" y="${TAG_Y + 17}"
        font-family="'Courier New', Consolas, monospace"
        font-size="10.5" font-weight="700"
        fill="${c.accent}" letter-spacing="1">OFW</text>

  <!-- ── BRAND NAME (typography rhyme — mirrors hero name in header) ────── -->
  <text x="${BRAND_X}" y="${TAG_Y + 17}" text-anchor="end"
        font-family="'Courier New', Consolas, monospace"
        font-size="12" font-weight="800"
        fill="${c.text}" letter-spacing="0.5">Kyrell Santillan</text>

  <!-- ── LEFT ACCENT STRIP (visual rhyme anchor — on every card) ──────── -->
  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>

  <!-- Card border -->
  <rect x="${W - 1}" y="0" width="1" height="${H}" fill="${c.border}"/>
  <rect y="0" width="${W}" height="1" fill="${c.border}"/>
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
