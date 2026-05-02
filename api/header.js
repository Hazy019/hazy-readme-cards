export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#0d1117", bar: "#161b22", text: "#e6edf3",
        muted: "#8b949e", dim: "#6e7681", border: "#30363d",
        accent: "#39d353", aBg: "#0f2a18",
      }
    : {
        bg: "#ffffff", bar: "#f6f8fa", text: "#1a1a1a",
        muted: "#57606a", dim: "#8c959f", border: "#d0d7de",
        accent: "#1a7f37", aBg: "#dafbe1",
      };

  const W = 900, H = 130;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><clipPath id="hc"><rect width="${W}" height="${H}" rx="8"/></clipPath></defs>
<g clip-path="url(#hc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- Titlebar -->
  <rect width="${W}" height="34" fill="${c.bar}"/>
  <rect y="33.5" width="${W}" height="0.5" fill="${c.border}"/>

  <!-- macOS dots -->
  <circle cx="22" cy="17" r="5" fill="#ff5f57"/>
  <circle cx="40" cy="17" r="5" fill="#febc2e"/>
  <circle cx="58" cy="17" r="5" fill="#28c840"/>
  <text x="76" y="22" font-family="'Courier New',monospace" font-size="11" fill="${c.dim}">~/kyrell-santillan — zsh</text>

  <!-- Name -->
  <text x="32" y="76" font-family="'Courier New',monospace" font-size="30" font-weight="700" fill="${c.text}">Kyrell Santillan</text>

  <!-- Roles -->
  <text x="32" y="96" font-family="'Courier New',monospace" font-size="12" fill="${c.muted}">Web Designer  ·  Frontend Engineer  ·  Cybersecurity  ·  Philippines  ·  UTC+8</text>

  <!-- Open for work badge -->
  <rect x="32" y="104" width="118" height="18" rx="9" fill="${c.aBg}"/>
  <circle cx="46" cy="113" r="3.5" fill="${c.accent}"/>
  <text x="54" y="117" font-family="'Courier New',monospace" font-size="9.5" font-weight="700" fill="${c.accent}">Open for Work</text>

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
