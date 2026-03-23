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

  const skills = [
    { label: "Python",      icon: "🐍", pct: 72 },
    { label: "CSS / Tailwind", icon: "🎨", pct: 88 },
    { label: "JavaScript",  icon: "⚡", pct: 68 },
    { label: "React",       icon: "⚛",  pct: 75 },
    { label: "Next.js",     icon: "▲",  pct: 70 },
    { label: "Flask",       icon: "🔬", pct: 58 },
    { label: "PostgreSQL",  icon: "🗄",  pct: 52 },
    { label: "Figma / UI",  icon: "✦",  pct: 80 },
    { label: "CyberSec",    icon: "🛡",  pct: 45 },
  ];

  const BAR_W = 500;
  const ROW_H = 28;
  const START_Y = 80;

  const bars = skills.map((s, i) => {
    const y = START_Y + i * ROW_H;
    const bw = Math.round((s.pct / 100) * BAR_W);
    const delay = (i * 0.08).toFixed(2);
    return `
  <g transform="translate(180, ${y})">
    <text x="-8" y="14" text-anchor="end" style="font-family:'Rajdhani',sans-serif;font-size:13px;fill:rgba(212,175,55,0.7);letter-spacing:.06em">${s.label}</text>
    <rect x="0" y="6" width="${BAR_W}" height="6" rx="3" fill="rgba(212,175,55,0.08)" stroke="rgba(212,175,55,0.15)" stroke-width="0.5"/>
    <rect x="0" y="6" width="0" height="6" rx="3" fill="url(#barGrad)">
      <animate attributeName="width" from="0" to="${bw}" dur="1.2s" begin="${delay}s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1"/>
    </rect>
    <text x="${BAR_W + 10}" y="14" style="font-family:'Orbitron',monospace;font-size:9px;font-weight:900;fill:rgba(212,175,55,0.45)">${s.pct}%</text>
  </g>`;
  }).join("");

  const tags = ["Python","HTML","CSS","JavaScript","React","Next.js","Tailwind","Flask","PostgreSQL","PyQt6","Figma","Git","CyberSec"];
  const tagEls = tags.map((t, i) => {
    const col = i % 7;
    const row = Math.floor(i / 7);
    const x = 20 + col * 124;
    const y = START_Y + skills.length * ROW_H + 52 + row * 30;
    return `
  <g transform="translate(${x}, ${y})">
    <rect width="116" height="22" rx="3" fill="rgba(212,175,55,0.06)" stroke="rgba(212,175,55,0.22)" stroke-width="0.8"/>
    <text x="58" y="15" text-anchor="middle" style="font-family:'Orbitron',monospace;font-size:8px;fill:rgba(212,175,55,0.75);letter-spacing:.1em">${t}</text>
  </g>`;
  }).join("");

  const H = START_Y + skills.length * ROW_H + 52 + Math.ceil(tags.length / 7) * 30 + 40;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="${H}" viewBox="0 0 900 ${H}">
<defs>
  <style>${fontFaces}
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  </style>
  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#d4af37"/>
    <stop offset="60%"  stop-color="#f4d03f"/>
    <stop offset="100%" stop-color="#d4af37"/>
  </linearGradient>
  <clipPath id="c2"><rect width="900" height="${H}" rx="12"/></clipPath>
</defs>
<g clip-path="url(#c2)">
  <rect width="900" height="${H}" fill="#050400"/>
  <rect width="900" height="${H}" fill="rgba(212,175,55,0.01)"/>

  <!-- Top hairline -->
  <line x1="135" y1="0" x2="765" y2="0" stroke="rgba(212,175,55,0.4)" stroke-width="1"/>

  <!-- Corner brackets -->
  <polyline points="0,16 0,0 16,0"    fill="none" stroke="rgba(212,175,55,0.4)" stroke-width="1.5"/>
  <polyline points="884,0 900,0 900,16" fill="none" stroke="rgba(212,175,55,0.4)" stroke-width="1.5"/>
  <polyline points="0,${H-16} 0,${H} 16,${H}" fill="none" stroke="rgba(212,175,55,0.4)" stroke-width="1.5"/>
  <polyline points="884,${H} 900,${H} 900,${H-16}" fill="none" stroke="rgba(212,175,55,0.4)" stroke-width="1.5"/>

  <!-- Section header -->
  <text x="20" y="44" style="font-family:'Orbitron',monospace;font-weight:900;font-size:16px;fill:url(#barGrad);letter-spacing:.2em">SKILLS &amp; STACK</text>
  <line x1="20" y1="52" x2="80" y2="52" stroke="white" stroke-width="1" style="filter:drop-shadow(0 0 4px rgba(255,255,255,0.7))"/>

  ${bars}

  <!-- Tech tags section header -->
  <text x="20" y="${START_Y + skills.length * ROW_H + 36}" style="font-family:'Orbitron',monospace;font-size:9px;fill:rgba(212,175,55,0.3);letter-spacing:.3em">TECHNOLOGIES</text>

  ${tagEls}
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
