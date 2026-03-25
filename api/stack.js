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
    const [o, r] = await Promise.all([
      fetch("https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBoWgz.woff2").then(f => f.arrayBuffer()),
      fetch("https://fonts.gstatic.com/s/rajdhani/v15/LDI2apCSOBg7S-QT7pasEcHqqpU.woff2").then(f => f.arrayBuffer()),
    ]);
    return `@font-face{font-family:'Orbitron';font-weight:900;src:url('data:font/woff2;base64,${ab2b64(o)}')format('woff2')}
    @font-face{font-family:'Rajdhani';font-weight:600;src:url('data:font/woff2;base64,${ab2b64(r)}')format('woff2')}`;
  } catch { return ""; }
}

export default async function handler() {
  const ff = await loadFonts();
  const W = 900, H = 155;

  const MC = [
    "ア","イ","ウ","エ","カ","キ","ク","サ","シ","ス","タ","チ","ツ","ナ","ニ","ノ",
    "&lt;","&gt;","[","]","|","!","#","$","@","%","=","∆","Ω","Ψ","∞","√","≈","≠","◈","⬡","◫"
  ];
  const matrixCols = [18,38,58,78, 822,842,862,882].map((x, i) => {
    const dur = (3.2 + i * 0.55).toFixed(1);
    const delay = (i * 0.38).toFixed(1);
    const chars = MC.slice(i % 5, (i % 5) + 5);
    return `<g opacity="0" style="animation:mf ${dur}s linear ${delay}s infinite">
      ${chars.map((c, j) => `<text x="${x}" y="${8 + j * 18}" font-family="monospace" font-size="9" fill="rgba(212,175,55,${j === 0 ? 0.32 : 0.08 + (4 - j) * 0.02})">${c}</text>`).join("")}
    </g>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <style>
    ${ff}
    @keyframes mf{0%{opacity:0;transform:translateY(-22px)}8%{opacity:1}88%{opacity:.5}100%{opacity:0;transform:translateY(${H + 22}px)}}
    @keyframes sf{0%{transform:translateX(-300px)}100%{transform:translateX(${W + 300}px)}}
  </style>
  <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#d4af37"><animate attributeName="stop-color" values="#d4af37;#f4d03f;#fffde0;#f4d03f;#d4af37" dur="6s" repeatCount="indefinite"/></stop>
    <stop offset="40%"  stop-color="#f4d03f"><animate attributeName="stop-color" values="#f4d03f;#fffde0;#f4d03f;#d4af37;#f4d03f" dur="6s" repeatCount="indefinite"/></stop>
    <stop offset="60%"  stop-color="#fffde0"><animate attributeName="stop-color" values="#fffde0;#f4d03f;#d4af37;#f4d03f;#fffde0" dur="6s" repeatCount="indefinite"/></stop>
    <stop offset="100%" stop-color="#d4af37"><animate attributeName="stop-color" values="#d4af37;#d4af37;#f4d03f;#fffde0;#d4af37" dur="6s" repeatCount="indefinite"/></stop>
  </linearGradient>
  <radialGradient id="gl" cx="50%" cy="110%" r="70%">
    <stop offset="0%" stop-color="#d4af37" stop-opacity="0.14"/>
    <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sc" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#ffd700" stop-opacity="0"/>
    <stop offset="50%" stop-color="#ffd700" stop-opacity="0.045"/>
    <stop offset="100%" stop-color="#ffd700" stop-opacity="0"/>
  </linearGradient>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="10"/></clipPath>
</defs>
<g clip-path="url(#hc)">
  <rect width="${W}" height="${H}" fill="#050400"/>

  ${Array.from({length:8}, (_, i) => `<line x1="0" y1="${i*22}" x2="${W}" y2="${i*22}" stroke="rgba(212,175,55,0.04)" stroke-width="0.5"/>`).join("")}
  ${Array.from({length:9}, (_, i) => `<line x1="${i*112+24}" y1="0" x2="${i*112+24}" y2="${H}" stroke="rgba(212,175,55,0.035)" stroke-width="0.5"/>`).join("")}

  <ellipse cx="${W/2}" cy="${H * 1.3}" rx="520" ry="170" fill="url(#gl)"/>

  ${matrixCols}

  <rect x="-300" y="0" width="300" height="${H}" fill="url(#sc)">
    <animateTransform attributeName="transform" type="translate" from="0 0" to="${W + 300} 0" dur="8s" repeatCount="indefinite"/>
  </rect>

  <line x1="90" y1="0" x2="${W - 90}" y2="0" stroke="rgba(212,175,55,0.6)" stroke-width="1"/>

  <polyline points="0,20 0,0 20,0"                  fill="none" stroke="rgba(212,175,55,0.65)" stroke-width="1.5"/>
  <polyline points="${W-20},0 ${W},0 ${W},20"        fill="none" stroke="rgba(212,175,55,0.65)" stroke-width="1.5"/>
  <polyline points="0,${H-20} 0,${H} 20,${H}"       fill="none" stroke="rgba(212,175,55,0.65)" stroke-width="1.5"/>
  <polyline points="${W-20},${H} ${W},${H} ${W},${H-20}" fill="none" stroke="rgba(212,175,55,0.65)" stroke-width="1.5"/>

  <line x1="0"  y1="68" x2="10"     y2="68" stroke="rgba(212,175,55,0.3)" stroke-width="1"/>
  <line x1="${W}" y1="68" x2="${W-10}" y2="68" stroke="rgba(212,175,55,0.3)" stroke-width="1"/>

  <circle cx="${W - 58}" cy="18" r="3.5" fill="#d4af37">
    <animate attributeName="opacity" values="0.35;1;0.35" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="${W - 50}" y="22" font-family="'Orbitron',monospace" font-size="9" font-weight="900" letter-spacing="2.5" fill="rgba(247,205,68,0.9)">LIVE</text>

  <text x="${W/2}" y="27" text-anchor="middle" font-family="'Orbitron',monospace" font-size="8" font-weight="900" letter-spacing="3.5" fill="rgba(212,175,55,0.28)">◈ CREATIVE PORTFOLIO · FRONTEND ENGINEER · CYBERSECURITY ◈</text>

  <text x="${W/2}" y="95" text-anchor="middle" font-family="'Orbitron',monospace" font-size="68" font-weight="900" letter-spacing="8" fill="url(#g1)">HAZY019</text>

  <line x1="${W/2 - 30}" y1="108" x2="${W/2 + 30}" y2="108" stroke="rgba(255,255,255,0.88)" stroke-width="1.5" style="filter:drop-shadow(0 0 5px rgba(255,255,255,0.75))"/>

  <text x="${W/2}" y="127" text-anchor="middle" font-family="'Rajdhani',sans-serif" font-size="14" font-weight="600" letter-spacing="2.5" fill="rgba(212,175,55,0.6)">Kyrell Santillan  ·  Web Designer  ·  Developer  ·  Cybersecurity</text>

  <text x="${W/2}" y="147" text-anchor="middle" font-family="'Orbitron',monospace" font-size="9" font-weight="900" letter-spacing="3" fill="rgba(212,175,55,0.28)">PHT · UTC+8  ·  Philippines  ·  Open for Work</text>

  <line x1="0" y1="${H - 1}" x2="${W}" y2="${H - 1}" stroke="rgba(212,175,55,0.06)" stroke-width="0.8"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
