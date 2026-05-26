export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#0d1117",
        text: "#e6edf3",
        muted: "#8b949e",
        dim: "#6e7681",
        border: "#30363d",
        sceneBg: "#06090e",
        deskShadow: "#0a0d13",
        linkBg: "#161b22",
        linkText: "#79c0ff",
        linkBorder: "#30363d",
        neonPink: "#ff0055",
        phosphorGreen: "#00ff66",
        cyberCyan: "#00e5ff"
      }
    : {
        bg: "#ffffff",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#8c959f",
        border: "#d0d7de",
        sceneBg: "#06090e", // Kept dark for contrast in scene
        deskShadow: "#0a0d13",
        linkBg: "#f6f8fa",
        linkText: "#0550ae",
        linkBorder: "#d0d7de",
        neonPink: "#ff0055",
        phosphorGreen: "#00ff66",
        cyberCyan: "#00e5ff"
      };

  const W = 900, H = 380;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>

<style>
  @keyframes crtFlicker {
    0%, 100% { opacity: 0.1; }
    30% { opacity: 0.15; }
    70% { opacity: 0.08; }
  }
  @keyframes neonPulse {
    0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 10px #ff0055); }
    50% { opacity: 1; filter: drop-shadow(0 0 20px #ff0055); }
  }
  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes ambientPulse {
    0%, 100% { opacity: 0.05; }
    50% { opacity: 0.15; }
  }
  
  .crt-glow { animation: crtFlicker 3s infinite; }
  .neon-x { animation: neonPulse 4s infinite; }
  .blink { animation: blink 1s infinite; }
  .zone-pulse { animation: ambientPulse 6s ease-in-out infinite; }
</style>

<g clip-path="url(#fc)">
  <!-- Main Structural Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ========================================== -->
  <!-- SECTION A: INFO & LINKS ROW (Top)          -->
  <!-- ========================================== -->
  <g transform="translate(0, 10)">
    <!-- Title and Dividers -->
    <line x1="24" y1="0" x2="${W - 24}" y2="0" stroke="${c.border}" stroke-width="0.5"/>
    <text x="24" y="20" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// connect · collaborate · build</text>
    <line x1="24" y1="28" x2="${W - 24}" y2="28" stroke="${c.border}" stroke-width="0.5"/>

    <!-- Live Anchor Text Links -->
    <g transform="translate(24, 40)">
      <!-- GitHub -->
      <rect x="0" y="0" width="130" height="22" rx="11" fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
      <text x="65" y="14.5" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="9" font-weight="700" fill="${c.linkText}">GitHub · Hazy019</text>
      
      <!-- LinkedIn -->
      <rect x="138" y="0" width="190" height="22" rx="11" fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
      <text x="233" y="14.5" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="9" font-weight="700" fill="${c.linkText}">LinkedIn · kyrell-santillan</text>
      
      <!-- Discord -->
      <rect x="336" y="0" width="135" height="22" rx="11" fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
      <text x="403.5" y="14.5" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="9" font-weight="700" fill="${c.linkText}">Discord · Hazy019</text>
      
      <!-- Site -->
      <rect x="479" y="0" width="165" height="22" rx="11" fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
      <text x="561.5" y="14.5" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="9" font-weight="700" fill="${c.linkText}">Site · hazy.cosedevs.com</text>
    </g>

    <!-- Final Branding & Timestamp -->
    <g transform="translate(${W - 190}, 42) scale(0.12)" class="neon-x">
      <path d="M 0,20 L 20,0 L 50,30 L 80,0 L 100,20 L 70,50 L 100,80 L 80,100 L 50,70 L 20,100 L 0,80 L 30,50 Z" fill="${c.neonPink}"/>
    </g>
    <text x="${W - 170}" y="54" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="bold" fill="${c.text}">Kyrell Santillan</text>

    <!-- OFW Indicator -->
    <circle cx="${W - 80}" cy="50" r="4" fill="${c.phosphorGreen}"/>
    <circle cx="${W - 80}" cy="50" r="4" fill="${c.phosphorGreen}" filter="drop-shadow(0 0 4px ${c.phosphorGreen})" opacity="0.8"/>
    <text x="${W - 70}" y="54" font-family="Consolas, 'Courier New', monospace" font-size="9" font-weight="bold" fill="${c.phosphorGreen}">OFW</text>

    <!-- Timestamp -->
    <text x="${W - 24}" y="54" text-anchor="end" font-family="Consolas, 'Courier New', monospace" font-size="9" fill="${c.muted}">1:45 PM</text>
  </g>

  <!-- ========================================== -->
  <!-- SECTION B: MASSIVE PIXEL ART DESK SCENE    -->
  <!-- ========================================== -->
  <g id="pixel-art-scene" transform="translate(0, 100)">
    <!-- Dark Cyber-Noir Room Wall -->
    <rect x="0" y="0" width="${W}" height="280" fill="${c.sceneBg}"/>
    
    <!-- Neon Pink 'X' Logo on Wall -->
    <g transform="translate(420, 20) scale(0.7)" class="neon-x">
      <path d="M 0,20 L 20,0 L 50,30 L 80,0 L 100,20 L 70,50 L 100,80 L 80,100 L 50,70 L 20,100 L 0,80 L 30,50 Z" fill="${c.neonPink}"/>
    </g>

    <!-- Room Ambient Glow -->
    <ellipse cx="450" cy="120" rx="200" ry="100" fill="${c.neonPink}" opacity="0.05"/>

    <!-- The Desk -->
    <rect x="0" y="220" width="${W}" height="60" fill="${c.deskShadow}"/>
    <rect x="0" y="220" width="${W}" height="6" fill="#161b22"/>

    <!-- Multi-legged Squid Entity (Right side) -->
    <g transform="translate(750, 110)">
      <!-- Head/Mantle -->
      <path d="M25,0 Q45,30 40,70 L10,70 Q5,30 25,0 Z" fill="#b081b8"/>
      <!-- Mask/Eye Band -->
      <path d="M5,70 L45,70 L45,85 L5,85 Z" fill="#1b1f27"/>
      <!-- Eyes -->
      <circle cx="17" cy="77" r="4" fill="#ffffff"/>
      <circle cx="33" cy="77" r="4" fill="#ffffff"/>
      <circle cx="17" cy="77" r="1.5" fill="#010409"/>
      <circle cx="33" cy="77" r="1.5" fill="#010409"/>
      <!-- Tentacles -->
      <path d="M10,85 Q-5,125 10,145" fill="none" stroke="#b081b8" stroke-width="7" stroke-linecap="round"/>
      <path d="M20,85 Q15,120 25,140" fill="none" stroke="#b081b8" stroke-width="7" stroke-linecap="round"/>
      <path d="M30,85 Q35,120 25,145" fill="none" stroke="#b081b8" stroke-width="7" stroke-linecap="round"/>
      <path d="M40,85 Q55,125 40,140" fill="none" stroke="#b081b8" stroke-width="7" stroke-linecap="round"/>
    </g>

    <!-- Small Desktop Robot (Next to squid) -->
    <g transform="translate(680, 175)">
      <rect x="5" y="0" width="16" height="12" rx="2" fill="#8c959f"/>
      <rect x="8" y="3" width="10" height="4" fill="#010409"/>
      <circle cx="10" cy="5" r="1" fill="#ff5f57" class="blink"/>
      <circle cx="16" cy="5" r="1" fill="#ff5f57" class="blink"/>
      <rect x="7" y="12" width="12" height="14" rx="2" fill="#57606a"/>
      <path d="M7,26 L19,26 L16,35 L10,35 Z" fill="#30363d"/>
    </g>

    <!-- Left Stacked Monitors -->
    <g transform="translate(180, 50)">
      <!-- Top Monitor -->
      <rect x="0" y="0" width="80" height="70" rx="4" fill="#1b222c"/>
      <rect x="5" y="5" width="70" height="60" rx="2" fill="#020804"/>
      <rect x="5" y="5" width="70" height="60" fill="${c.phosphorGreen}" class="crt-glow"/>
      <rect x="10" y="15" width="20" height="2" fill="${c.phosphorGreen}"/>
      <rect x="10" y="20" width="30" height="2" fill="${c.phosphorGreen}"/>
      
      <!-- Bottom Monitor -->
      <rect x="-10" y="75" width="90" height="80" rx="4" fill="#161b22"/>
      <rect x="-5" y="80" width="80" height="70" rx="2" fill="#020804"/>
      <rect x="-5" y="80" width="80" height="70" fill="${c.phosphorGreen}" class="crt-glow"/>
      <rect x="0" y="90" width="40" height="2" fill="${c.phosphorGreen}"/>
      <rect x="0" y="95" width="30" height="2" fill="${c.phosphorGreen}"/>
      <rect x="0" y="100" width="50" height="2" fill="${c.phosphorGreen}"/>
      <rect x="0" y="105" width="20" height="2" fill="${c.phosphorGreen}"/>
    </g>

    <!-- Main Center Monitor (Dashboard UI) -->
    <g transform="translate(290, 80)">
      <rect x="80" y="120" width="30" height="20" fill="#161b22"/> <!-- Stand -->
      <rect x="40" y="140" width="110" height="5" fill="#21262d"/>
      <rect x="0" y="0" width="190" height="125" rx="6" fill="#1b222c"/>
      <rect x="6" y="6" width="178" height="113" rx="2" fill="#020804"/>
      <rect x="6" y="6" width="178" height="113" fill="${c.phosphorGreen}" class="crt-glow"/>
      
      <!-- Screen Content (Kyrell) -->
      <text x="16" y="26" font-family="Consolas, 'Courier New', monospace" font-size="14" font-weight="bold" fill="#ffffff">Kyrell</text>
      <!-- Code lines mock -->
      <rect x="16" y="40" width="120" height="2" fill="${c.phosphorGreen}" opacity="0.8"/>
      <rect x="16" y="46" width="100" height="2" fill="${c.phosphorGreen}" opacity="0.6"/>
      <!-- Status bars -->
      <rect x="16" y="60" width="140" height="4" fill="#161b22"/>
      <rect x="16" y="60" width="100" height="4" fill="${c.phosphorGreen}"/>
      <rect x="16" y="68" width="140" height="4" fill="#161b22"/>
      <rect x="16" y="68" width="80" height="4" fill="${c.phosphorGreen}"/>
      <rect x="16" y="76" width="140" height="4" fill="#161b22"/>
      <rect x="16" y="76" width="110" height="4" fill="${c.phosphorGreen}"/>
      <!-- Terminal prompt -->
      <text x="16" y="105" font-family="Consolas, 'Courier New', monospace" font-size="8" fill="${c.phosphorGreen}">> connect · collaborate · build <tspan class="blink">█</tspan></text>
    </g>

    <!-- Right Monitor (MARIO) -->
    <g transform="translate(500, 110)">
      <rect x="40" y="90" width="20" height="15" fill="#161b22"/> <!-- Stand -->
      <rect x="0" y="0" width="100" height="95" rx="4" fill="#161b22"/>
      <rect x="5" y="5" width="90" height="85" rx="2" fill="#020804"/>
      <rect x="5" y="5" width="90" height="85" fill="${c.phosphorGreen}" class="crt-glow"/>
      <text x="50" y="45" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="14" font-weight="bold" fill="#ffffff">Kyrell</text>
      <text x="50" y="65" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="11" font-weight="bold" fill="#ffffff">MARIO</text>
    </g>

    <!-- The Developer Character (Center Right) -->
    <g id="programmer" transform="translate(550, 130)">
      <!-- Chair Back -->
      <rect x="60" y="70" width="40" height="90" rx="10" fill="#0d1117"/>
      <!-- Body / Shirt -->
      <path d="M15,150 Q10,60 50,60 Q75,60 85,150 Z" fill="#1c2536"/>
      <!-- Head / Hair -->
      <path d="M25,20 Q20,-5 40,5 Q45,-15 60,-5 Q75,-10 75,10 Q85,15 75,30 Q80,50 65,60 Q40,65 30,50 Z" fill="#523223"/>
      <!-- Face profile -->
      <path d="M25,30 L20,35 L22,40 L18,45 L22,55 Q35,65 50,60 Z" fill="#d4a373"/>
      <!-- Eye -->
      <rect x="28" y="32" width="4" height="4" fill="#ffffff"/>
      <rect x="28" y="33" width="2" height="2" fill="#000000"/>
      <!-- Arm extending to keyboard -->
      <path d="M45,75 Q20,110 -40,95" fill="none" stroke="#d4a373" stroke-width="14" stroke-linecap="round"/>
      <path d="M45,75 Q20,110 -40,95" fill="none" stroke="#1c2536" stroke-width="16" stroke-dasharray="80 100" stroke-linecap="round"/>
    </g>
    
    <!-- Keyboard -->
    <rect x="420" y="222" width="90" height="6" rx="2" fill="#21262d" transform="rotate(-5 420 222)"/>

    <!-- Entire Zone Subtle Ambient Pulse -->
    <rect x="0" y="0" width="${W}" height="280" fill="${c.neonPink}" class="zone-pulse" style="pointer-events: none; mix-blend-mode: screen;"/>
  </g>

</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
