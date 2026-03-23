export const config = { runtime: "edge" };

function ab2b64(buf) {
  const u = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i += 32768)
    s += String.fromCharCode(...u.subarray(i, Math.min(i + 32768, u.length)));
  return btoa(s);
}

async function loadFonts() {
  try {
    const o = await fetch("https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBoWgz.woff2").then(f => f.arrayBuffer());
    return `@font-face{font-family:'Orbitron';font-weight:900;src:url('data:font/woff2;base64,${ab2b64(o)}')format('woff2')}`;
  } catch { return ""; }
}

// Orbitron char width estimator: ~0.88 × fontSize per character
function badgeWidth(label, fontSize = 8, hPad = 9) {
  return Math.round(label.length * fontSize * 0.88) + hPad * 2;
}

function badgeRect(label, x, y, fontSize = 8, hPad = 9, opacity = 0.72) {
  const w = badgeWidth(label, fontSize, hPad);
  const h = Math.round(fontSize * 2.4);
  const ty = y + Math.round(h * 0.66);
  return {
    w,
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="rgba(212,175,55,0.06)" stroke="rgba(212,175,55,0.22)" stroke-width="0.8"/>
<text x="${x + w / 2}" y="${ty}" text-anchor="middle" font-family="'Orbitron',monospace" font-size="${fontSize}" font-weight="900" letter-spacing="1.2" fill="rgba(212,175,55,${opacity})">${label}</text>`,
  };
}

function layoutRow(items, startX, y, fontSize, hPad, gap, opacity) {
  let x = startX;
  return items.map(label => {
    const b = badgeRect(label, x, y, fontSize, hPad, opacity);
    x += b.w + gap;
    return b.svg;
  }).join("\n");
}

const STACK_ROW1 = ["Python", "HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind"];
const STACK_ROW2 = ["Flask", "PostgreSQL", "PyQt6", "Figma", "Git"];
const CONNECT    = ["GitHub · Hazy019", "LinkedIn · kyrell-santillan", "Discord · Hazy019", "Site · hazy.cosedevs.com"];

export default async function handler() {
  const ff = await loadFonts();
  const W = 900, H = 200;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <style>${ff}</style>
  <clipPath id="sc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#sc)">
  <rect width="${W}" height="${H}" fill="#050400"/>

  ${Array.from({length:10}, (_, i) => `<line x1="0" y1="${i * 22}" x2="${W}" y2="${i * 22}" stroke="rgba(212,175,55,0.025)" stroke-width="0.5"/>`).join("")}

  <!-- Top hairline -->
  <line x1="0" y1="0" x2="${W}" y2="0" stroke="rgba(212,175,55,0.1)" stroke-width="0.8"/>

  <!-- ── TECH STACK ──────────────────────────────── -->
  <text x="24" y="28" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="3" fill="rgba(212,175,55,0.38)">TECH STACK</text>
  <line x1="24" y1="36" x2="74" y2="36" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" style="filter:drop-shadow(0 0 3px rgba(255,255,255,0.65))"/>

  ${layoutRow(STACK_ROW1, 24, 46, 8, 9, 8, 0.72)}
  ${layoutRow(STACK_ROW2, 24, 76, 8, 9, 8, 0.72)}

  <!-- ── SEPARATOR ──────────────────────────────── -->
  <line x1="24" y1="108" x2="${W - 24}" y2="108" stroke="rgba(212,175,55,0.07)" stroke-width="0.8"/>

  <!-- ── CONNECT ────────────────────────────────── -->
  <text x="24" y="128" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="3" fill="rgba(212,175,55,0.38)">CONNECT</text>
  <line x1="24" y1="136" x2="74" y2="136" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" style="filter:drop-shadow(0 0 3px rgba(255,255,255,0.65))"/>

  ${layoutRow(CONNECT, 24, 146, 7.5, 9, 10, 0.62)}

  <!-- ── FOOTER ─────────────────────────────────── -->
  <line x1="0" y1="182" x2="${W}" y2="182" stroke="rgba(212,175,55,0.06)" stroke-width="0.6"/>
  <text x="${W / 2}" y="195" text-anchor="middle" font-family="'Orbitron',monospace" font-size="8" font-weight="900" letter-spacing="3.5" fill="rgba(212,175,55,0.22)">© HAZY019 · KYRELL SANTILLAN · OPEN FOR WORK</text>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
