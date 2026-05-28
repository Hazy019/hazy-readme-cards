export const config = { runtime: "edge" };

// ─────────────────────────────────────────────────────────────────────────────
//  SKILLS.JS — Refactored for focus
// ─────────────────────────────────────────────────────────────────────────────

const USERNAME = "Hazy019";

const LANG_META = {
  TypeScript:  { color: "#3178c6" },
  Python:      { color: "#3572a5" },
  JavaScript:  { color: "#f1e05a" },
  CSS:         { color: "#8b5cf6" },
  HTML:        { color: "#e34c26" },
  default:     { color: "#8b949e" },
};

const FALLBACK_LANGS = [
  { name: "TypeScript",  bytes: 41000 },
  { name: "Python",      bytes: 36000 },
  { name: "CSS",         bytes: 11000 },
  { name: "JavaScript",  bytes:  7000 },
  { name: "HTML",        bytes:  3200 },
];

function fmtBytes(b) {
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)}MB`;
  if (b >= 1_000)      return `${Math.round(b / 1_000)}KB`;
  return `${b}B`;
}

function getToken() {
  if (typeof GITHUB_TOKEN !== "undefined") return GITHUB_TOKEN;
  if (typeof process !== "undefined" && process.env?.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  return undefined;
}

async function fetchLiveData() {
  const token = getToken();
  const hdrs = { "User-Agent": "hazy-readme/3.0", ...(token && { Authorization: `Bearer ${token}` }) };

  try {
    const q = `{ user(login:"${USERNAME}") { repositories(first:100, ownerAffiliations:OWNER, isFork:false) { nodes { languages(first:6, orderBy:{field:SIZE, direction:DESC}) { edges { size node { name } } } } } } }`;
    const res = await fetch("https://api.github.com/graphql", { method: "POST", headers: { ...hdrs, "Content-Type": "application/json" }, body: JSON.stringify({ query: q }) });
    const { data } = await res.json();
    
    const lm = {};
    data.user.repositories.nodes.forEach(r => r.languages.edges.forEach(({ size, node }) => lm[node.name] = (lm[node.name] || 0) + size));
    const totalBytes = Object.values(lm).reduce((a, b) => a + b, 0);
    const langs = Object.entries(lm).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, bytes]) => ({ name, bytes, pct: Math.round((bytes / totalBytes) * 100) }));
    return { langs, totalBytes, source: "graphql" };
  } catch {
    const fbTotal = FALLBACK_LANGS.reduce((a, l) => a + l.bytes, 0);
    return { langs: FALLBACK_LANGS.map(l => ({ ...l, pct: Math.round((l.bytes / fbTotal) * 100) })), totalBytes: fbTotal, source: "fallback" };
  }
}

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";
  const c = dark
    ? { bg: "#0a0c10", text: "#e6edf3", dim: "#6e7681", border: "#30363d", border2: "#21262d", accent: "#39d353", tagBg: "#12151b", tagText: "#8b949e", tagBdr: "#30363d", shimmer: "0.11" }
    : { bg: "#fcfbf9", text: "#1a1a1a", dim: "#8c959f", border: "#e5e1d8", border2: "#d4cdbc", accent: "#16a34a", tagBg: "#f5f2eb", tagText: "#57606a", tagBdr: "#e5e1d8", shimmer: "0.30" };

  const { langs, totalBytes, source } = await fetchLiveData();

  // Layout Constants
  const W = 900;
  const PAD_X = 28;
  const ROW_H = 34;
  const BAR_W = 500;
  
  const langsSVG = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const y = 60 + i * ROW_H;
    const fw = Math.round((lang.pct / 100) * BAR_W);
    return `
      <text x="${PAD_X}" y="${y + 5}" font-family="monospace" font-size="12" fill="${c.text}">${lang.name}</text>
      <rect x="${PAD_X + 120}" y="${y - 4}" width="${BAR_W}" height="10" rx="5" fill="${c.border2}"/>
      <rect x="${PAD_X + 120}" y="${y - 4}" width="${fw}" height="10" rx="5" fill="${meta.color}"/>
      <text x="${PAD_X + 120 + BAR_W + 15}" y="${y + 5}" font-family="monospace" font-size="12" fill="${c.dim}">${lang.pct}%</text>
    `;
  }).join("");

  const H = 60 + (langs.length * ROW_H) + 40;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="${c.bg}"/>
    <text x="${PAD_X}" y="30" font-family="monospace" font-size="12" font-weight="700" fill="${c.accent}">// LANGUAGE PROFICIENCY</text>
    ${langsSVG}
    <rect x="0" y="0" width="3" height="${H}" fill="${c.accent}"/>
  </svg>`;

  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, s-maxage=1800" } });
}
