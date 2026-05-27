export const config = { runtime: "edge" };

function badgeWidth(label, fontSize = 9.5, hPad = 14) {
  // Courier New / Consolas char width estimator ~0.6 × fontSize
  return Math.round(label.length * fontSize * 0.6) + hPad * 2;
}

function layoutRow(items, startX, y, c, fontSize = 9.5, hPad = 14, gap = 10) {
  let x = startX;
  return items.map(label => {
    const w  = badgeWidth(label, fontSize, hPad);
    const h  = Math.round(fontSize * 2.5);
    const ty = y + Math.round(h * 0.68);
    const el = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c.tagBg}" stroke="${c.border}" stroke-width="0.5"/>
<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="'Courier New', Consolas, monospace" font-size="${fontSize}" fill="${c.tagText}">${label}</text>`;
    x += w + gap;
    return el;
  }).join("\n");
}

const STACK_ROW1 = ["Python", "HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind"];
const STACK_ROW2 = ["Flask", "PostgreSQL", "PyQt6", "Figma", "Git"];
const CONNECT    = ["GitHub · Hazy019", "LinkedIn · kyrell-santillan", "Discord · Hazy019", "Site · hazy.cosedevs.com"];

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:         "#0d1117",
        text:       "#e6edf3",
        muted:      "#8b949e",
        dim:        "#6e7681",
        border:     "#30363d",
        tagBg:      "#161b22",
        tagText:    "#8b949e",
        linkBg:     "#0f2a18",
        linkText:   "#39d353",
        linkBorder: "#238636",
      }
    : {
        bg:         "#ffffff",
        text:       "#1a1a1a",
        muted:      "#57606a",
        dim:        "#8c959f",
        border:     "#d0d7de",
        tagBg:      "#f6f8fa",
        tagText:    "#57606a",
        linkBg:     "#dafbe1",
        linkText:   "#1a7f37",
        linkBorder: "#4ac26b",
      };

  const W = 900;
  const PAD_X = 24;

  const ROW1_Y = 46;
  const ROW2_Y = ROW1_Y + 34;
  const SEP_Y  = ROW2_Y + 44;
  const CONN_LBL_Y = SEP_Y + 20;
  const CONN_UND_Y = CONN_LBL_Y + 8;
  const CONN_ROW_Y = CONN_UND_Y + 16;
  const H = CONN_ROW_Y + 40;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="stc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#stc)">
  <!-- Canvas -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- Tech Stack -->
  <text x="${PAD_X}" y="20"
        font-family="'Courier New', Consolas, monospace"
        font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// TECH STACK</text>
  <line x1="${PAD_X}" y1="28" x2="${W - PAD_X}" y2="28"
        stroke="${c.border}" stroke-width="0.5"/>

  ${layoutRow(STACK_ROW1, PAD_X, ROW1_Y, { tagBg: c.tagBg, tagText: c.tagText, border: c.border })}
  ${layoutRow(STACK_ROW2, PAD_X, ROW2_Y, { tagBg: c.tagBg, tagText: c.tagText, border: c.border })}

  <!-- Separator -->
  <line x1="${PAD_X}" y1="${SEP_Y}" x2="${W - PAD_X}" y2="${SEP_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Connect -->
  <text x="${PAD_X}" y="${CONN_LBL_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// CONNECT</text>
  <line x1="${PAD_X}" y1="${CONN_UND_Y}" x2="${W - PAD_X}" y2="${CONN_UND_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  ${layoutRow(CONNECT, PAD_X, CONN_ROW_Y, { tagBg: c.linkBg, tagText: c.linkText, border: c.linkBorder }, 9.5, 14, 10)}

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
