export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#0d1117",
        bar: "#0d131f",
        text: "#e6edf3",
        muted: "#8b949e",
        dim: "#6e7681",
        border: "#30363d",
        accent: "#39d353",
        sceneBg: "#06090e",
        neonPink: "#ff0055",
        phosphorGreen: "#00ff66",
        cityGlow: "#0f4c81"
      }
    : {
        bg: "#ffffff",
        bar: "#f6f8fa",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#8c959f",
        border: "#d0d7de",
        accent: "#1a7f37",
        sceneBg: "#06090e", // Scene stays dark for contrast
        neonPink: "#ff0055",
        phosphorGreen: "#00ff66",
        cityGlow: "#0f4c81"
      };

  const W = 900, H = 340;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>

<style>
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes neonPulse {
    0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 8px #ff0055); }
    50% { opacity: 1; filter: drop-shadow(0 0 15px #ff0055); }
  }
  @keyframes crtFlicker {
    0%, 100% { opacity: 0.15; }
    30% { opacity: 0.1; }
    70% { opacity: 0.2; }
  }
  @keyframes floatDust {
    0% { transform: translateY(0px); opacity: 0; }
    20% { opacity: 0.6; }
    80% { opacity: 0.6; }
    100% { transform: translateY(-40px); opacity: 0; }
  }
  
  .blink { animation: blink 1s infinite; }
  .neon { animation: neonPulse 3s infinite; }
  .crt-glow { animation: crtFlicker 4s infinite; }
  .dust1 { animation: floatDust 8s linear infinite; }
  .dust2 { animation: floatDust 12s linear infinite 4s; }
  .dust3 { animation: floatDust 10s linear infinite 2s; }
</style>

<g clip-path="url(#hc)">
  <!-- Main Structural Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="32" fill="${c.bar}"/>
  <rect y="32" width="${W}" height="1" fill="${c.border}"/>

  <!-- macOS-style window controls -->
  <circle cx="20" cy="16" r="5" fill="#ff5f57"/>
  <circle cx="36" cy="16" r="5" fill="#febc2e"/>
  <circle cx="52" cy="16" r="5" fill="#28c840"/>

  <text x="${W/2}" y="20" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.dim}">~/kyrell-santillan - ssh</text>

  <!-- ========================================== -->
  <!-- SECTION 1: STRICT TEXT STRUCTURE (Top)     -->
  <!-- ========================================== -->
  <text x="40" y="70" font-family="Consolas, 'Courier New', monospace" font-size="24" font-weight="bold" fill="${c.text}">Kyrell Santillan</text>
  <text x="40" y="94" font-family="Consolas, 'Courier New', monospace" font-size="13" fill="${c.accent}">Web Designer · Frontend Engineer · UI Architect</text>
  
  <!-- ABOUT SECTION -->
  <text x="40" y="125" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">I engineer immersive web experiences blending striking aesthetics with performance.</text>
  <text x="40" y="142" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">Currently exploring interactive SVGs and edge computing architectures.</text>

  <!-- ========================================== -->
  <!-- SECTION 2: PIXEL ART SCENE (Bottom)        -->
  <!-- ========================================== -->
  <g transform="translate(0, 160)">
    <!-- Room Background -->
    <rect x="0" y="0" width="${W}" height="180" fill="${c.sceneBg}"/>
    
    <!-- Cyber-Noir City Window -->
    <rect x="450" y="10" width="400" height="150" fill="#03060a" stroke="#161b22" stroke-width="4"/>
    <!-- City Buildings -->
    <rect x="470" y="80" width="40" height="80" fill="#080c14"/>
    <rect x="520" y="40" width="60" height="120" fill="#0a101a"/>
    <rect x="590" y="90" width="50" height="70" fill="#080c14"/>
    <rect x="660" y="30" width="80" height="130" fill="#0a101a"/>
    <rect x="760" y="60" width="70" height="100" fill="#080c14"/>
    <!-- City Lights -->
    <rect x="530" y="50" width="4" height="4" fill="${c.cityGlow}" opacity="0.6"/>
    <rect x="530" y="60" width="4" height="4" fill="${c.cityGlow}" opacity="0.6"/>
    <rect x="545" y="75" width="4" height="4" fill="${c.neonPink}" opacity="0.4"/>
    <rect x="680" y="40" width="4" height="4" fill="${c.phosphorGreen}" opacity="0.5"/>
    <rect x="695" y="80" width="4" height="4" fill="${c.cityGlow}" opacity="0.6"/>
    <!-- Window Rain lines -->
    <line x1="480" y1="20" x2="475" y2="40" stroke="#1b2533" stroke-width="1"/>
    <line x1="560" y1="30" x2="550" y2="70" stroke="#1b2533" stroke-width="1"/>
    <line x1="720" y1="10" x2="710" y2="50" stroke="#1b2533" stroke-width="1"/>
    <line x1="810" y1="40" x2="800" y2="90" stroke="#1b2533" stroke-width="1"/>

    <!-- Ambient Room Glow from Window -->
    <rect x="0" y="0" width="${W}" height="180" fill="url(#windowGlow)" opacity="0.2"/>
    <defs>
      <linearGradient id="windowGlow" x1="1" y1="0" x2="0" y2="0">
        <stop offset="0%" stop-color="#0f4c81"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <!-- Pulsing Neon-Pink Cross Logo -->
    <g transform="translate(140, 35) scale(0.6)" class="neon">
      <path d="M 0,20 L 20,0 L 50,30 L 80,0 L 100,20 L 70,50 L 100,80 L 80,100 L 50,70 L 20,100 L 0,80 L 30,50 Z" fill="${c.neonPink}"/>
    </g>

    <!-- Desk Surface -->
    <rect x="40" y="150" width="820" height="30" fill="#0a0d13"/>
    <rect x="40" y="150" width="820" height="4" fill="#161b22"/>

    <!-- Green Phosphor CRT Monitor -->
    <g transform="translate(260, 45)">
      <!-- Stand -->
      <rect x="60" y="85" width="20" height="20" fill="#161b22"/>
      <rect x="30" y="102" width="80" height="5" fill="#21262d"/>
      <!-- Bezel -->
      <rect x="0" y="0" width="140" height="90" rx="6" fill="#1b222c"/>
      <!-- Screen -->
      <rect x="6" y="6" width="128" height="78" rx="2" fill="#020804"/>
      <!-- Screen Glow Overlay -->
      <rect x="6" y="6" width="128" height="78" fill="${c.phosphorGreen}" class="crt-glow"/>
      
      <!-- Screen Content (Open for Work & Cursor) -->
      <circle cx="20" cy="20" r="4" fill="${c.phosphorGreen}"/>
      <circle cx="20" cy="20" r="4" fill="${c.phosphorGreen}" class="neon" opacity="0.6"/>
      <text x="32" y="24" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="bold" fill="${c.phosphorGreen}">OPEN FOR WORK</text>
      
      <text x="14" y="44" font-family="Consolas, 'Courier New', monospace" font-size="9" fill="${c.phosphorGreen}">> init system</text>
      <text x="14" y="58" font-family="Consolas, 'Courier New', monospace" font-size="9" fill="${c.phosphorGreen}">> loading... <tspan class="blink">█</tspan></text>
      <!-- Scanlines -->
      <line x1="6" y1="18" x2="134" y2="18" stroke="#00ff66" stroke-width="1" opacity="0.1"/>
      <line x1="6" y1="38" x2="134" y2="38" stroke="#00ff66" stroke-width="1" opacity="0.1"/>
      <line x1="6" y1="58" x2="134" y2="58" stroke="#00ff66" stroke-width="1" opacity="0.1"/>
    </g>

    <!-- Floating Dust Motes -->
    <circle cx="200" cy="140" r="1.5" fill="#8c959f" class="dust1"/>
    <circle cx="350" cy="120" r="2" fill="#8c959f" class="dust2"/>
    <circle cx="100" cy="130" r="1" fill="#8c959f" class="dust3"/>
  </g>

  <!-- Bottom Border -->
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
