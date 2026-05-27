export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:         "#0d1117",
        bar:        "#161b22",
        text:       "#e6edf3",
        muted:      "#8b949e",
        dim:        "#6e7681",
        border:     "#30363d",
        accent:     "#39d353",
        linkBg:     "#161b22",
        linkText:   "#e6edf3",
        linkBorder: "#30363d",
      }
    : {
        bg:         "#ffffff",
        bar:        "#f6f8fa",
        text:       "#1a1a1a",
        muted:      "#57606a",
        dim:        "#8c959f",
        border:     "#d0d7de",
        accent:     "#1a7f37",
        linkBg:     "#f6f8fa",
        linkText:   "#1a1a1a",
        linkBorder: "#d0d7de",
      };

  const W = 900;
  const H = 84; 
  const PAD_X = 28;

 const LINKS = [
  { label: "LinkedIn", url: "https://linkedin.com/in/kyrell-santillan" },
  { label: "GitHub",   url: "https://github.com/Hazy019" },
  { label: "Discord",  url: "https://discord.gg/Hazy019" },
  { label: "Website",  url: "https://hazy.codedevs.com" },
  ];

  let currentX = PAD_X;
  const linkPills = LINKS.map(link => {
    const pW = link.label.length * 6.8 + 22; 
    const pH = 24;
    const pY = 44; 
    const el = `
    <a href="${link.url}" target="_blank">
      <rect x="${currentX}" y="${pY}" width="${pW}" height="${pH}" rx="4"
            fill="${c.linkBg}" stroke="${c.linkBorder}" stroke-width="0.5"/>
      <text x="${currentX + pW / 2}" y="${pY + 15.5}" text-anchor="middle"
            font-family="'Courier New', Consolas, monospace" font-size="10"
            font-weight="700" fill="${c.linkText}">${link.label}</text>
    </a>`;
    currentX += pW + 8;
    return el;
  }).join("");

  const OFW_DOT_X = currentX + 8;
  const BRAND_X = W - PAD_X;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath>
</defs>
<style>
  @keyframes pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
  .subtle-glow { animation: pulse 2s ease-in-out infinite; }
</style>
<g clip-path="url(#fc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <rect width="${W}" height="32" fill="${c.bar}"/>
  <rect y="32" width="${W}" height="0.5" fill="${c.border}"/>

  <circle cx="22" cy="16" r="4.5" fill="#ff5f57"/>
  <circle cx="38" cy="16" r="4.5" fill="#febc2e"/>
  <circle cx="54" cy="16" r="4.5" fill="#28c840"/>
  <text x="74" y="20" font-family="'Courier New', Consolas, monospace" font-size="11" font-weight="700" fill="${c.dim}">connect · collaborate · build</text>

  ${linkPills}

  <circle cx="${OFW_DOT_X}" cy="55.5" r="4" fill="${c.accent}" class="subtle-glow"/>
  <text x="${OFW_DOT_X + 12}" y="59.5" font-family="'Courier New', Consolas, monospace" font-size="10.5" font-weight="700" fill="${c.accent}">OFW</text>

  <text x="${BRAND_X}" y="59.5" text-anchor="end" font-family="'Courier New', Consolas, monospace" font-size="12" font-weight="700" fill="${c.text}">Kyrell Santillan</text>
  
  <rect x="0" y="0" width="1" height="${H}" fill="${c.border}"/>
  <rect x="${W - 1}" y="0" width="1" height="${H}" fill="${c.border}"/>
  <rect y="0" width="${W}" height="1" fill="${c.border}"/>
  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
