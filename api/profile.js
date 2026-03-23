export const config = { runtime: "edge" };

const USERNAME = "Hazy019";

function ab2b64(buf) {
  const u = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < u.length; i += 32768)
    s += String.fromCharCode(...u.subarray(i, Math.min(i + 32768, u.length)));
  return btoa(s);
}

async function loadFonts() {
  try {
    const [o, r] = await Promise.all([
      fetch("https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nysimBoWgz.woff2").then(f => f.arrayBuffer()),
      fetch("https://fonts.gstatic.com/s/rajdhani/v15/LDI2apCSOBg7S-QT7pasEcHqqpU.woff2").then(f => f.arrayBuffer()),
    ]);
    return `@font-face{font-family:'Orbitron';font-weight:900;src:url('data:font/woff2;base64,${ab2b64(o)}')format('woff2')}
    @font-face{font-family:'Rajdhani';font-weight:600;src:url('data:font/woff2;base64,${ab2b64(r)}')format('woff2')}`;
  } catch { return ""; }
}

const FALLBACK = {
  stars: 4, commits: 28, prs: 6, issues: 8,
  langs: [
    { name: "Python",     pct: 50 },
    { name: "CSS",        pct: 22 },
    { name: "JavaScript", pct: 18 },
    { name: "TypeScript", pct: 10 },
  ],
};

async function fetchStats() {
  const token = (typeof process !== "undefined") ? process.env.GITHUB_TOKEN : undefined;
  const base = { "User-Agent": "hazy-readme/1.0", "Accept": "application/vnd.github.v3+json" };
  const hdrs = token ? { ...base, Authorization: `Bearer ${token}` } : base;

  if (token) {
    const q = `{user(login:"${USERNAME}"){
      repositories(first:100,ownerAffiliations:OWNER,isFork:false){nodes{
        stargazerCount
        languages(first:8,orderBy:{field:SIZE,direction:DESC}){edges{size node{name}}}
      }}
      contributionsCollection(from:"2026-01-01T00:00:00Z"){
        totalCommitContributions totalPullRequestContributions totalIssueContributions
      }
    }}`;
    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const { data } = await res.json();
      const u = data.user;
      const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
      const lm = {};
      u.repositories.nodes.forEach(r =>
        r.languages.edges.forEach(({ size, node }) => { lm[node.name] = (lm[node.name] || 0) + size; })
      );
      const tot = Object.values(lm).reduce((a, b) => a + b, 0);
      const langs = Object.entries(lm).sort(([, a], [, b]) => b - a).slice(0, 4)
        .map(([name, b]) => ({ name, pct: Math.round((b / tot) * 100) }));
      return {
        stars, langs,
        commits: u.contributionsCollection.totalCommitContributions,
        prs:     u.contributionsCollection.totalPullRequestContributions,
        issues:  u.contributionsCollection.totalIssueContributions,
      };
    } catch { /* fall through */ }
  }

  try {
    const [rR, pR, iR, cR] = await Promise.allSettled([
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`, { headers: hdrs }),
      fetch(`https://api.github.com/search/issues?q=author:${USERNAME}+type:pr&per_page=1`, { headers: hdrs }),
      fetch(`https://api.github.com/search/issues?q=author:${USERNAME}+type:issue&per_page=1`, { headers: hdrs }),
      fetch(`https://api.github.com/search/commits?q=author:${USERNAME}+committer-date:2026-01-01..2026-12-31&per_page=1`, {
        headers: { ...hdrs, Accept: "application/vnd.github.cloak-preview+json" },
      }),
    ]);

    let { stars, langs, prs, issues, commits } = FALLBACK;

    if (rR.status === "fulfilled" && rR.value.ok) {
      const repos = await rR.value.json();
      if (Array.isArray(repos)) {
        stars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
        const lc = {};
        repos.forEach(r => { if (r.language) lc[r.language] = (lc[r.language] || 0) + 1; });
        const tot = Object.values(lc).reduce((a, b) => a + b, 0);
        if (tot > 0)
          langs = Object.entries(lc).sort(([, a], [, b]) => b - a).slice(0, 4)
            .map(([name, c]) => ({ name, pct: Math.round((c / tot) * 100) }));
      }
    }
    if (pR.status === "fulfilled" && pR.value.ok) { const d = await pR.value.json(); prs = d.total_count ?? prs; }
    if (iR.status === "fulfilled" && iR.value.ok) { const d = await iR.value.json(); issues = d.total_count ?? issues; }
    if (cR.status === "fulfilled" && cR.value.ok) { const d = await cR.value.json(); commits = d.total_count ?? commits; }

    return { stars, commits, prs, issues, langs };
  } catch { return FALLBACK; }
}

export default async function handler() {
  const [ff, stats] = await Promise.all([loadFonts(), fetchStats()]);
  const { stars, commits, prs, issues, langs } = stats;

  const W = 900, H = 415;

  const STAT_ROWS = [
    ["Total Stars",   stars],
    ["Commits 2026",  commits],
    ["Pull Requests", prs],
    ["Issues",        issues],
  ];

  const statsRowsSVG = STAT_ROWS.map(([label, val], i) => {
    const ry = 78 + i * 30;
    const sep = i < 3
      ? `<line x1="498" y1="${ry + 9}" x2="858" y2="${ry + 9}" stroke="rgba(212,175,55,0.07)" stroke-width="0.5"/>`
      : "";
    return `
  <text x="498" y="${ry}" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" letter-spacing="0.8" fill="rgba(212,175,55,0.5)">${label}</text>
  <text x="858" y="${ry}" text-anchor="end" font-family="'Orbitron',monospace" font-size="15" font-weight="900" fill="rgba(212,175,55,0.9)">${val}</text>
  ${sep}`;
  }).join("");

  const BAR_X = 138, BAR_W = 716;
  const langBarsSVG = langs.map(({ name, pct }, i) => {
    const ry = 292 + i * 30;
    const fw = Math.round((pct / 100) * BAR_W);
    const delay = (0.2 + i * 0.12).toFixed(2);
    return `
  <text x="24" y="${ry}" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="1" fill="rgba(212,175,55,0.65)">${name}</text>
  <rect x="${BAR_X}" y="${ry - 11}" width="${BAR_W}" height="5" rx="2.5" fill="rgba(212,175,55,0.07)"/>
  <rect x="${BAR_X}" y="${ry - 11}" width="0" height="5" rx="2.5" fill="url(#bg)">
    <animate attributeName="width" from="0" to="${fw}" dur="1.1s" begin="${delay}s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0;1"/>
  </rect>
  <text x="${BAR_X + BAR_W + 14}" y="${ry}" text-anchor="end" font-family="'Orbitron',monospace" font-size="9" font-weight="900" fill="rgba(212,175,55,0.4)">${pct}%</text>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <style>${ff}</style>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="#d4af37"/>
    <stop offset="55%"  stop-color="#f4d03f"/>
    <stop offset="100%" stop-color="#d4af37"/>
  </linearGradient>
  <clipPath id="pc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#pc)">
  <rect width="${W}" height="${H}" fill="#050400"/>

  ${Array.from({length:20}, (_, i) => `<line x1="0" y1="${i * 22}" x2="${W}" y2="${i * 22}" stroke="rgba(212,175,55,0.025)" stroke-width="0.5"/>`).join("")}

  <!-- ── LEFT: ABOUT ──────────────────────────── -->
  <text x="24" y="44" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="3" fill="rgba(212,175,55,0.38)">ABOUT</text>
  <line x1="24" y1="53" x2="74" y2="53" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" style="filter:drop-shadow(0 0 3px rgba(255,255,255,0.65))"/>

  <text x="24" y="76" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" letter-spacing="0.4" fill="rgba(212,175,55,0.65)">Graduating CS student from STI West Negros University.</text>
  <text x="24" y="96" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" letter-spacing="0.4" fill="rgba(212,175,55,0.65)">Building real products since 2024 – from government</text>
  <text x="24" y="116" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" letter-spacing="0.4" fill="rgba(212,175,55,0.65)">queue systems to AI consultation platforms.</text>

  <text x="24" y="145" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" fill="rgba(212,175,55,0.5)"><tspan fill="rgba(212,175,55,0.35)">›</tspan>  Figma · UI Design · Responsive CSS</text>
  <text x="24" y="165" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" fill="rgba(212,175,55,0.5)"><tspan fill="rgba(212,175,55,0.35)">›</tspan>  Next.js · React · Flask · PostgreSQL</text>
  <text x="24" y="185" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" fill="rgba(212,175,55,0.5)"><tspan fill="rgba(212,175,55,0.35)">›</tspan>  CyberSecurity Fundamentals</text>
  <text x="24" y="205" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" fill="rgba(212,175,55,0.5)"><tspan fill="rgba(212,175,55,0.35)">›</tspan>  Philippines · UTC+8</text>

  <!-- ── RIGHT: GITHUB STATS CARD ──────────────── -->
  <rect x="476" y="18" width="400" height="196" rx="8" fill="rgba(10,8,0,0.82)" stroke="rgba(212,175,55,0.2)" stroke-width="1"/>
  <line x1="491" y1="18" x2="861" y2="18" stroke="rgba(212,175,55,0.5)" stroke-width="1"/>

  <text x="498" y="46" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="2" fill="rgba(212,175,55,0.38)">GITHUB STATS</text>
  <line x1="498" y1="56" x2="858" y2="56" stroke="rgba(212,175,55,0.1)" stroke-width="0.5"/>

  ${statsRowsSVG}

  <!-- ── SEPARATOR ──────────────────────────────── -->
  <line x1="24" y1="232" x2="${W - 24}" y2="232" stroke="rgba(212,175,55,0.07)" stroke-width="0.8"/>

  <!-- ── TOP LANGUAGES ──────────────────────────── -->
  <text x="24" y="256" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="3" fill="rgba(212,175,55,0.38)">TOP LANGUAGES</text>
  <line x1="24" y1="265" x2="84" y2="265" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" style="filter:drop-shadow(0 0 3px rgba(255,255,255,0.65))"/>

  ${langBarsSVG}
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
