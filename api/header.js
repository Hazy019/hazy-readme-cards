export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#080b10",
        bar: "#0d131f",
        text: "#f0f6fc",
        muted: "#8b949e",
        dim: "#00ff66", // Phosphor green accents
        border: "#1f293d",
        accent: "#00ff66",
        accentGlow: "#ff0055", // Neon pink secondary
        aBg: "rgba(0, 255, 102, 0.1)",
      }
    : {
        bg: "#ffffff",
        bar: "#f6f8fa",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#1a7f37",
        border: "#d0d7de",
        accent: "#1a7f37",
        accentGlow: "#0550ae",
        aBg: "#dafbe1",
      };

  const W = 900, H = 130;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="hc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
  ${dark ? `
  <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
    <line x1="0" y1="0" x2="4" y2="0" stroke="#00ff66" stroke-width="0.5" stroke-opacity="0.05" />
  </pattern>
  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="2" result="blur" />
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
  ` : ""}
</defs>
<g clip-path="url(#hc)">
  <!-- Main Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  ${dark ? `<rect width="${W}" height="${H}" fill="url(#scanlines)"/>` : ""}

  <!-- Titlebar -->
  <rect width="${W}" height="34" fill="${c.bar}"/>
  <rect y="33.5" width="${W}" height="0.5" fill="${c.border}"/>
  <!-- Glowing top line for terminal noir -->
  ${dark ? `<rect width="${W}" height="1.5" fill="${c.dim}" filter="url(#neon-glow)"/>` : ""}

  <!-- macOS dots -->
  <circle cx="22" cy="17" r="5" fill="#ff5f57"/>
  <circle cx="40" cy="17" r="5" fill="#febc2e"/>
  <circle cx="58" cy="17" r="5" fill="#28c840"/>
  <text x="76" y="21" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${dark ? c.dim : c.muted}" ${dark ? 'filter="url(#neon-glow)"' : ""}>~/kyrell-santillan — zsh</text>

  <!-- Name -->
  <text x="32" y="76" font-family="Consolas, 'Courier New', monospace" font-size="28" font-weight="700" letter-spacing="1" fill="${c.text}">Kyrell Santillan</text>

  <!-- Roles -->
  <text x="32" y="96" font-family="Consolas, 'Courier New', monospace" font-size="11" letter-spacing="0.5" fill="${c.muted}">
    Web Designer  ·  <tspan fill="${dark ? "#00e5ff" : c.accent}">Frontend Engineer</tspan>  ·  Cybersecurity  ·  Philippines  ·  UTC+8
  </text>

  <!-- Open for work badge -->
  <rect x="32" y="104" width="118" height="18" rx="9" fill="${c.aBg}" stroke="${dark ? c.accent : "none"}" stroke-width="0.5" stroke-opacity="0.5"/>
  <circle cx="46" cy="113" r="3.5" fill="${c.accent}" ${dark ? 'filter="url(#neon-glow)"' : ""}/>
  <text x="54" y="116.5" font-family="Consolas, 'Courier New', monospace" font-size="9" font-weight="700" letter-spacing="0.5" fill="${c.accent}">Open for Work</text>

  <!-- Bottom border -->
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
