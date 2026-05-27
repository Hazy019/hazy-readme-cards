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

async function fetchStats() {
  const token = typeof process !== "undefined" ? process.env.GITHUB_TOKEN : undefined;
  const base  = { "User-Agent": "hazy-readme/2.0", Accept: "application/vnd.github.v3+json" };
  const hdrs  = token ? { ...base, Authorization: `Bearer ${token}` } : base;

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
      return { stars, langs,
        commits: u.contributionsCollection.totalCommitContributions,
        prs:     u.contributionsCollection.totalPullRequestContributions,
        issues:  u.contributionsCollection.totalIssueContributions };
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
    if (pR.status === "fulfilled" && pR.value.ok) { const d = await pR.value.json(); prs     = d.total_count ?? prs; }
    if (iR.status === "fulfilled" && iR.value.ok) { const d = await iR.value.json(); issues  = d.total_count ?? issues; }
    if (cR.status === "fulfilled" && cR.value.ok) { const d = await cR.value.json(); commits = d.total_count ?? commits; }
    return { stars, commits, prs, issues, langs };
  } catch { return FALLBACK; }
}

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  const c = dark
    ? {
        bg:      "#0d1117",
        bg2:     "#161b22",
        text:    "#e6edf3",
        muted:   "#8b949e",
        dim:     "#6e7681",
        border:  "#30363d",
        border2: "#21262d",
        accent:  "#39d353",
        statVal: "#79c0ff",
        tagABg:  "#0f2a18",
        tagAFg:  "#39d353",
        tagBBg:  "#1f182b",
        tagBFg:  "#d2a8ff",
      }
    : {
        bg:      "#ffffff",
        bg2:     "#f6f8fa",
        text:    "#1a1a1a",
        muted:   "#57606a",
        dim:     "#8c959f",
        border:  "#d0d7de",
        border2: "#d0d7de",
        accent:  "#1a7f37",
        statVal: "#0550ae",
        tagABg:  "#dafbe1",
        tagAFg:  "#1a7f37",
        tagBBg:  "#f1e7ff",
        tagBFg:  "#8250df",
      };

  const stats = await fetchStats();
  const { stars, commits, prs, issues, langs } = stats;

  // ── Canvas dimensions ────────────────────────────────────────────────────────
  const W = 900;

  // ── Layout grid ──────────────────────────────────────────────────────────────
  const PAD_X    = 24;
  const COL_MID  = 450;          // x of vertical rule
  const LEFT_X   = PAD_X;
  const RIGHT_X  = COL_MID + PAD_X;
  const RIGHT_END = W - PAD_X;
  const RULE_GAP = 8;            // column rule inner padding

  // ── ABOUT column (left) ──────────────────────────────────────────────────────
  // Section header baseline + underline at y = 14 / 22
  const SECT_LBL_Y = 16;
  const SECT_UND_Y = 24;

  const aboutLines = [
    "I build systems the way architects design buildings —",
    "failure modes first, elegance second.",
    "",
    "Currently finishing my CS degree in the Philippines, with",
    "production deployments already in the field. I gravitate",
    "toward problems with real consequences — government",
    "systems people depend on, tools that run unattended,",
    "interfaces used by people who never asked for them.",
    "",
    "Security mindset first: every input hostile, every",
    "permission a liability, every data store a target.",
    "Pursuing Google's Professional Cybersecurity cert alongside",
    "UX design — how systems fail and how people think are",
    "the two most useful things a developer can know.",
  ];
  const ABOUT_LINE_H = 15;
  const ABOUT_START_Y = SECT_UND_Y + 18;

  const aboutSVG = aboutLines.map((line, i) => {
    if (!line) return "";
    const y     = ABOUT_START_Y + i * ABOUT_LINE_H;
    const bold  = i < 2;
    return `<text x="${LEFT_X}" y="${y}"
      font-family="'Courier New', Consolas, monospace"
      font-size="${bold ? 12 : 11}" font-weight="${bold ? "700" : "400"}"
      fill="${bold ? c.text : c.muted}">${line}</text>`;
  }).join("\n");

  // Total height consumed by about lines (including blanks for spacing)
  const aboutBlockH = aboutLines.length * ABOUT_LINE_H;
  const ABOUT_BOTTOM_Y = ABOUT_START_Y + aboutBlockH;  // ~252

  // ── GITHUB STATS column (right) ──────────────────────────────────────────────
  const STAT_ROWS = [
    ["Total Stars",    stars],
    ["Commits (2026)", commits],
    ["Pull Requests",  prs],
    ["Issues",         issues],
  ];
  const STAT_START_Y = SECT_UND_Y + 18;
  const STAT_ROW_H   = 42;

  const statsRowsSVG = STAT_ROWS.map(([label, val], i) => {
    const ry = STAT_START_Y + i * STAT_ROW_H;
    return `
    <text x="${RIGHT_X}" y="${ry + 12}"
          font-family="'Courier New', Consolas, monospace"
          font-size="10" fill="${c.muted}">${label}</text>
    <text x="${RIGHT_END}" y="${ry + 12}" text-anchor="end"
          font-family="'Courier New', Consolas, monospace"
          font-size="18" font-weight="700" fill="${c.statVal}">${val}</text>
    ${i < 3 ? `<line x1="${RIGHT_X}" y1="${ry + STAT_ROW_H - 4}" x2="${RIGHT_END}" y2="${ry + STAT_ROW_H - 4}"
                     stroke="${c.border2}" stroke-width="0.5"/>` : ""}`;
  }).join("");

  // Meta tags: vertically flush to bottom of right stats block
  const STATS_BOTTOM_Y = STAT_START_Y + STAT_ROWS.length * STAT_ROW_H;
  const TAG_Y  = STATS_BOTTOM_Y + 10;
  const TAG_H  = 20;

  const metaTagsSVG = `
    <rect x="${RIGHT_X}" y="${TAG_Y}" width="88" height="${TAG_H}" rx="4"
          fill="${c.tagABg}" stroke="${c.border}" stroke-width="0.5"/>
    <text x="${RIGHT_X + 44}" y="${TAG_Y + 13.5}" text-anchor="middle"
          font-family="'Courier New', Consolas, monospace"
          font-size="9.5" font-weight="700" fill="${c.tagAFg}">CS Student</text>
    <rect x="${RIGHT_X + 96}" y="${TAG_Y}" width="88" height="${TAG_H}" rx="4"
          fill="${c.tagBBg}" stroke="${c.border}" stroke-width="0.5"/>
    <text x="${RIGHT_X + 140}" y="${TAG_Y + 13.5}" text-anchor="middle"
          font-family="'Courier New', Consolas, monospace"
          font-size="9.5" font-weight="700" fill="${c.tagBFg}">UTC+8 · PH</text>`;

  // ── Both columns are now aligned: use the taller of the two as SEP_Y ──────────
  const RIGHT_BLOCK_BOTTOM = TAG_Y + TAG_H;
  const SEP_Y = Math.max(ABOUT_BOTTOM_Y, RIGHT_BLOCK_BOTTOM) + 20;

  // ── TOP LANGUAGES (full-width) ────────────────────────────────────────────────
  const LANG_START_Y  = SEP_Y + 16;
  const LANG_LABEL_W  = 140;
  const BAR_X         = LEFT_X + LANG_LABEL_W + 12;
  const BAR_W         = W - BAR_X - 60;
  const LANG_ROW_H    = 28;
  const LANG_COLORS   = ["#3178c6", "#3572A5", "#563d7c", "#e8d44d"];

  const langBarsSVG = langs.map(({ name, pct }, i) => {
    const ry = LANG_START_Y + 14 + i * LANG_ROW_H;
    const fw = Math.round((pct / 100) * BAR_W);
    return `
    <text x="${LEFT_X + LANG_LABEL_W}" y="${ry}" text-anchor="end"
          font-family="'Courier New', Consolas, monospace"
          font-size="11" fill="${c.muted}">${name}</text>
    <rect x="${BAR_X}" y="${ry - 9}" width="${BAR_W}" height="6" rx="3" fill="${c.border2}"/>
    <rect x="${BAR_X}" y="${ry - 9}" width="${fw}"   height="6" rx="3"
          fill="${LANG_COLORS[i] || c.accent}"/>
    <text x="${BAR_X + BAR_W + 10}" y="${ry}" text-anchor="end"
          font-family="'Courier New', Consolas, monospace"
          font-size="10" fill="${c.dim}">${pct}%</text>`;
  }).join("");

  const H = LANG_START_Y + 14 + langs.length * LANG_ROW_H + 16;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="pc"><rect width="${W}" height="${H}"/></clipPath>
</defs>
<g clip-path="url(#pc)">

  <!-- Canvas -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ── LEFT COLUMN: ABOUT ──────────────────────────────────────── -->
  <text x="${LEFT_X}" y="${SECT_LBL_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// ABOUT</text>
  <line x1="${LEFT_X}" y1="${SECT_UND_Y}" x2="${COL_MID - RULE_GAP * 3}" y2="${SECT_UND_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  ${aboutSVG}

  <!-- ── COLUMN DIVIDER ────────────────────────────────────────────── -->
  <line x1="${COL_MID}" y1="${SECT_UND_Y}" x2="${COL_MID}" y2="${SEP_Y - 10}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- ── RIGHT COLUMN: GITHUB STATS ────────────────────────────── -->
  <text x="${RIGHT_X}" y="${SECT_LBL_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// GITHUB STATS</text>
  <line x1="${RIGHT_X}" y1="${SECT_UND_Y}" x2="${RIGHT_END}" y2="${SECT_UND_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  ${statsRowsSVG}
  ${metaTagsSVG}

  <!-- ── FULL-WIDTH SEPARATOR ──────────────────────────────────── -->
  <line x1="${LEFT_X}" y1="${SEP_Y}" x2="${RIGHT_END}" y2="${SEP_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- ── TOP LANGUAGES ─────────────────────────────────────────── -->
  <text x="${LEFT_X}" y="${SEP_Y + 14}"
        font-family="'Courier New', Consolas, monospace"
        font-size="10" font-weight="700" letter-spacing="1.5" fill="${c.dim}">// TOP LANGUAGES</text>
  ${langBarsSVG}

  <!-- Bottom rule -->
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
