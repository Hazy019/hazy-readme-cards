export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? { bg: "#0a0c10", border: "#30363d", accent: "#39d353", text: "#e6edf3", dim: "#6e7681" }
    : { bg: "#fcfbf9", border: "#e5e1d8", accent: "#16a34a", text: "#1a1a1a", dim: "#8c959f" };

  const W = 900, H = 44;
  const STRIP_W = 3;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="bc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#bc)">
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- Subtle top/bottom border lines -->
  <rect y="0" width="${W}" height="0.5" fill="${c.border}" opacity="0.8"/>
  <rect y="${H - 0.5}" width="${W}" height="0.5" fill="${c.border}" opacity="0.8"/>

  <!-- Left accent strip — visual rhyme anchor across all cards -->
  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>

  <!-- Bracket decorators -->
  <text x="20" y="28"
        font-family="'Courier New',Consolas,monospace" font-size="13" font-weight="700"
        fill="${c.accent}" opacity="0.5">[</text>
  <text x="${W - 20}" y="28" text-anchor="end"
        font-family="'Courier New',Consolas,monospace" font-size="13" font-weight="700"
        fill="${c.accent}" opacity="0.5">]</text>

  <!-- Centered label -->
  <text x="${W / 2}" y="27" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace" font-size="11" font-weight="700"
        letter-spacing="3" fill="${c.accent}">DEPLOY YOUR OWN TERMINAL PROFILE</text>

  <!-- Subtle terminal prompt prefix -->
  <text x="36" y="27"
        font-family="'Courier New',Consolas,monospace" font-size="10" font-weight="600"
        fill="${c.dim}">$_</text>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
