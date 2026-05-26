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
        deskShadow: "#090d13",
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
        deskShadow: "#e1e4e8",
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
  @keyframes ambientLight {
    0%, 100% { opacity: 0.03; }
    50% { opacity: 0.06; }
  }
  @keyframes hoverRobot {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  /* Programmer Action Toggles */
  @keyframes toggleTyping {
    0%, 45% { opacity: 1; }
    50%, 95% { opacity: 0; }
    100% { opacity: 1; }
  }
  @keyframes toggleReading {
    0%, 45% { opacity: 0; }
    50%, 95% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes typingArms {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(2px) rotate(-1deg); }
    50% { transform: translateY(0) rotate(1deg); }
    75% { transform: translateY(-1px) rotate(0deg); }
  }
  
  .blue-glow { animation: flickerBlue 3s infinite; }
  .green-glow { animation: flickerGreen 4s infinite; }
  .blink { animation: blinkCursor 1s infinite; }
  .ambient { animation: ambientLight 5s ease-in-out infinite; }
  
  .hover-robot { animation: hoverRobot 4s ease-in-out infinite; }
  .action-typing { animation: toggleTyping 14s infinite; }
  .action-reading { animation: toggleReading 14s infinite; }
  .typing-arms { animation: typingArms 0.2s infinite; transform-origin: 30px 55px; }
</style>

<g clip-path="url(#fc)">
  <!-- Main Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ========================================== -->
  <!-- SECTION A: ANIMATED PIXEL ART PANEL (Top)  -->
  <!-- ========================================== -->
  <g id="pixel-art-scene">
    <!-- Dark room background for the scene -->
    <rect x="0" y="0" width="${W}" height="190" fill="${c.sceneBg}"/>
    
    <!-- Ambient room glow from monitors -->
    <ellipse cx="380" cy="110" rx="150" ry="80" fill="${c.monitorBlue}" class="ambient"/>

    <!-- Desk Surface & Accessories -->
    <rect x="120" y="160" width="660" height="8" fill="${dark ? "#161b22" : "#d0d7de"}"/>
    <rect x="120" y="168" width="660" height="22" fill="${c.deskShadow}"/>
    
    <!-- Desk details: Papers/Notepads -->
    <rect x="180" y="156" width="30" height="4" fill="${dark ? "#30363d" : "#afb8c1"}"/>
    <rect x="185" y="154" width="20" height="2" fill="${dark ? "#8b949e" : "#e1e4e8"}"/>
    
    <!-- Desk detail: Coffee Mug -->
    <rect x="230" y="148" width="12" height="12" rx="2" fill="${dark ? "#21262d" : "#57606a"}"/>
    <path d="M242,150 A4,4 0 0,1 242,158" fill="none" stroke="${dark ? "#21262d" : "#57606a"}" stroke-width="2"/>

    <!-- External Monitor (Ocean Blue Glow) -->
    <g id="main-monitor" transform="translate(290, 60)">
      <!-- Stand -->
      <rect x="35" y="80" width="10" height="20" fill="${dark ? "#21262d" : "#8c959f"}"/>
      <rect x="25" y="100" width="30" height="4" fill="${dark ? "#30363d" : "#6e7681"}"/>
      <!-- Bezel -->
      <rect x="0" y="0" width="80" height="80" rx="4" fill="${dark ? "#30363d" : "#57606a"}"/>
      <rect x="4" y="4" width="72" height="72" rx="2" fill="${dark ? "#010409" : "#1b1f24"}"/>
      <!-- Screen Glow Overlay -->
      <rect x="4" y="4" width="72" height="72" fill="${c.monitorBlue}" class="blue-glow"/>
      <!-- Terminal UI Lines -->
      <rect x="10" y="12" width="45" height="3" fill="${c.monitorBlue}"/>
      <rect x="10" y="20" width="35" height="3" fill="${c.monitorBlue}" opacity="0.8"/>
      <rect x="10" y="28" width="55" height="3" fill="${c.monitorBlue}" opacity="0.6"/>
      <rect x="10" y="36" width="25" height="3" fill="${c.monitorBlue}"/>
      <rect x="10" y="44" width="60" height="3" fill="${c.monitorBlue}" opacity="0.7"/>
      <!-- Blinking Cursor -->
      <rect x="38" y="35" width="4" height="5" fill="${c.monitorBlue}" class="blink"/>
    </g>

    <!-- Laptop (Green Phosphor Glow) -->
    <g id="laptop" transform="translate(410, 115)">
      <!-- Laptop Screen Back (Angled) -->
      <polygon points="5,45 15,0 75,0 85,45" fill="${dark ? "#21262d" : "#6e7681"}"/>
      <!-- Laptop Screen (Inner) -->
      <polygon points="10,42 18,4 72,4 80,42" fill="${dark ? "#010409" : "#1b1f24"}"/>
      <!-- Screen Glow Overlay -->
      <polygon points="10,42 18,4 72,4 80,42" fill="${c.monitorGreen}" class="green-glow"/>
      <!-- Laptop Base -->
      <rect x="-10" y="45" width="110" height="5" rx="2" fill="${dark ? "#30363d" : "#57606a"}"/>
      <rect x="0" y="45" width="90" height="2" fill="${dark ? "#161b22" : "#8c959f"}"/>
    </g>

    <!-- Stylized Robot Companion -->
    <g id="robot-companion" transform="translate(250, 110)" class="hover-robot">
      <!-- Antenna -->
      <line x1="20" y1="10" x2="20" y2="0" stroke="${dark ? "#8c959f" : "#57606a"}" stroke-width="2"/>
      <circle cx="20" cy="0" r="3" fill="#ff5f57" class="blink"/>
      <!-- Head -->
      <rect x="10" y="10" width="20" height="16" rx="3" fill="${dark ? "#21262d" : "#6e7681"}"/>
      <!-- Glowing Eyes -->
      <rect x="14" y="15" width="4" height="4" fill="${c.monitorBlue}" class="blue-glow"/>
      <rect x="22" y="15" width="4" height="4" fill="${c.monitorBlue}" class="blue-glow"/>
      <!-- Body -->
      <rect x="12" y="29" width="16" height="18" rx="2" fill="${dark ? "#30363d" : "#57606a"}"/>
      <!-- Neck -->
      <rect x="16" y="26" width="8" height="3" fill="${dark ? "#8c959f" : "#d0d7de"}"/>
      <!-- Hover Thruster Base -->
      <path d="M12,47 Q20,53 28,47 Z" fill="${dark ? "#8c959f" : "#d0d7de"}"/>
      <ellipse cx="20" cy="49" rx="6" ry="2" fill="${c.monitorBlue}" class="blue-glow"/>
    </g>

    <!-- The Programmer / Character Silhouette -->
    <g id="programmer" transform="translate(530, 70)">
      <!-- Chair Back -->
      <rect x="60" y="40" width="20" height="90" rx="6" fill="${dark ? "#0d1117" : "#424a53"}"/>
      
      <!-- Body / Hoodie Back -->
      <path d="M20,110 Q10,40 50,40 Q65,40 65,110 Z" fill="${dark ? "#161b22" : "#57606a"}"/>
      
      <!-- Head / Hood -->
      <rect x="28" y="10" width="34" height="40" rx="16" fill="${dark ? "#0d1117" : "#424a53"}"/>
      
      <!-- ACTION: Typing at the Laptop (Visible 0-45%) -->
      <g class="action-typing">
        <!-- Arms reaching out to keyboard -->
        <g class="typing-arms">
          <!-- Right arm -->
          <path d="M30,55 Q5,80 -25,75" fill="none" stroke="${dark ? "#161b22" : "#57606a"}" stroke-width="12" stroke-linecap="round"/>
          <!-- Left arm (slightly offset) -->
          <path d="M35,65 Q10,90 -20,85" fill="none" stroke="${dark ? "#0d1117" : "#424a53"}" stroke-width="10" stroke-linecap="round"/>
        </g>
      </g>

      <!-- ACTION: Reading a Book (Visible 50-95%) -->
      <g class="action-reading">
        <!-- Arms bent upwards holding book -->
        <path d="M30,55 Q20,90 -5,75" fill="none" stroke="${dark ? "#161b22" : "#57606a"}" stroke-width="12" stroke-linecap="round"/>
        <path d="M35,65 Q25,100 0,85" fill="none" stroke="${dark ? "#0d1117" : "#424a53"}" stroke-width="10" stroke-linecap="round"/>
        
        <!-- The Book -->
        <g transform="translate(-20, 58)">
          <!-- Book Cover Backing -->
          <path d="M-5,-5 L15,0 L15,15 L-5,10 Z" fill="${dark ? "#8c959f" : "#d0d7de"}"/>
          <path d="M35,-5 L15,0 L15,15 L35,10 Z" fill="${dark ? "#8c959f" : "#d0d7de"}"/>
          <!-- Book Pages -->
          <path d="M-2,-2 L15,2 L15,13 L-2,9 Z" fill="${dark ? "#e6edf3" : "#ffffff"}"/>
          <path d="M32,-2 L15,2 L15,13 L32,9 Z" fill="${dark ? "#e6edf3" : "#ffffff"}"/>
          <!-- Text lines on pages -->
          <line x1="2" y1="2" x2="12" y2="4" stroke="${dark ? "#0d1117" : "#57606a"}" stroke-width="1"/>
          <line x1="2" y1="5" x2="10" y2="7" stroke="${dark ? "#0d1117" : "#57606a"}" stroke-width="1"/>
          <line x1="18" y1="4" x2="28" y2="2" stroke="${dark ? "#0d1117" : "#57606a"}" stroke-width="1"/>
          <line x1="18" y1="7" x2="26" y2="5" stroke="${dark ? "#0d1117" : "#57606a"}" stroke-width="1"/>
        </g>
      </g>
    </g>
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
