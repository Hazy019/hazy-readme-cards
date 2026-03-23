export const config = { runtime: "edge" };

export default async function handler() {
  let orbitronB64 = "";

  try {
    const oRes = await fetch("https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBoWgz.woff2");
    const oArr = await oRes.arrayBuffer();
    orbitronB64 = btoa(String.fromCharCode(...new Uint8Array(oArr)));
  } catch {
    orbitronB64 = "";
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="80" viewBox="0 0 900 80">
<defs>
  <style>
    @font-face {
      font-family: 'Orbitron';
      src: url('data:font/woff2;base64,${orbitronB64}') format('woff2');
      font-weight: 900;
    }
    @keyframes goldFlow {
      0%,100%{ stop-color:#d4af37; } 50%{ stop-color:#f4d03f; }
    }
  </style>
  <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#d4af37"/>
    <stop offset="50%"  stop-color="#f4d03f"/>
    <stop offset="100%" stop-color="#d4af37"/>
  </linearGradient>
  <linearGradient id="waveBg" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%"   stop-color="#050400"/>
    <stop offset="100%" stop-color="#0e0b00"/>
  </linearGradient>
  <clipPath id="fc"><rect width="900" height="80" rx="0 0 12 12"/></clipPath>
</defs>
<g clip-path="url(#fc)">
  <rect width="900" height="80" fill="url(#waveBg)"/>
  <line x1="0" y1="0" x2="900" y2="0" stroke="rgba(212,175,55,0.15)" stroke-width="0.8"/>

  <!-- Labels -->
  <text x="450" y="34" text-anchor="middle"
    style="font-family:'Orbitron',monospace;font-size:11px;fill:rgba(212,175,55,0.35);letter-spacing:.35em">
    CONNECT · COLLABORATE · BUILD
  </text>
  <text x="450" y="58" text-anchor="middle"
    style="font-family:'Orbitron',monospace;font-size:9px;fill:rgba(212,175,55,0.2);letter-spacing:.28em">
    LINKEDIN  ·  GITHUB  ·  DISCORD  ·  HAZY.COSEDEVS.COM
  </text>

  <!-- Profile views label -->
  <text x="16" y="72"
    style="font-family:'Orbitron',monospace;font-size:7px;fill:rgba(212,175,55,0.18);letter-spacing:.2em">
    © HAZY019 · KYRELL SANTILLAN
  </text>
  <text x="884" y="72" text-anchor="end"
    style="font-family:'Orbitron',monospace;font-size:7px;fill:rgba(74,222,128,0.35);letter-spacing:.15em">
    ● OPEN FOR WORK
  </text>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
