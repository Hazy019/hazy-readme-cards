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

  const fontFaces = `
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
  `;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="280" viewBox="0 0 900 280">
  <defs>
    <style>
      ${fontFaces}

      @keyframes goldFlow {
        0%   { stop-color: #d4af37; }
        25%  { stop-color: #f4d03f; }
        50%  { stop-color: #ffffff; }
        75%  { stop-color: #f4d03f; }
        100% { stop-color: #d4af37; }
      }
      @keyframes pulseDot {
        0%,100% { opacity: 0.4; }
        50%      { opacity: 1; }
      }
      @keyframes scanBar {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes type1 {
        0%,18%  { opacity: 1; }
        22%,100%{ opacity: 0; }
      }
      @keyframes type2 {
        0%,22%  { opacity: 0; }
        26%,43% { opacity: 1; }
        47%,100%{ opacity: 0; }
      }
      @keyframes type3 {
        0%,47%  { opacity: 0; }
        51%,68% { opacity: 1; }
        72%,100%{ opacity: 0; }
      }
      @keyframes type4 {
        0%,72%  { opacity: 0; }
        76%,95% { opacity: 1; }
        99%,100%{ opacity: 0; }
      }
      @keyframes cursorBlink {
        0%,49%  { opacity: 1; }
        50%,100%{ opacity: 0; }
      }
      @keyframes matrixFall {
        0%   { transform: translateY(-10px); opacity: 0; }
        10%  { opacity: 0.6; }
        90%  { opacity: 0.4; }
        100% { transform: translateY(280px); opacity: 0; }
      }
      @keyframes glowPulse {
        0%,100%{ filter: drop-shadow(0 0 8px rgba(212,175,55,0.4)); }
        50%    { filter: drop-shadow(0 0 24px rgba(212,175,55,0.85)); }
      }

      .name {
        font-family: 'Orbitron', monospace;
        font-weight: 900;
        font-size: 78px;
        letter-spacing: 0.1em;
        fill: url(#goldGrad);
        animation: glowPulse 4s ease-in-out infinite, fadeInUp 0.9s ease 0.2s both;
      }
      .sub {
        font-family: 'Rajdhani', sans-serif;
        font-size: 15px;
        letter-spacing: 0.18em;
        fill: rgba(212,175,55,0.55);
        animation: fadeInUp 0.9s ease 0.5s both;
      }
      .typer {
        font-family: 'Orbitron', monospace;
        font-size: 13px;
        letter-spacing: 0.28em;
        fill: rgba(212,175,55,0.75);
      }
      .badge-label {
        font-family: 'Orbitron', monospace;
        font-size: 9px;
        letter-spacing: 0.22em;
        fill: rgba(212,175,55,0.35);
      }
      .badge-val {
        font-family: 'Rajdhani', sans-serif;
        font-size: 13px;
        letter-spacing: 0.1em;
        fill: rgba(212,175,55,0.7);
      }

      .mc { font-family: monospace; font-size: 11px; }
    </style>

    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#d4af37">
        <animate attributeName="stop-color" values="#d4af37;#f4d03f;#ffffff;#f4d03f;#d4af37" dur="6s" repeatCount="indefinite"/>
      </stop>
      <stop offset="50%"  stop-color="#f4d03f">
        <animate attributeName="stop-color" values="#f4d03f;#ffffff;#f4d03f;#d4af37;#f4d03f" dur="6s" repeatCount="indefinite"/>
      </stop>
      <stop offset="100%" stop-color="#d4af37">
        <animate attributeName="stop-color" values="#ffffff;#f4d03f;#d4af37;#f4d03f;#ffffff" dur="6s" repeatCount="indefinite"/>
      </stop>
    </linearGradient>

    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#050400"/>
      <stop offset="50%"  stop-color="#0e0b00"/>
      <stop offset="100%" stop-color="#050400"/>
    </linearGradient>

    <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="rgba(255,215,0,0)" stop-opacity="0"/>
      <stop offset="50%"  stop-color="#ffd700"           stop-opacity="0.04"/>
      <stop offset="100%" stop-color="rgba(255,215,0,0)" stop-opacity="0"/>
    </linearGradient>

    <radialGradient id="glowBlob" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#d4af37" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
    </radialGradient>

    <clipPath id="svgClip">
      <rect width="900" height="280" rx="12"/>
    </clipPath>
  </defs>

  <g clip-path="url(#svgClip)">

    <!-- Background -->
    <rect width="900" height="280" fill="url(#bgGrad)"/>

    <!-- Scan lines texture -->
    <rect width="900" height="280" fill="none"
      style="background: repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)"/>

    <!-- Ambient glow blob -->
    <ellipse cx="450" cy="320" rx="480" ry="220" fill="url(#glowBlob)"/>

    <!-- Matrix rain columns -->
    ${[40,85,130,175,220,680,725,770,815,860].map((x, i) => {
      const chars = ['ア','イ','ウ','エ','カ','キ','ク','サ','シ','ス','0','1'];
      const col = chars.filter((_,j) => j % 2 === i % 2).slice(0, 6).join('&#10;');
      const dur = (3.5 + i * 0.7).toFixed(1);
      const delay = (i * 0.55).toFixed(1);
      return `<text class="mc" x="${x}" y="0" fill="rgba(212,175,55,0.18)" opacity="0"
        style="animation: matrixFall ${dur}s linear ${delay}s infinite">
        ${chars.slice(i % 4, i % 4 + 5).map((c,j) =>
          `<tspan x="${x}" dy="${j === 0 ? 10 : 16}">${c}</tspan>`
        ).join('')}
      </text>`;
    }).join('')}

    <!-- Scan bar animation -->
    <rect x="-270" y="0" width="270" height="280" fill="url(#scanGrad)">
      <animateTransform attributeName="transform" type="translate"
        from="-270 0" to="900 0" dur="8s" repeatCount="indefinite"/>
    </rect>

    <!-- Top gold hairline -->
    <line x1="135" y1="0" x2="765" y2="0" stroke="rgba(212,175,55,0.5)" stroke-width="1"/>

    <!-- Corner brackets - TL -->
    <polyline points="0,20 0,0 20,0" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/>
    <!-- Corner brackets - TR -->
    <polyline points="880,0 900,0 900,20" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/>
    <!-- Corner brackets - BL -->
    <polyline points="0,260 0,280 20,280" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/>
    <!-- Corner brackets - BR -->
    <polyline points="880,280 900,280 900,260" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/>

    <!-- HUD tick marks left -->
    <line x1="0" y1="90"  x2="8"  y2="90"  stroke="rgba(212,175,55,0.3)" stroke-width="1"/>
    <line x1="0" y1="140" x2="12" y2="140" stroke="rgba(212,175,55,0.4)" stroke-width="1"/>
    <line x1="0" y1="190" x2="8"  y2="190" stroke="rgba(212,175,55,0.3)" stroke-width="1"/>
    <!-- HUD tick marks right -->
    <line x1="900" y1="90"  x2="892" y2="90"  stroke="rgba(212,175,55,0.3)" stroke-width="1"/>
    <line x1="900" y1="140" x2="888" y2="140" stroke="rgba(212,175,55,0.4)" stroke-width="1"/>
    <line x1="900" y1="190" x2="892" y2="190" stroke="rgba(212,175,55,0.3)" stroke-width="1"/>

    <!-- Eyebrow label -->
    <text x="450" y="48" text-anchor="middle" class="badge-label">◈ CREATIVE PORTFOLIO · FRONTEND ENGINEER · CYBERSECURITY ◈</text>

    <!-- Main name -->
    <text x="450" y="148" text-anchor="middle" class="name">HAZY019</text>

    <!-- Gold rule -->
    <line x1="418" y1="162" x2="482" y2="162" stroke="white" stroke-width="1.5"
      style="filter: drop-shadow(0 0 6px rgba(255,255,255,0.8))"/>

    <!-- Subtitle -->
    <text x="450" y="192" text-anchor="middle" class="sub">
      Kyrell Santillan  ·  Web Designer  ·  Developer  ·  Cybersecurity
    </text>

    <!-- Typing animation rows (4 phrases cycling) -->
    <g transform="translate(450, 228)" text-anchor="middle">
      <text class="typer" style="animation: type1 12s ease-in-out 0s infinite">
        ◈ ASPIRING WEB DESIGNER
      </text>
      <text class="typer" style="animation: type2 12s ease-in-out 0s infinite">
        ⬡ FRONTEND ENGINEER  ·  NEXT.JS / REACT
      </text>
      <text class="typer" style="animation: type3 12s ease-in-out 0s infinite">
        ◫ CYBERSECURITY FUNDAMENTALS
      </text>
      <text class="typer" style="animation: type4 12s ease-in-out 0s infinite">
        ✦ OPEN FOR WORK  ·  PHT UTC+8
      </text>
      <!-- Cursor -->
      <text class="typer" x="130" style="animation: cursorBlink 0.8s step-end infinite">|</text>
    </g>

    <!-- LIVE badge -->
    <g transform="translate(820, 24)">
      <circle cx="0" cy="0" r="3" fill="#d4af37">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
      </circle>
      <text x="8" y="4" class="badge-label" style="fill:rgba(247,205,68,0.9)">LIVE</text>
    </g>

    <!-- Build label bottom left -->
    <text x="16" y="268" class="badge-label">HAZY.COSEDEVS.COM · PHT UTC+8</text>

    <!-- Status indicator bottom right -->
    <text x="884" y="268" text-anchor="end" class="badge-label" style="fill:rgba(74,222,128,0.5)">● OPEN FOR WORK</text>

    <!-- Bottom hairline -->
    <line x1="0" y1="279" x2="900" y2="279" stroke="rgba(212,175,55,0.08)" stroke-width="1"/>

  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
