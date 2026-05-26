export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#080b10",
        bar: "#0d131f",
        text: "#f0f6fc",
        muted: "#8b949e",
        dim: "#00ff66",
        border: "#1f293d",
        accent: "#00ff66",
        sceneBg: "#05070a",
      }
    : {
        bg: "#ffffff",
        bar: "#f6f8fa",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#1a7f37",
        border: "#d0d7de",
        accent: "#1a7f37",
        sceneBg: "#f6f8fa",
      };

  const W = 900, H = 260;

  // Render the responsive, animated SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
  ${dark ? `
  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="4" y2="0" stroke="#00ff66" stroke-width="0.5" stroke-opacity="0.04" />
  </pattern>
  <pattern id="monitor-scanlines" width="2" height="2" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="2" y2="0" stroke="#00ff66" stroke-width="0.4" stroke-opacity="0.25" />
  </pattern>
  <filter id="neon-pink-glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3.5" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  <filter id="screen-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="6" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  <filter id="small-green-glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="1.5" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  ` : ""}
</defs>

<style>
  /* CSS animations that work natively in GitHub READMEs */
  @keyframes crtFlicker {
    0%, 100% { opacity: 0.95; }
    45% { opacity: 0.95; }
    50% { opacity: 0.82; }
    52% { opacity: 0.98; }
    80% { opacity: 0.95; }
    82% { opacity: 0.75; }
    85% { opacity: 0.98; }
  }
  @keyframes neonPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1.0; }
  }
  @keyframes steamRise1 {
    0% { transform: translateY(0px) translateX(0px); opacity: 0; }
    20% { opacity: 0.7; }
    80% { opacity: 0.3; }
    100% { transform: translateY(-10px) translateX(2px); opacity: 0; }
  }
  @keyframes steamRise2 {
    0% { transform: translateY(0px) translateX(0px); opacity: 0; }
    15% { opacity: 0.6; }
    75% { opacity: 0.2; }
    100% { transform: translateY(-12px) translateX(-3px); opacity: 0; }
  }
  @keyframes blinkLed {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 1.0; }
  }
  @keyframes codeScroll {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-14px); }
  }

  .crt-screen {
    animation: crtFlicker 4s infinite;
  }
  .neon-pink {
    animation: neonPulse 2.5s ease-in-out infinite;
  }
  .steam-particle-1 {
    animation: steamRise1 3s infinite ease-out;
  }
  .steam-particle-2 {
    animation: steamRise2 3s infinite ease-out;
    animation-delay: 1.5s;
  }
  .blinking-led {
    animation: blinkLed 1.2s steps(2, start) infinite;
  }
  .scrolling-code {
    animation: codeScroll 8s linear infinite;
  }
</style>

<g clip-path="url(#fc)">
  <!-- Main Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  ${dark ? `<rect width="${W}" height="${H}" fill="url(#scanlines)"/>` : ""}

  <!-- macOS dots Titlebar -->
  <rect width="${W}" height="34" fill="${c.bar}"/>
  <rect y="33.5" width="${W}" height="0.5" fill="${c.border}"/>

  <!-- macOS dots -->
  <circle cx="22" cy="17" r="5" fill="#ff5f57"/>
  <circle cx="40" cy="17" r="5" fill="#febc2e"/>
  <circle cx="58" cy="17" r="5" fill="#28c840"/>
  <text x="76" y="21" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${dark ? c.dim : c.muted}" ${dark ? 'filter="url(#small-green-glow)"' : ""}>terminal-noir · interactive-scene · v2.0</text>

  <!-- ── PIXEL ART WORKSPACE (H=226, y=34 to y=260) ────────────────── -->
  <g id="pixel-scene">
    <!-- Scene Background (Dark Room Wall) -->
    <rect y="34" width="${W}" height="226" fill="${dark ? c.sceneBg : "#f0f2f5"}"/>

    ${dark ? `
    <!-- Ambient back glow for Neon Wall Sign -->
    <ellipse cx="200" cy="115" rx="30" ry="30" fill="#ff0055" fill-opacity="0.12" filter="url(#screen-glow)"/>

    <!-- Ambient back glow for CRT Monitor -->
    <ellipse cx="450" cy="125" rx="60" ry="40" fill="#00ff66" fill-opacity="0.08" filter="url(#screen-glow)"/>
    ` : ""}

    <!-- ── NEON SIGN ON WALL (Left, y=90) ── -->
    <g class="neon-pink" ${dark ? 'filter="url(#neon-pink-glow)"' : ""}>
      <!-- Pixelated Tech Cross (Neon Pink) -->
      <!-- Vertical bar -->
      <rect x="197" y="95" width="6" height="40" rx="1.5" fill="${dark ? "#ff0055" : "#cf222e"}"/>
      <!-- Horizontal bar -->
      <rect x="180" y="112" width="40" height="6" rx="1.5" fill="${dark ? "#ff0055" : "#cf222e"}"/>
      <!-- Inner core white/bright pink -->
      <rect x="199" y="97" width="2" height="36" rx="0.5" fill="#ffccd8"/>
      <rect x="182" y="114" width="36" height="2" rx="0.5" fill="#ffccd8"/>
    </g>

    <!-- ── THE DESK (y=180 to y=210) ── -->
    <!-- Wood table top (pixel look) -->
    <rect x="0" y="180" width="${W}" height="10" fill="${dark ? "#161b22" : "#d0d7de"}"/>
    <rect x="0" y="190" width="${W}" height="4" fill="${dark ? "#0d1117" : "#afb8c1"}"/>
    <!-- Under-desk dark shadow floor -->
    <rect x="0" y="194" width="${W}" height="66" fill="${dark ? "#020406" : "#eaecef"}"/>

    <!-- ── TERMINAL CRT MONITOR (Center) ── -->
    <!-- Monitor Stand base -->
    <rect x="424" y="172" width="52" height="8" rx="2" fill="${dark ? "#21262d" : "#57606a"}"/>
    <!-- Neck -->
    <rect x="444" y="152" width="12" height="20" fill="${dark ? "#161b22" : "#8c959f"}"/>

    <!-- Monitor Outer Body (CRT Bezel) -->
    <rect x="380" y="70" width="140" height="92" rx="10" fill="${dark ? "#161b22" : "#6e7681"}" stroke="${dark ? "#21262d" : "#afb8c1"}" stroke-width="2"/>
    <!-- Shadow bevel inside monitor -->
    <rect x="388" y="76" width="124" height="80" rx="6" fill="${dark ? "#0d1117" : "#57606a"}"/>

    <!-- Actual Screen Frame -->
    <rect x="392" y="80" width="116" height="72" rx="3" fill="${dark ? "#08100c" : "#2f3542"}"/>

    <!-- Glowing Screen Tube -->
    <g class="crt-screen">
      <!-- Base glowing green/dark screen -->
      <rect x="394" y="82" width="112" height="68" rx="2" fill="${dark ? "#091f14" : "#1a2f24"}"/>

      <!-- Moving/Scrolling Code Rows on Screen (Pixel lines) -->
      <g clip-path="url(#screen-clip)" transform="translate(0, 0)">
        <g class="scrolling-code">
          <!-- Text or line approximations -->
          <rect x="398" y="88" width="45" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.8"/>
          <rect x="398" y="96" width="30" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.8"/>
          <rect x="398" y="104" width="60" height="3" fill="${dark ? "#00e5ff" : "#3498db"}" fill-opacity="0.8"/>
          <rect x="404" y="112" width="50" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.6"/>
          <rect x="404" y="120" width="35" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.8"/>
          <rect x="398" y="128" width="20" height="3" fill="${dark ? "#ff0055" : "#e74c3c"}" fill-opacity="0.8"/>
          <rect x="398" y="136" width="55" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.8"/>

          <!-- Loop duplicate lines for continuous scroll -->
          <rect x="398" y="150" width="45" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.8"/>
          <rect x="398" y="158" width="30" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.8"/>
          <rect x="398" y="166" width="60" height="3" fill="${dark ? "#00e5ff" : "#3498db"}" fill-opacity="0.8"/>
          <rect x="404" y="174" width="50" height="3" fill="${dark ? "#00ff66" : "#2ecc71"}" fill-opacity="0.6"/>
        </g>
      </g>

      <!-- Scanlines overlay over screen tube for CRT look -->
      <rect x="394" y="82" width="112" height="68" fill="url(#monitor-scanlines)" pointer-events="none"/>
    </g>

    <!-- Clip path to keep code inside screen boundaries -->
    <clipPath id="screen-clip">
      <rect x="394" y="82" width="112" height="68" rx="2"/>
    </clipPath>

    <!-- Monitor LED Indicator -->
    <circle cx="516" cy="158" r="1.5" fill="${dark ? "#00ff66" : "#2ecc71"}" class="blinking-led" ${dark ? 'filter="url(#small-green-glow)"' : ""}/>

    <!-- ── KEYBOARD & MOUSE (On desk) ── -->
    <!-- Keyboard silhouette -->
    <rect x="410" y="178" width="56" height="4" rx="1" fill="${dark ? "#0f141c" : "#475569"}"/>
    <rect x="420" y="176" width="36" height="2" fill="${dark ? "#21262d" : "#94a3b8"}"/>
    <!-- Mouse -->
    <rect x="478" y="179" width="6" height="3" rx="1" fill="${dark ? "#0f141c" : "#475569"}"/>

    <!-- ── COFFEE MUG (Right of desk, y=170) ── -->
    <g transform="translate(550, 166)">
      <!-- Steam particles (pixelated block rise) -->
      <rect x="5" y="-6" width="2" height="3" fill="${dark ? "#8b949e" : "#afb8c1"}" fill-opacity="0.8" class="steam-particle-1"/>
      <rect x="8" y="-9" width="2" height="2" fill="${dark ? "#8b949e" : "#afb8c1"}" fill-opacity="0.6" class="steam-particle-2"/>

      <!-- Mug body -->
      <rect x="2" y="0" width="10" height="12" rx="1" fill="${dark ? "#58a6ff" : "#0550ae"}"/>
      <!-- Handle -->
      <rect x="12" y="3" width="3" height="6" rx="1.5" fill="none" stroke="${dark ? "#58a6ff" : "#0550ae"}" stroke-width="1.5"/>
      <!-- Liquid top surface -->
      <rect x="3" y="1" width="8" height="2" fill="#5c3a21"/>
    </g>

    <!-- ── PIXEL PLANT/BONSAI (Left of desk) ── -->
    <g transform="translate(320, 156)">
      <!-- Pot -->
      <polygon points="4,24 16,24 18,14 2,14" fill="${dark ? "#8b949e" : "#8c959f"}"/>
      <!-- Stems and pixel leaves -->
      <rect x="8" y="8" width="4" height="6" fill="#1b4d3e"/>
      <rect x="4" y="6" width="4" height="4" fill="${dark ? "#00ff66" : "#2ecc71"}" ${dark ? 'filter="url(#small-green-glow)"' : ""}/>
      <rect x="12" y="8" width="4" height="4" fill="${dark ? "#00ff66" : "#2ecc71"}" ${dark ? 'filter="url(#small-green-glow)"' : ""}/>
      <rect x="8" y="2" width="4" height="4" fill="${dark ? "#00e5ff" : "#12cbc4"}"/>
    </g>

    <!-- ── FLOOR / BOTTOM LINKS FOOTER FEEL (y=216 to y=260) ── -->
    <!-- Nice high contrast links -->
    <text x="${W / 2}" y="222" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="11.5" font-weight="700" fill="${dark ? "#8b949e" : "#57606a"}">
      LinkedIn  ·  GitHub  ·  Discord  ·  hazy.cosedevs.com
    </text>

    <!-- Open for work indicator badge in the footer -->
    <g transform="translate(${W - 96}, 211)">
      <circle cx="6" cy="11.5" r="3.5" fill="${c.accent}" ${dark ? 'filter="url(#small-green-glow)"' : ""}/>
      <text x="14" y="15" font-family="Consolas, 'Courier New', monospace" font-size="9.5" font-weight="700" letter-spacing="0.5" fill="${c.accent}">OFW STATUS</text>
    </g>

    <!-- Copyright info at the bottom -->
    <text x="32" y="246" font-family="Consolas, 'Courier New', monospace" font-size="10" fill="${dark ? "#4b5563" : "#8c959f"}">© ${new Date().getFullYear()} Hazy019 · Kyrell Santillan</text>
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
