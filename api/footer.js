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
        accent: "#39d353",
        sceneBg: "#010409",
        monitorBlue: "#58a6ff",
        monitorGreen: "#39d353",
        linkBg: "#161b22",
        linkText: "#79c0ff",
        linkBorder: "#30363d",
      }
    : {
        bg: "#ffffff",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#8c959f",
        border: "#d0d7de",
        accent: "#1a7f37",
        sceneBg: "#f6f8fa",
        monitorBlue: "#0550ae",
        monitorGreen: "#1a7f37",
        linkBg: "#f6f8fa",
        linkText: "#0550ae",
        linkBorder: "#d0d7de",
      };

  const W = 900, H = 280;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>

<style>
  /* Native CSS animations (Safe for GitHub READMEs) */
  @keyframes flickerBlue {
    0%, 100% { opacity: 0.15; }
    30% { opacity: 0.1; }
    50% { opacity: 0.2; }
    70% { opacity: 0.12; }
  }
  @keyframes flickerGreen {
    0%, 100% { opacity: 0.1; }
    40% { opacity: 0.15; }
    80% { opacity: 0.08; }
  }
  @keyframes blinkCursor {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0; }
  }
  @keyframes tailWag {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(10deg); }
  }
  @keyframes ambientLight {
    0%, 100% { opacity: 0.03; }
    50% { opacity: 0.06; }
  }
  
  .blue-glow { animation: flickerBlue 3s infinite; }
  .green-glow { animation: flickerGreen 4s infinite; }
  .blink { animation: blinkCursor 1s infinite; }
  .tail { animation: tailWag 4s ease-in-out infinite; transform-origin: 255px 155px; }
  .ambient { animation: ambientLight 5s ease-in-out infinite; }
</style>

<g clip-path="url(#fc)">
  <!-- Main Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ========================================== -->
  <!-- SECTION A: ANIMATED PIXEL ART PANEL (Top)  -->
  <!-- ========================================== -->
  <g id="pixel-art-scene">
    <!-- Dark room background for the scene -->
    <rect x="0" y="0" width="${W}" height="190" fill="${dark ? c.sceneBg : "#eaecef"}"/>
    
    <!-- Ambient room glow from monitors -->
    <ellipse cx="380" cy="110" rx="150" ry="80" fill="${c.monitorBlue}" class="ambient"/>

    <!-- Desk Surface -->
    <rect x="150" y="160" width="600" height="8" fill="${dark ? "#161b22" : "#d0d7de"}"/>
    <rect x="150" y="168" width="600" height="22" fill="${dark ? "#0d1117" : "#afb8c1"}"/>

    <!-- Secondary Monitor (Green, Vertical) -->
    <g id="secondary-monitor" transform="translate(280, 50)">
      <!-- Stand -->
      <rect x="25" y="100" width="10" height="15" fill="${dark ? "#21262d" : "#8c959f"}"/>
      <!-- Bezel -->
      <rect x="0" y="0" width="60" height="100" rx="4" fill="${dark ? "#21262d" : "#57606a"}"/>
      <rect x="5" y="5" width="50" height="90" rx="2" fill="${dark ? "#010409" : "#24292f"}"/>
      <!-- Screen Glow Overlay -->
      <rect x="5" y="5" width="50" height="90" fill="${c.monitorGreen}" class="green-glow"/>
      <!-- Phosphor Text Lines -->
      <rect x="10" y="10" width="30" height="2" fill="${c.monitorGreen}"/>
      <rect x="10" y="16" width="40" height="2" fill="${c.monitorGreen}"/>
      <rect x="10" y="22" width="25" height="2" fill="${c.monitorGreen}"/>
      <rect x="10" y="28" width="35" height="2" fill="${c.monitorGreen}"/>
      <rect x="10" y="34" width="20" height="2" fill="${c.monitorGreen}"/>
      <rect x="10" y="46" width="40" height="2" fill="${c.monitorGreen}" opacity="0.6"/>
      <rect x="10" y="52" width="30" height="2" fill="${c.monitorGreen}" opacity="0.6"/>
    </g>

    <!-- Main CRT Monitor (Blue, Landscape) -->
    <g id="main-monitor" transform="translate(360, 70)">
      <!-- Stand -->
      <rect x="45" y="80" width="30" height="15" fill="${dark ? "#21262d" : "#8c959f"}"/>
      <!-- Bezel -->
      <rect x="0" y="0" width="120" height="85" rx="6" fill="${dark ? "#30363d" : "#6e7681"}"/>
      <rect x="6" y="6" width="108" height="65" rx="3" fill="${dark ? "#010409" : "#1b1f24"}"/>
      <!-- Screen Glow Overlay -->
      <rect x="6" y="6" width="108" height="65" fill="${c.monitorBlue}" class="blue-glow"/>
      <!-- Terminal UI Mockup -->
      <rect x="12" y="12" width="4" height="4" fill="#ff5f57" rx="2"/>
      <rect x="20" y="12" width="4" height="4" fill="#febc2e" rx="2"/>
      <rect x="28" y="12" width="4" height="4" fill="#28c840" rx="2"/>
      <!-- Terminal Code Lines -->
      <rect x="12" y="25" width="80" height="3" fill="${c.monitorBlue}"/>
      <rect x="12" y="33" width="60" height="3" fill="${c.monitorBlue}" opacity="0.8"/>
      <rect x="20" y="41" width="50" height="3" fill="${c.monitorBlue}" opacity="0.6"/>
      <rect x="12" y="49" width="30" height="3" fill="${c.monitorBlue}"/>
      <!-- Blinking Cursor -->
      <rect x="46" y="48" width="5" height="5" fill="${c.monitorBlue}" class="blink"/>
    </g>

    <!-- Stylized Creature (Cat/Robot) on the Desk -->
    <g id="desktop-creature" transform="translate(240, 140)">
      <!-- Tail -->
      <path d="M5,15 Q-5,10 0,0" fill="none" stroke="${dark ? "#30363d" : "#8c959f"}" stroke-width="3" stroke-linecap="round" class="tail"/>
      <!-- Body -->
      <rect x="5" y="8" width="18" height="12" rx="4" fill="${dark ? "#21262d" : "#6e7681"}"/>
      <!-- Head -->
      <circle cx="24" cy="8" r="7" fill="${dark ? "#30363d" : "#57606a"}"/>
      <!-- Ears -->
      <polygon points="19,4 21,-2 25,2" fill="${dark ? "#30363d" : "#57606a"}"/>
      <polygon points="23,2 27,-2 29,4" fill="${dark ? "#30363d" : "#57606a"}"/>
      <!-- Eyes (Glowing slightly blue from monitor) -->
      <rect x="24" y="6" width="2" height="2" fill="${c.monitorBlue}" opacity="0.8"/>
    </g>

    <!-- The Programmer / Character Silhouette -->
    <g id="programmer" transform="translate(510, 80)">
      <!-- Shoulders & Back (Hoodie) -->
      <path d="M20,110 Q10,40 40,40 Q70,40 70,110 Z" fill="${dark ? "#161b22" : "#57606a"}"/>
      <!-- Head / Hood -->
      <rect x="28" y="10" width="34" height="40" rx="16" fill="${dark ? "#0d1117" : "#424a53"}"/>
      <!-- Arm reaching to keyboard -->
      <path d="M30,55 Q5,80 -30,85" fill="none" stroke="${dark ? "#161b22" : "#57606a"}" stroke-width="12" stroke-linecap="round"/>
    </g>
    
    <!-- Keyboard & Mouse -->
    <rect x="420" y="156" width="40" height="3" rx="1" fill="${dark ? "#21262d" : "#8c959f"}"/>
    <rect x="468" y="157" width="8" height="2" rx="1" fill="${dark ? "#30363d" : "#6e7681"}"/>
  </g>

  <!-- ========================================== -->
  <!-- SECTION B: INFO & LINKS ROW (Bottom)       -->
  <!-- ========================================== -->
  
  <!-- Divider Lines & Section Title -->
  <line x1="24" y1="205" x2="${W - 24}" y2="205" stroke="${c.border}" stroke-width="0.5"/>
  <text x="24" y="225" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// connect · collaborate · build</text>
  <line x1="24" y1="233" x2="${W - 24}" y2="233" stroke="${c.border}" stroke-width="0.5"/>

  <!-- Live Anchor Text Links (Pill Style from original) -->
  <g transform="translate(24, 245)">
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

  <!-- Copyright -->
  <text x="${W - 24}" y="259" text-anchor="end" font-family="Consolas, 'Courier New', monospace" font-size="9" fill="${c.muted}">© ${new Date().getFullYear()} Hazy019 · Kyrell Santillan</text>

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
