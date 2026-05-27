export const config = { runtime: "edge" };

// Courier New / Consolas char width: ~0.595 × fontSize
function badgeWidth(label, fontSize = 9.5, hPad = 14) {
  return Math.round(label.length * fontSize * 0.595) + hPad * 2;
}

function layoutRow(items, startX, y, c, fontSize = 9.5, hPad = 14, gap = 10) {
  let x = startX;
  return items.map(label => {
    const w  = badgeWidth(label, fontSize, hPad);
    const h  = Math.round(fontSize * 2.6);
    const ty = y + Math.round(h * 0.68);
    const el = `
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12"
      fill="${c.bg}" stroke="${c.border}" stroke-width="0.5"/>
<text x="${x + w / 2}" y="${ty}" text-anchor="middle"
      font-family="'Courier New',Consolas,monospace"
      font-size="${fontSize}" fill="${c.text}">${label}</text>`;
    x += w + gap;
    return el;
  }).join("\n");
}

const STACK_ROW1 = ["Python", "HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind"];
const STACK_ROW2 = ["Flask", "PostgreSQL", "PyQt6", "Figma", "Git"];
const CONNECT    = [
  "GitHub · Hazy019",
  "LinkedIn · kyrell-santillan",
  "Discord · Hazy019",
  "Site · hazy.cosedevs.com",
];

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:     "#0d1117",
        dim:    "#6e7681",
        border: "#30363d",
        stack:  { bg: "#161b22", text: "#8b949e", border: "#30363d"  },
        link:   { bg: "#0d2114", text: "#39d353",  border: "#238636" },
      }
    : {
        bg:     "#ffffff",
        dim:    "#8c959f",
        border: "#d0d7de",
        stack:  { bg: "#f6f8fa", text: "#57606a", border: "#d0d7de" },
        link:   { bg: "#dafbe1", text: "#1a7f37",  border: "#4ac26b" },
      };

  const W     = 900;
  const PAD_X = 24;

  const R1_Y      = 46;
  const R2_Y      = R1_Y + 36;
  const SEP_Y     = R2_Y + 46;
  const CONN_LBL  = SEP_Y + 20;
  const CONN_UND  = CONN_LBL + 8;
  const CONN_ROW  = CONN_UND + 16;
  const H         = CONN_ROW + 40;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="stc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#stc)">

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- Section: TECH STACK -->
  <text x="${PAD_X}" y="18"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// TECH STACK</text>
  <line x1="${PAD_X}" y1="26" x2="${W - PAD_X}" y2="26"
        stroke="${c.border}" stroke-width="0.5"/>

  ${layoutRow(STACK_ROW1, PAD_X, R1_Y, c.stack)}
  ${layoutRow(STACK_ROW2, PAD_X, R2_Y, c.stack)}

  <line x1="${PAD_X}" y1="${SEP_Y}" x2="${W - PAD_X}" y2="${SEP_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Section: CONNECT -->
  <text x="${PAD_X}" y="${CONN_LBL}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// CONNECT</text>
  <line x1="${PAD_X}" y1="${CONN_UND}" x2="${W - PAD_X}" y2="${CONN_UND}"
        stroke="${c.border}" stroke-width="0.5"/>

  ${layoutRow(CONNECT, PAD_X, CONN_ROW, c.link)}

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
