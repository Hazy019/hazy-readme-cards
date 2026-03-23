export const config = { runtime: "edge" };

export default async function handler() {
  let orbitronB64 = "";
  let rajdhaniB64 = "";

  try {
    const [oRes, rRes] = await Promise.all([
      fetch("https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBoWgz.woff2"),
      fetch("https://fonts.gstatic.com/s/rajdhani/v15/LDI2apCSOBg7S-QT7pasEcHqqpU.woff2"),
    ]);
    const [oArr, rArr] = await Promise.all([oRes.arrayBuffer(), rRes.arrayBuffer()]);
    orbitronB64 = btoa(String.fromCharCode(...new Uint8Array(oArr)));
    rajdhaniB64 = btoa(String.fromCharCode(...new Uint8Array(rArr)));
  } catch {
    orbitronB64 = "";
    rajdhaniB64 = "";
  }

  const matrixCols = [
    { x: 32,  chars: ["ア","イ","ウ","エ","カ"], dur: "3.8", delay: "0"   },
    { x: 78,  chars: ["キ","ク","サ","シ","ス"], dur: "4.2", delay: "0.6" },
    { x: 124, chars: ["タ","チ","ツ","ナ","ニ"], dur: "3.5", delay: "1.1" },
    { x: 170, chars: ["0","1","◈","⬡","◫"],     dur: "4.6", delay: "0.3" },
    { x: 216, chars: ["∆","Ω","Ψ","∞","√"],     dur: "3.9", delay: "1.7" },
    { x: 684, chars: ["ア","イ","ウ","エ","カ"], dur: "4.1", delay: "0.8" },
    { x: 730, chars: ["キ","ク","サ","シ","ス"], dur: "3.7", delay: "0.2" },
    { x: 776, chars: ["タ","チ","ツ","ナ","ニ"], dur: "4.4", delay: "1.4" },
    { x: 822, chars: ["0","1","◈","⬡","◫"],     dur: "3.6", delay: "0.5" },
    { x: 868, chars: ["∆","Ω","Ψ","∞","√"],     dur: "4.8", delay: "1.9" },
  ];

  const matrixSVG = matrixCols.map(col => {
    const tspans = col.chars.map((c, i) =>
      `<tspan x="${col.x}" dy="${i === 0 ? 0 : 16}">${c}</tspan>`
    ).join("");
    return `<g opacity="0">
  <text font-family="monospace" font-size="11" fill="rgba(212,175,55,0.22)">${tspans}</text>
  <animateTransform attributeName="transform" type="translate"
    from="0,-20" to="0,290" dur="${col.dur}s" begin="${col.delay}s" repeatCount="indefinite" fill="remove"/>
  <animate attributeName="opacity"
    values="0;0.7;0.5;0" keyTimes="0;0.1;0.85;1"
    dur="${col.dur}s" begin="${col.delay}s" repeatCount="indefinite"/>
</g>`;
  }).join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="280" viewBox="0 0 900 280">
<defs>
  <style>
    @font-face {
      font-family: 'Orbitron';
      src: url('data:font/woff2;base64,${orbitronB64}') format('woff2');
      font-weight: 900;
    }
    @font-face {
      font-family: 'Rajdhani';
      src: url('data:font/woff2;base64,${rajdhaniB64}') format('woff2');
      font-weight: 600;
    }
  </style>

  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#d4af37"><animate attributeName="stop-color" values="#d4af37;#f4d03f;#ffffff;#f4d03f;#d4af37" dur="6s" repeatCount="indefinite"/></stop>
    <stop offset="40%"  stop-color="#f4d03f"><animate attributeName="stop-color" values="#f4d03f;#ffffff;#f4d03f;#d4af37;#f4d03f" dur="6s" repeatCount="indefinite"/></stop>
    <stop offset="50%"  stop-color="#ffffff"><animate attributeName="stop-color" values="#ffffff;#f4d03f;#d4af37;#f4d03f;#ffffff" dur="6s" repeatCount="indefinite"/></stop>
    <stop offset="60%"  stop-color="#f4d03f"><animate attributeName="stop-color" values="#f4d03f;#d4af37;#f4d03f;#ffffff;#f4d03f" dur="6s" repeatCount="indefinite"/></stop>
    <stop offset="100%" stop-color="#d4af37"><animate attributeName="stop-color" values="#d4af37;#d4af37;#f4d03f;#ffffff;#d4af37" dur="6s" repeatCount="indefinite"/></stop>
  </linearGradient>

  <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="#050400"/>
    <stop offset="50%"  stop-color="#0d0a00"/>
    <stop offset="100%" stop-color="#050400"/>
  </linearGradient>

  <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="rgba(255,215,0,0)"/>
    <stop offset="50%"  stop-color="#ffd700" stop-opacity="0.04"/>
    <stop offset="100%" stop-color="rgba(255,215,0,0)"/>
  </linearGradient>

  <radialGradient id="glowBlob" cx="50%" cy="65%" r="55%">
    <stop offset="0%"   stop-color="#d4af37" stop-opacity="0.10"/>
    <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
  </radialGradient>

  <clipPath id="clip">
    <rect width="900" height="280" rx="12"/>
  </clipPath>
</defs>

<g clip-path="url(#clip)">

  <rect width="900" height="280" fill="url(#bgGrad)"/>
  <ellipse cx="450" cy="280" rx="460" ry="200" fill="url(#glowBlob)"/>

  ${matrixSVG}

  <rect y="0" width="270" height="280" fill="url(#scanGrad)">
    <animateTransform attributeName="transform" type="translate"
      from="-270 0" to="1170 0" dur="8s" repeatCount="indefinite"/>
  </rect>

  <line x1="135" y1="1" x2="765" y2="1" stroke="rgba(212,175,55,0.5)" stroke-width="1"/>

  <polyline points="0,22 0,0 22,0"       fill="none" stroke="rgba(212,175,55,0.55)" stroke-width="1.5"/>
  <polyline points="878,0 900,0 900,22"  fill="none" stroke="rgba(212,175,55,0.55)" stroke-width="1.5"/>
  <polyline points="0,258 0,280 22,280"  fill="none" stroke="rgba(212,175,55,0.55)" stroke-width="1.5"/>
  <polyline points="878,280 900,280 900,258" fill="none" stroke="rgba(212,175,55,0.55)" stroke-width="1.5"/>

  <line x1="0"   y1="88"  x2="10"  y2="88"  stroke="rgba(212,175,55,0.28)" stroke-width="1"/>
  <line x1="0"   y1="140" x2="14"  y2="140" stroke="rgba(212,175,55,0.38)" stroke-width="1"/>
  <line x1="0"   y1="192" x2="10"  y2="192" stroke="rgba(212,175,55,0.28)" stroke-width="1"/>
  <line x1="900" y1="88"  x2="890" y2="88"  stroke="rgba(212,175,55,0.28)" stroke-width="1"/>
  <line x1="900" y1="140" x2="886" y2="140" stroke="rgba(212,175,55,0.38)" stroke-width="1"/>
  <line x1="900" y1="192" x2="890" y2="192" stroke="rgba(212,175,55,0.28)" stroke-width="1"/>

  <text x="450" y="44" text-anchor="middle"
    font-family="Orbitron, monospace" font-size="9" font-weight="900" letter-spacing="4"
    fill="rgba(212,175,55,0.32)">◈ CREATIVE PORTFOLIO · FRONTEND ENGINEER · CYBERSECURITY ◈</text>

  <text x="450" y="148" text-anchor="middle"
    font-family="Orbitron, monospace" font-size="80" font-weight="900" letter-spacing="6"
    fill="url(#goldGrad)">HAZY019</text>

  <line x1="420" y1="163" x2="480" y2="163"
    stroke="white" stroke-width="1.5" opacity="0.85"/>

  <text x="450" y="194" text-anchor="middle"
    font-family="Rajdhani, sans-serif" font-size="15" font-weight="600" letter-spacing="2.5"
    fill="rgba(212,175,55,0.52)">Kyrell Santillan  ·  Web Designer  ·  Developer  ·  Cybersecurity</text>

  <!-- ═══════════════════════════════════════════════════════════════
       TYPING ANIMATION — 100% SMIL, zero CSS animation properties.

       GitHub strips CSS @keyframes / animation: from SVG images.
       SMIL <animate> with calcMode="discrete" snaps opacity on/off
       at exact keyTimes. This renders correctly on ALL browsers and
       through GitHub's camo image proxy.

       12s cycle / 4 phrases:
         Phrase 1  :  0s  → 2.5s   keyTimes 0     → 0.208
         Phrase 2  :  3s  → 5.5s   keyTimes 0.25  → 0.458
         Phrase 3  :  6s  → 8.5s   keyTimes 0.50  → 0.708
         Phrase 4  :  9s  → 11.5s  keyTimes 0.75  → 0.958

       calcMode="discrete" rule:
         values[i] is held from keyTimes[i] to keyTimes[i+1].
         keyTimes must start at 0 and end at 1, count = count of values.
  ═══════════════════════════════════════════════════════════════ -->

  <!-- Phrase 1: visible 0s – 2.5s -->
  <text x="450" y="232" text-anchor="middle" opacity="1"
    font-family="Orbitron, monospace" font-size="13" font-weight="900" letter-spacing="3.5"
    fill="rgba(212,175,55,0.78)">◈ ASPIRING WEB DESIGNER
    <animate attributeName="opacity"
      values="1;0;0;0;0"
      keyTimes="0;0.208;0.25;0.75;1"
      dur="12s" calcMode="discrete" repeatCount="indefinite"/>
  </text>

  <!-- Phrase 2: visible 3s – 5.5s -->
  <text x="450" y="232" text-anchor="middle" opacity="0"
    font-family="Orbitron, monospace" font-size="13" font-weight="900" letter-spacing="3.5"
    fill="rgba(212,175,55,0.78)">⬡ FRONTEND ENGINEER  ·  NEXT.JS / REACT
    <animate attributeName="opacity"
      values="0;1;0;0;0"
      keyTimes="0;0.25;0.458;0.75;1"
      dur="12s" calcMode="discrete" repeatCount="indefinite"/>
  </text>

  <!-- Phrase 3: visible 6s – 8.5s -->
  <text x="450" y="232" text-anchor="middle" opacity="0"
    font-family="Orbitron, monospace" font-size="13" font-weight="900" letter-spacing="3.5"
    fill="rgba(212,175,55,0.78)">◫ CYBERSECURITY FUNDAMENTALS
    <animate attributeName="opacity"
      values="0;0;1;0;0"
      keyTimes="0;0.25;0.50;0.708;1"
      dur="12s" calcMode="discrete" repeatCount="indefinite"/>
  </text>

  <!-- Phrase 4: visible 9s – 11.5s -->
  <text x="450" y="232" text-anchor="middle" opacity="0"
    font-family="Orbitron, monospace" font-size="13" font-weight="900" letter-spacing="3.5"
    fill="rgba(212,175,55,0.78)">✦ OPEN FOR WORK  ·  PHT UTC+8
    <animate attributeName="opacity"
      values="0;0;0;1;0"
      keyTimes="0;0.25;0.50;0.75;1"
      dur="12s" calcMode="discrete" repeatCount="indefinite"/>
  </text>

  <!-- Cursor blink — SMIL -->
  <text x="646" y="232"
    font-family="Orbitron, monospace" font-size="14"
    fill="rgba(212,175,55,0.62)">|
    <animate attributeName="opacity"
      values="1;1;0;0"
      keyTimes="0;0.45;0.46;1"
      dur="0.9s" calcMode="discrete" repeatCount="indefinite"/>
  </text>

  <!-- LIVE badge — SMIL pulse on circle -->
  <g transform="translate(830, 20)">
    <circle cx="0" cy="0" r="3" fill="#d4af37">
      <animate attributeName="opacity"
        values="0.4;1;0.4" keyTimes="0;0.5;1"
        dur="2s" repeatCount="indefinite"/>
    </circle>
    <text x="8" y="4"
      font-family="Orbitron, monospace" font-size="9" font-weight="900" letter-spacing="3"
      fill="rgba(247,205,68,0.9)">LIVE</text>
  </g>

  <text x="16" y="268"
    font-family="Orbitron, monospace" font-size="8" font-weight="900" letter-spacing="2"
    fill="rgba(212,175,55,0.24)">HAZY.COSEDEVS.COM · PHT UTC+8</text>

  <text x="884" y="268" text-anchor="end"
    font-family="Orbitron, monospace" font-size="8" font-weight="900" letter-spacing="2"
    fill="rgba(74,222,128,0.42)">● OPEN FOR WORK</text>

  <line x1="0" y1="279" x2="900" y2="279"
    stroke="rgba(212,175,55,0.1)" stroke-width="0.8"/>

</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
