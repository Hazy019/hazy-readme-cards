export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#0d1117", bar: "#161b22", text: "#e6edf3",
        muted: "#8b949e", dim: "#6e7681", border: "#30363d",
        accent: "#39d353",
      }
    : {
        bg: "#ffffff", bar: "#f6f8fa", text: "#1a1a1a",
        muted: "#57606a", dim: "#8c959f", border: "#d0d7de",
        accent: "#1a7f37",
      };

  const W = 900, H = 72;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><clipPath id="fc"><rect width="${W}" height="${H}" rx="8"/></clipPath></defs>
<g clip-path="url(#fc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="34" fill="${c.bar}"/>
  <rect y="33.5" width="${W}" height="0.5" fill="${c.border}"/>

  <!-- macOS dots (mirrored for footer feel) -->
  <circle cx="22" cy="17" r="5" fill="#ff5f57"/>
  <circle cx="40" cy="17" r="5" fill="#febc2e"/>
  <circle cx="58" cy="17" r="5" fill="#28c840"/>
  <text x="76" y="22" font-family="'Courier New',monospace" font-size="11" fill="${c.dim}">connect · collaborate · build</text>

  <!-- Links -->
  <text x="${W / 2}" y="56" text-anchor="middle" font-family="'Courier New',monospace" font-size="11" fill="${c.muted}">LinkedIn  ·  GitHub  ·  Discord  ·  hazy.cosedevs.com</text>

  <!-- Open for work indicator -->
  <circle cx="${W - 40}" cy="55" r="3.5" fill="${c.accent}"/>
  <text x="${W - 32}" y="59" font-family="'Courier New',monospace" font-size="9" font-weight="700" fill="${c.accent}">OFW</text>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
