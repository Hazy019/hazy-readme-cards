export const config = { runtime: "edge" };

const USERNAME = "Hazy019";

const FALLBACK = {
  stars: 4, commits: 265, prs: 0, issues: 0,
  langs: [
    { name: "TypeScript", pct: 41 },
    { name: "Python",     pct: 36 },
    { name: "CSS",        pct: 11 },
    { name: "JavaScript", pct: 7  },
  ],
};

async function fetchStats() {
  const token = typeof process !== "undefined" ? process.env.GITHUB_TOKEN : undefined;
  const base = { "User-Agent": "hazy-readme/2.0", "Accept": "application/vnd.github.v3+json" };
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

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg: "#0d1117",
        bg2: "#161b22",
        text: "#e6edf3",
        muted: "#8b949e",
        dim: "#6e7681",
        border: "#30363d",
        border2: "#21262d",
        accent: "#39d353",
        statVal: "#79c0ff", // Classic GitHub blue highlight for stats
      }
    : {
        bg: "#ffffff",
        bg2: "#f6f8fa",
        text: "#1a1a1a",
        muted: "#57606a",
        dim: "#8c959f",
        border: "#d0d7de",
        border2: "#d0d7de",
        accent: "#1a7f37",
        statVal: "#0550ae",
      };

  const stats = await fetchStats();
  const { stars, commits, prs, issues, langs } = stats;

  const W = 900, H = 460;

  // Stats rows (right panel)
  const STAT_ROWS = [
    ["Total Stars",    stars],
    ["Commits (2026)", commits],
    ["Pull Requests",  prs],
    ["Issues",         issues],
  ];
  const statsRowsSVG = STAT_ROWS.map(([label, val], i) => {
    const ry = 92 + i * 36;
    return `
  <text x="498" y="${ry}" font-family="Consolas, 'Courier New', monospace" font-size="12" fill="${c.muted}">${label}</text>
  <text x="858" y="${ry}" text-anchor="end" font-family="Consolas, 'Courier New', monospace" font-size="14" font-weight="700" fill="${c.statVal}">${val}</text>
  ${i < 3 ? `<line x1="498" y1="${ry + 10}" x2="858" y2="${ry + 10}" stroke="${c.border2}" stroke-width="0.5"/>` : ""}`;
  }).join("");

  // Language bars (full-width bottom)
  const BAR_X = 140, BAR_W = 700;
  const LANG_COLORS = ["#3178c6", "#3572A5", "#563d7c", "#e8d44d"];

  const langBarsSVG = langs.map(({ name, pct }, i) => {
    const ry = 318 + i * 30;
    const fw = Math.round((pct / 100) * BAR_W);
    return `
  <text x="24" y="${ry}" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">${name}</text>
  <rect x="${BAR_X}" y="${ry - 11}" width="${BAR_W}" height="6" rx="3" fill="${c.border2}"/>
  <rect x="${BAR_X}" y="${ry - 11}" width="${fw}" height="6" rx="3" fill="${LANG_COLORS[i] || c.accent}"/>
  <text x="${BAR_X + BAR_W + 14}" y="${ry}" text-anchor="end" font-family="Consolas, 'Courier New', monospace" font-size="10" fill="${c.dim}">${pct}%</text>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="pc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#pc)">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>

  <!-- ── LEFT: ABOUT ──────────────────────────── -->
  <text x="24" y="26" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// ABOUT</text>
  <line x1="24" y1="34" x2="452" y2="34" stroke="${c.border}" stroke-width="0.5"/>

  <!-- Tagline -->
  <text x="24" y="58" font-family="Consolas, 'Courier New', monospace" font-size="12" font-weight="700" fill="${c.text}">I build systems the way architects design buildings —</text>
  <text x="24" y="74" font-family="Consolas, 'Courier New', monospace" font-size="12" font-weight="700" fill="${c.text}">failure modes first, elegance second.</text>

  <!-- Paragraph 1 -->
  <text x="24" y="98" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">Currently finishing my CS degree in the Philippines, with</text>
  <text x="24" y="114" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">production deployments already in the field. I gravitate</text>
  <text x="24" y="130" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">toward problems with real consequences — government</text>
  <text x="24" y="146" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">systems people depend on, tools that run unattended,</text>
  <text x="24" y="162" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">interfaces used by people who never asked for them.</text>

  <!-- Paragraph 2 -->
  <text x="24" y="184" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">Security mindset first: every input hostile, every</text>
  <text x="24" y="200" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">permission a liability, every data store a target.</text>
  <text x="24" y="216" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">Pursuing Google's Professional Cybersecurity cert alongside</text>
  <text x="24" y="232" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">UX design — how systems fail and how people think are</text>
  <text x="24" y="248" font-family="Consolas, 'Courier New', monospace" font-size="11" fill="${c.muted}">the two most useful things a developer can know.</text>

  <!-- ── RIGHT: GITHUB STATS CARD ──────────────── -->
  <rect x="476" y="18" width="400" height="236" rx="6" fill="${c.bg2}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="498" y="46" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// GITHUB STATS</text>
  <line x1="498" y1="54" x2="858" y2="54" stroke="${c.border}" stroke-width="0.5"/>
  ${statsRowsSVG}

  <!-- Quick stats tag row to balance column height -->
  <rect x="498" y="214" width="80" height="20" rx="4" fill="${dark ? "#0f2a18" : "#dafbe1"}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="538" y="227" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="9.5" font-weight="700" fill="${c.accent}">CS Student</text>

  <rect x="586" y="214" width="85" height="20" rx="4" fill="${dark ? "#1f182b" : "#f1e7ff"}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="628.5" y="227" text-anchor="middle" font-family="Consolas, 'Courier New', monospace" font-size="9.5" font-weight="700" fill="${dark ? "#d2a8ff" : "#8250df"}">UTC+8 (PH)</text>

  <!-- ── SEPARATOR ──────────────────────────────── -->
  <line x1="24" y1="274" x2="${W - 24}" y2="274" stroke="${c.border}" stroke-width="0.5"/>

  <!-- ── TOP LANGUAGES ──────────────────────────── -->
  <text x="24" y="294" font-family="Consolas, 'Courier New', monospace" font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// TOP LANGUAGES</text>
  ${langBarsSVG}

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
