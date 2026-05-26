export const config = { runtime: "edge" };

function badgeWidth(label, fontSize = 9, hPad = 12) {
  // Courier New / Consolas char width estimator ~0.6 × fontSize
  return Math.round(label.length * fontSize * 0.6) + hPad * 2;
}

function layoutRow(items, startX, y, c, fontSize = 9, hPad = 12, gap = 8) {
  let x = startX;
  return items.map(label => {
    const w  = badgeWidth(label, fontSize, hPad);
    const h  = Math.round(fontSize * 2.4);
    const ty = y + Math.round(h * 0.68);
    const el = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="11" fill="${c.tagBg}" stroke="${c.border}" stroke-width="0.5"/>
<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="${fontSize}" fill="${c.tagText}">${label}</text>`;
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
        bg: "#0d1117",
        text: "#e6edf3",
        muted: "#8b949e",
        dim: "#6e7681",
        border: "#30363d",
        tagBg: "#161b22",
        tagText: "#8b949e",
        linkBg: "#0d2137",
        linkText: "#79c0ff",
        linkBorder: "#1f4e7a",
      }
    : {
        bg: "#ffffff",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#8c959f",
        border: "#d0d7de",
        tagBg: "#f6f8fa",
        tagText: "#57606a",
        linkBg: "#e8f4fd",
        linkText: "#0550ae",
        linkBorder: "#b6d4fb",
      };

  const W = 900, H = 176;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="stc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#stc)">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- Tech Stack -->
  <text x="24" y="24" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// TECH STACK</text>
  <line x1="24" y1="32" x2="${W - 24}" y2="32" stroke="${c.border}" stroke-width="0.5"/>

  ${layoutRow(STACK_ROW1, 24, 42, { tagBg: c.tagBg, tagText: c.tagText, border: c.border })}
  ${layoutRow(STACK_ROW2, 24, 66, { tagBg: c.tagBg, tagText: c.tagText, border: c.border })}

  <!-- Separator -->
  <line x1="24" y1="98" x2="${W - 24}" y2="98" stroke="${c.border}" stroke-width="0.5"/>

  <!-- Connect -->
  <text x="24" y="118" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// CONNECT</text>
  <line x1="24" y1="126" x2="${W - 24}" y2="126" stroke="${c.border}" stroke-width="0.5"/>

  ${layoutRow(CONNECT, 24, 136, { tagBg: c.linkBg, tagText: c.linkText, border: dark ? c.linkBorder : c.border }, 9, 14, 10)}

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
