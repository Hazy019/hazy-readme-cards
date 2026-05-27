export const config = { runtime: "edge" };

const USERNAME = "Hazy019";

const FALLBACK = {
  stars: 4, commits: 265, prs: 0, issues: 0,
  langs: [
    { name: "TypeScript", pct: 41 },
    { name: "Python",     pct: 36 },
    { name: "CSS",        pct: 11 },
    { name: "JavaScript", pct:  7 },
  ],
};

const LANG_COLORS = {
  TypeScript:  "#3178c6",
  Python:      "#3572a5",
  CSS:         "#563d7c",
  JavaScript:  "#f1e05a",
  HTML:        "#e34c26",
  Shell:       "#89e051",
  default:     "#8b949e",
};

async function fetchStats() {
  const token = typeof process !== "undefined" ? process.env.GITHUB_TOKEN : undefined;
  const base  = { "User-Agent": "hazy-readme/2.0", Accept: "application/vnd.github.v3+json" };
  const hdrs  = token ? { ...base, Authorization: `Bearer ${token}` } : base;

  // ── GraphQL (authenticated) ────────────────────────────────────────────────
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
      const u     = data.user;
      const stars = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
      const lm    = {};
      u.repositories.nodes.forEach(r =>
        r.languages.edges.forEach(({ size, node }) => {
          lm[node.name] = (lm[node.name] || 0) + size;
        })
      );
      const tot   = Object.values(lm).reduce((a, b) => a + b, 0);
      const langs = Object.entries(lm).sort(([, a], [, b]) => b - a).slice(0, 4)
        .map(([name, b]) => ({ name, pct: Math.round((b / tot) * 100) }));
      return {
        stars, langs,
        commits: u.contributionsCollection.totalCommitContributions,
        prs:     u.contributionsCollection.totalPullRequestContributions,
        issues:  u.contributionsCollection.totalIssueContributions,
      };
    } catch { /* fall through to REST */ }
  }

  // ── REST (unauthenticated) ─────────────────────────────────────────────────
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
            .map(([name, cnt]) => ({ name, pct: Math.round((cnt / tot) * 100) }));
      }
    }
    if (pR.status === "fulfilled" && pR.value.ok) { const d = await pR.value.json(); prs    = d.total_count ?? prs;    }
    if (iR.status === "fulfilled" && iR.value.ok) { const d = await iR.value.json(); issues = d.total_count ?? issues; }
    if (cR.status === "fulfilled" && cR.value.ok) { const d = await cR.value.json(); commits = d.total_count ?? commits; }
    return { stars, commits, prs, issues, langs };
  } catch { return FALLBACK; }
}

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:      "#0d1117",
        bg2:     "#0d1520",
        bg3:     "#161b22",
        text:    "#e6edf3",
        muted:   "#8b949e",
        dim:     "#6e7681",
        border:  "#30363d",
        border2: "#21262d",
        accent:  "#39d353",
        statVal: "#79c0ff",
        tagABg:  "#0d2114",  tagAFg: "#39d353",
        tagBBg:  "#1a1530",  tagBFg: "#d2a8ff",
      }
    : {
        bg:      "#ffffff",
        bg2:     "#f0f7ff",
        bg3:     "#f6f8fa",
        text:    "#1a1a1a",
        muted:   "#57606a",
        dim:     "#8c959f",
        border:  "#d0d7de",
        border2: "#eaecef",
        accent:  "#1a7f37",
        statVal: "#0550ae",
        tagABg:  "#dafbe1",  tagAFg: "#1a7f37",
        tagBBg:  "#f1e7ff",  tagBFg: "#8250df",
      };

  const stats = await fetchStats();
  const { stars, commits, prs, issues, langs } = stats;

  // ── Layout constants ────────────────────────────────────────────────────────
  const W       = 900;
  const PAD_X   = 24;
  const DIVX    = 456;   // column split x
  const L_X     = PAD_X;
  const R_X     = DIVX + PAD_X;
  const R_END   = W - PAD_X;

  // Section header baseline / underline
  const SEC_Y   = 16;
  const UND_Y   = 24;

  // ── LEFT: ABOUT ─────────────────────────────────────────────────────────────
  const ABOUT_LINES = [
    { text: "I build systems the way architects design buildings —",  bold: true  },
    { text: "failure modes first, elegance second.",                  bold: true  },
    { text: null },
    { text: "Currently finishing my CS degree in the Philippines,",   bold: false },
    { text: "with production deployments already in the field. I",    bold: false },
    { text: "gravitate toward problems with real consequences —",      bold: false },
    { text: "government systems, tools that run unattended,",          bold: false },
    { text: "interfaces used by people who never asked for them.",     bold: false },
    { text: null },
    { text: "Security mindset first: every input hostile, every",     bold: false },
    { text: "permission a liability, every data store a target.",      bold: false },
    { text: "Pursuing Google's Professional Cybersecurity cert",       bold: false },
    { text: "alongside UX design — how systems fail and how",          bold: false },
    { text: "people think are a developer's sharpest edges.",          bold: false },
  ];

  const L_H   = 15;
  const L_SY  = UND_Y + 20;

  const aboutSVG = ABOUT_LINES.map((line, i) => {
    if (!line.text) return "";
    const y = L_SY + i * L_H;
    return `<text x="${L_X}" y="${y}"
      font-family="'Courier New',Consolas,monospace"
      font-size="${line.bold ? 12.5 : 11}" font-weight="${line.bold ? "700" : "400"}"
      fill="${line.bold ? c.text : c.muted}">${line.text}</text>`;
  }).join("\n");

  const ABOUT_BOTTOM = L_SY + ABOUT_LINES.length * L_H + 16;

  // Bullet list below about text
  const BUL_Y1 = ABOUT_BOTTOM;
  const BUL_Y2 = BUL_Y1 + 16;

  // ── RIGHT: GITHUB STATS CARD ─────────────────────────────────────────────
  const STAT_ROWS = [
    { label: "Total Stars",    value: stars,   icon: "★" },
    { label: "Commits (2026)", value: commits, icon: "↑" },
    { label: "Pull Requests",  value: prs,     icon: "⇄" },
    { label: "Issues",         value: issues,  icon: "!" },
  ];

  const CARD_X  = DIVX;
  const CARD_Y  = 0;
  const CARD_W  = W - CARD_X;
  const S_SY    = UND_Y + 14;
  const S_ROW_H = 46;

  const statsSVG = STAT_ROWS.map(({ label, value, icon }, i) => {
    const ry = S_SY + i * S_ROW_H;
    const isLast = i === STAT_ROWS.length - 1;
    return `
  <!-- stat row ${i} -->
  <text x="${R_X}" y="${ry + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.dim}">${icon}</text>
  <text x="${R_X + 16}" y="${ry + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.muted}">${label}</text>
  <text x="${R_END}" y="${ry + 14}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="20" font-weight="700" fill="${c.statVal}">${value}</text>
  ${!isLast ? `<line x1="${R_X}" y1="${ry + S_ROW_H - 4}" x2="${R_END}" y2="${ry + S_ROW_H - 4}"
               stroke="${c.border2}" stroke-width="0.5"/>` : ""}`;
  }).join("");

  const STATS_BOTTOM = S_SY + STAT_ROWS.length * S_ROW_H;

  // Meta tags below stats
  const TAG_Y = STATS_BOTTOM + 10;
  const TAG_H = 20;

  const metaSVG = `
  <rect x="${R_X}" y="${TAG_Y}" width="88" height="${TAG_H}" rx="10"
        fill="${c.tagABg}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${R_X + 44}" y="${TAG_Y + 13}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="9.5" font-weight="700" fill="${c.tagAFg}">CS Student</text>
  <rect x="${R_X + 96}" y="${TAG_Y}" width="88" height="${TAG_H}" rx="10"
        fill="${c.tagBBg}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${R_X + 140}" y="${TAG_Y + 13}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="9.5" font-weight="700" fill="${c.tagBFg}">UTC+8 · PH</text>`;

  // ── SEPARATOR ──────────────────────────────────────────────────────────────
  const SEP_Y = Math.max(BUL_Y2 + 20, TAG_Y + TAG_H + 20);

  // ── TOP LANGUAGES ──────────────────────────────────────────────────────────
  const LANG_SY    = SEP_Y + 16;
  const LABEL_W    = 136;
  const LBAR_X     = L_X + LABEL_W + 10;
  const LBAR_W     = W - LBAR_X - 56;
  const LANG_ROW_H = 30;

  const langSVG = langs.map(({ name, pct }, i) => {
    const ry  = LANG_SY + 16 + i * LANG_ROW_H;
    const fw  = Math.round((pct / 100) * LBAR_W);
    const col = LANG_COLORS[name] || LANG_COLORS.default;
    return `
  <text x="${L_X + LABEL_W}" y="${ry}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace" font-size="11" fill="${c.muted}">${name}</text>
  <rect x="${LBAR_X}" y="${ry - 10}" width="${LBAR_W}" height="6" rx="3" fill="${c.border2}"/>
  <rect x="${LBAR_X}" y="${ry - 10}" width="${fw}" height="6" rx="3" fill="${col}"/>
  <text x="${LBAR_X + LBAR_W + 8}" y="${ry}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace" font-size="10" fill="${c.dim}">${pct}%</text>`;
  }).join("");

  const H = LANG_SY + 16 + langs.length * LANG_ROW_H + 20;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="pc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#pc)">

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ── LEFT: ABOUT ──────────────────────────────────────────────────── -->
  <text x="${L_X}" y="${SEC_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// ABOUT</text>
  <line x1="${L_X}" y1="${UND_Y}" x2="${DIVX - 20}" y2="${UND_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  ${aboutSVG}

  <!-- Divider + bullet list below about text -->
  <line x1="${L_X}" y1="${BUL_Y1 - 8}" x2="${DIVX - 20}" y2="${BUL_Y1 - 8}"
        stroke="${c.border2}" stroke-width="0.5"/>
  <text x="${L_X}" y="${BUL_Y1 + 4}"
        font-family="'Courier New',Consolas,monospace" font-size="11" fill="${c.dim}">›  Figma · UI Design · Responsive CSS</text>
  <text x="${L_X}" y="${BUL_Y2 + 4}"
        font-family="'Courier New',Consolas,monospace" font-size="11" fill="${c.dim}">›  Next.js · React · Flask · PostgreSQL · Python</text>

  <!-- ── COLUMN DIVIDER ────────────────────────────────────────────────── -->
  <line x1="${DIVX}" y1="${UND_Y}" x2="${DIVX}" y2="${SEP_Y - 12}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- ── RIGHT: GITHUB STATS ───────────────────────────────────────────── -->
  <!-- Tinted card background -->
  <rect x="${CARD_X}" y="${CARD_Y}" width="${CARD_W}" height="${SEP_Y}"
        fill="${c.bg2}" opacity="0.45"/>

  <text x="${R_X}" y="${SEC_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// GITHUB STATS</text>
  <line x1="${R_X}" y1="${UND_Y}" x2="${R_END}" y2="${UND_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  ${statsSVG}
  ${metaSVG}

  <!-- ── FULL-WIDTH SEPARATOR + LANGUAGES ──────────────────────────────── -->
  <line x1="${L_X}" y1="${SEP_Y}" x2="${R_END}" y2="${SEP_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${L_X}" y="${SEP_Y + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// TOP LANGUAGES</text>

  ${langSVG}

  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type":  "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
