export const config = { runtime: "edge" };

const USERNAME = "Hazy019";

// ── Language colour map ──────────────────────────────────────────────────────
const LANG_META = {
  TypeScript:  { color: "#3178c6" },
  Python:      { color: "#3572a5" },
  JavaScript:  { color: "#f1e05a" },
  CSS:         { color: "#8b5cf6" },
  HTML:        { color: "#e34c26" },
  Shell:       { color: "#89e051" },
  Dockerfile:  { color: "#0db7ed" },
  MDX:         { color: "#fcb32c" },
  default:     { color: "#8b949e" },
};

// ── Fallback data (shown when GitHub is unreachable) ────────────────────────
const FB_LANGS   = [
  { name: "TypeScript",  bytes: 41000 },
  { name: "Python",      bytes: 36000 },
  { name: "CSS",         bytes: 11000 },
  { name: "JavaScript",  bytes:  7000 },
  { name: "HTML",        bytes:  3200 },
];
const FB_REPOS   = 12;
const FB_STARS   = 4;
const FB_COMMITS = 265;

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtBytes(b) {
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)}MB`;
  if (b >= 1_000)     return `${Math.round(b / 1_000)}KB`;
  return `${b}B`;
}

/** Edge-safe token: Vercel injects env vars as globals, not process.env. */
function getToken() {
  try { if (typeof GITHUB_TOKEN !== "undefined") return GITHUB_TOKEN; } catch {}
  try { if (typeof process !== "undefined" && process.env?.GITHUB_TOKEN) return process.env.GITHUB_TOKEN; } catch {}
  return undefined;
}

// ── GitHub data fetch ────────────────────────────────────────────────────────
async function fetchLiveData() {
  const token = getToken();
  const base  = { "User-Agent": "hazy-readme/3.0", Accept: "application/vnd.github.v3+json" };
  const hdrs  = token ? { ...base, Authorization: `Bearer ${token}` } : base;

  // GraphQL path — most accurate, requires token
  if (token) {
    const q = `{
      user(login:"${USERNAME}") {
        repositories(first:100, ownerAffiliations:OWNER, isFork:false) {
          totalCount
          nodes {
            stargazerCount
            languages(first:10, orderBy:{field:SIZE, direction:DESC}) {
              edges { size node { name } }
            }
          }
        }
        contributionsCollection(from:"2026-01-01T00:00:00Z") {
          totalCommitContributions
        }
      }
    }`;
    try {
      const res        = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const { data } = await res.json();
      if (!data?.user) throw new Error("no user");

      const u     = data.user;
      const lm    = {};
      u.repositories.nodes.forEach(r =>
        r.languages.edges.forEach(({ size, node }) => {
          lm[node.name] = (lm[node.name] || 0) + size;
        })
      );
      const totalBytes = Object.values(lm).reduce((a, b) => a + b, 0);
      const stars      = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);
      const langs      = Object.entries(lm)
        .sort(([, a], [, b]) => b - a).slice(0, 6)
        .map(([name, bytes]) => ({ name, bytes, pct: Math.round((bytes / totalBytes) * 100) }));

      return { langs, repoCount: u.repositories.totalCount, stars,
               commits: u.contributionsCollection.totalCommitContributions,
               totalBytes, source: "graphql" };
    } catch { /* fall through */ }
  }

  // REST path — unauthenticated
  try {
    const [reposRes, commitsRes] = await Promise.allSettled([
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`, { headers: hdrs }),
      fetch(
        `https://api.github.com/search/commits?q=author:${USERNAME}+committer-date:2026-01-01..2026-12-31&per_page=1`,
        { headers: { ...hdrs, Accept: "application/vnd.github.cloak-preview+json" } }
      ),
    ]);

    let repos = [], repoCount = FB_REPOS, stars = FB_STARS, commits = FB_COMMITS;
    if (reposRes.status === "fulfilled" && reposRes.value.ok) {
      repos     = await reposRes.value.json();
      repoCount = Array.isArray(repos) ? repos.length : FB_REPOS;
      stars     = Array.isArray(repos) ? repos.reduce((s, r) => s + (r.stargazers_count || 0), 0) : FB_STARS;
    }
    if (commitsRes.status === "fulfilled" && commitsRes.value.ok) {
      const d = await commitsRes.value.json();
      commits = d.total_count ?? FB_COMMITS;
    }

    const langMap = {};
    if (repos.length > 0) {
      const results = await Promise.allSettled(
        repos.slice(0, 30).map(r =>
          fetch(`https://api.github.com/repos/${USERNAME}/${r.name}/languages`, { headers: hdrs })
            .then(res => res.ok ? res.json() : {}).catch(() => ({}))
        )
      );
      results.forEach(r => {
        if (r.status === "fulfilled")
          Object.entries(r.value).forEach(([lang, bytes]) => {
            langMap[lang] = (langMap[lang] || 0) + bytes;
          });
      });
    }

    const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);
    const langs = totalBytes > 0
      ? Object.entries(langMap).sort(([, a], [, b]) => b - a).slice(0, 6)
          .map(([name, bytes]) => ({ name, bytes, pct: Math.round((bytes / totalBytes) * 100) }))
      : FB_LANGS.map(l => ({ ...l, pct: Math.round((l.bytes / FB_LANGS.reduce((a, x) => a + x.bytes, 0)) * 100) }));

    return { langs, repoCount, stars, commits, totalBytes, source: "rest" };
  } catch {
    const fbTotal = FB_LANGS.reduce((a, l) => a + l.bytes, 0);
    return {
      langs:     FB_LANGS.map(l => ({ ...l, pct: Math.round((l.bytes / fbTotal) * 100) })),
      repoCount: FB_REPOS, stars: FB_STARS, commits: FB_COMMITS,
      totalBytes: fbTotal, source: "fallback",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens (matches header/profile/footer exactly) ───────────────
  const c = dark
    ? {
        bg:      "#0a0c10",
        bgPanel: "#0d1015",
        bgCard:  "#12151b",
        text:    "#e6edf3",
        muted:   "#8b949e",
        dim:     "#6e7681",
        border:  "#30363d",
        border2: "#21262d",
        accent:  "#39d353",   // green  — expert tier / primary accent
        mid:     "#79c0ff",   // blue   — strong tier
        cyan:    "#56d4dd",   // cyan   — code written metric
        yellow:  "#f1c40f",   // gold   — stars metric
        tagBg:   "#12151b",
        tagText: "#8b949e",
        tagBdr:  "#30363d",
        shimmer: "0.11",
      }
    : {
        bg:      "#fcfbf9",
        bgPanel: "#f5f2eb",
        bgCard:  "#f0ead6",
        text:    "#1a1a1a",
        muted:   "#57606a",
        dim:     "#8c959f",
        border:  "#e5e1d8",
        border2: "#d4cdbc",
        accent:  "#16a34a",
        mid:     "#0550ae",
        cyan:    "#0891b2",
        yellow:  "#ca8a04",
        tagBg:   "#f5f2eb",
        tagText: "#57606a",
        tagBdr:  "#e5e1d8",
        shimmer: "0.30",
      };

  const { langs, repoCount, stars, commits, totalBytes, source } = await fetchLiveData();

  // ── Layout constants ─────────────────────────────────────────────────────
  const W        = 900;
  const PAD_X    = 28;
  const STRIP_W  = 3;

  // §1 — two-column zone
  const SEC1_LABEL_Y = 16;
  const SEC1_LINE_Y  = 24;
  const COL_HEAD_Y   = 38;          // "LANGUAGE" / "BYTE DISTRIBUTION" / "REPOSITORY METRICS" labels
  const COLS_Y       = 50;          // first data row

  const BAR_COL_W = 510;            // left column ends here
  const LABEL_W   = 118;
  const BAR_X     = PAD_X + LABEL_W + 10;
  const BAR_W     = BAR_COL_W - BAR_X - 56;   // bar fill width
  const PCT_X     = BAR_X + BAR_W + 8;
  const BYTE_X    = PCT_X + 36;
  const ROW_H     = 31;

  const R_X    = BAR_COL_W + 20;   // right column start
  const CARD_W = W - R_X - PAD_X;
  const CARD_H = 42;
  const CARD_GAP = 10;

  // Stat cards definition
  const STAT_CARDS = [
    { label: "Repositories", value: repoCount,            icon: "⬡", color: c.accent },
    { label: "Stars Earned",  value: stars,               icon: "★", color: c.yellow },
    { label: "Commits 2026",  value: commits,             icon: "↑", color: c.mid    },
    { label: "Code Written",  value: fmtBytes(totalBytes), icon: "◈", color: c.cyan   },
  ];

  // Height of §1 = whatever is taller: lang bars or stat cards
  const SEC1_H = COLS_Y
    + Math.max(langs.length * ROW_H, STAT_CARDS.length * (CARD_H + CARD_GAP))
    + 20;

  // Source label
  const sourceLabel = source === "graphql" ? "● LIVE · GraphQL"
                    : source === "rest"    ? "● LIVE · REST"
                    : "◌ CACHED · fallback";
  const sourceColor = source === "fallback" ? c.dim : c.accent;

  // ── §1 Language bars ──────────────────────────────────────────────────────
  const langBarsSVG = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const y    = COLS_Y + i * ROW_H;
    const fw   = Math.max(4, Math.round((lang.pct / 100) * BAR_W));
    return `
  <circle cx="${PAD_X + 7}" cy="${y + 9}" r="4" fill="${meta.color}"/>
  <text x="${PAD_X + LABEL_W + 6}" y="${y + 13}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="11.5" font-weight="600" fill="${c.text}">${lang.name}</text>
  <rect x="${BAR_X}" y="${y + 4}" width="${BAR_W}" height="9" rx="4.5" fill="${c.border2}"/>
  <rect x="${BAR_X}" y="${y + 4}" width="${fw}"   height="9" rx="4.5" fill="${meta.color}"/>
  <rect x="${BAR_X}" y="${y + 4}" width="${fw}"   height="4" rx="2"   fill="white" opacity="${c.shimmer}"/>
  <text x="${PCT_X}" y="${y + 13}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" font-weight="700" fill="${meta.color}">${lang.pct}%</text>
  <text x="${BYTE_X + 14}" y="${y + 13}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" fill="${c.dim}">${fmtBytes(lang.bytes)}</text>
  ${i < langs.length - 1
    ? `<line x1="${PAD_X}" y1="${y + ROW_H - 2}" x2="${BAR_COL_W}" y2="${y + ROW_H - 2}"
             stroke="${c.border}" stroke-width="0.4" opacity="0.5"/>`
    : ""}`;
  }).join("");

  // ── §1 Stat cards ────────────────────────────────────────────────────────
  const statCardsSVG = STAT_CARDS.map(({ label, value, icon, color }, i) => {
    const cy = COLS_Y + i * (CARD_H + CARD_GAP);
    return `
  <rect x="${R_X}" y="${cy}" width="${CARD_W}" height="${CARD_H}" rx="6"
        fill="${c.bgCard}" stroke="${c.border}" stroke-width="0.5"/>
  <!-- Left accent bar on card — 2 separate rects avoids double-rx artifacts -->
  <rect x="${R_X}" y="${cy + 2}"             width="3" height="${CARD_H - 4}" rx="1.5"
        fill="${color}" opacity="0.85"/>
  <text x="${R_X + 14}" y="${cy + 15}"
        font-family="'Courier New',Consolas,monospace"
        font-size="11" fill="${color}" opacity="0.8">${icon}</text>
  <text x="${R_X + 14}" y="${cy + 31}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1" fill="${c.dim}">${label.toUpperCase()}</text>
  <text x="${R_X + CARD_W - 10}" y="${cy + 28}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="22" font-weight="800" fill="${color}">${value}</text>`;
  }).join("");

  // ── §2 Technology badges ─────────────────────────────────────────────────
  const TAGS = [
    "Python","HTML","CSS","JavaScript","React",
    "Next.js","Tailwind","Flask","PostgreSQL","PyQt6",
    "Figma","Git","CyberSec",
  ];
  const TAG_H   = 26;
  const TAG_GAP = 8;
  const PER_ROW = 7;

  const SEC2_Y   = SEC1_H + 8;
  const TAGS_HDR = SEC2_Y + 20;
  const TAGS_Y   = TAGS_HDR + 14;

  function badgeRow(items, yPos) {
    const n   = items.length;
    const tw  = Math.floor((W - PAD_X * 2 - TAG_GAP * (n - 1)) / n);
    return items.map((t, i) => {
      const x = PAD_X + i * (tw + TAG_GAP);
      return `
  <rect x="${x}" y="${yPos}" width="${tw}" height="${TAG_H}" rx="13"
        fill="${c.tagBg}" stroke="${c.tagBdr}" stroke-width="0.5"/>
  <circle cx="${x + 10}" cy="${yPos + 13}" r="2.5" fill="${c.accent}" opacity="0.45"/>
  <text x="${x + 20 + (tw - 20) / 2}" y="${yPos + 17}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.tagText}">${t}</text>`;
    }).join("");
  }

  const tagEls = badgeRow(TAGS.slice(0, PER_ROW), TAGS_Y)
               + badgeRow(TAGS.slice(PER_ROW),     TAGS_Y + TAG_H + TAG_GAP);

  // ── §3 Composition bar ───────────────────────────────────────────────────
  const SEC3_Y   = TAGS_Y + 2 * (TAG_H + TAG_GAP) + 18;
  const COMP_HDR = SEC3_Y + 18;
  const COMP_Y   = COMP_HDR + 14;
  const COMP_H   = 10;
  const COMP_W   = W - PAD_X * 2;
  const LEG_Y    = COMP_Y + COMP_H + 16;

  let segX = PAD_X;
  const segments = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const sw   = Math.max(6, Math.round((lang.pct / 100) * COMP_W));
    const isFirst = i === 0;
    const isLast  = i === langs.length - 1;
    // rx only on the outer ends — inner joins are flush for a contiguous bar look
    const el = `<rect x="${segX}" y="${COMP_Y}" width="${sw}" height="${COMP_H}"
          rx="${isFirst || isLast ? 5 : 0}" fill="${meta.color}" opacity="0.9"/>`;
    segX += sw;
    return el;
  }).join("\n  ");

  const legendSVG = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const lx   = PAD_X + i * 130;
    if (lx + 120 > W) return "";
    return `
  <circle cx="${lx + 5}" cy="${LEG_Y - 3}" r="4" fill="${meta.color}"/>
  <text x="${lx + 14}" y="${LEG_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" fill="${c.dim}">${lang.name} ${lang.pct}%</text>`;
  }).join("");

  const H = LEG_Y + 22;

  // ── SVG ───────────────────────────────────────────────────────────────────
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="sc"><rect width="${W}" height="${H}"/></clipPath>
  <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${c.bgPanel}" stop-opacity="${dark ? "0.6" : "0.4"}"/>
    <stop offset="100%" stop-color="${c.bg}"       stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="divGrad" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0%"   stop-color="${c.accent}" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
  </linearGradient>
  <filter id="numGlow" x="-40%" y="-60%" width="180%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g clip-path="url(#sc)">

  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ══ §1  LANGUAGE ANALYSIS ═══════════════════════════════════════════ -->
  <text x="${PAD_X}" y="${SEC1_LABEL_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// LANGUAGE ANALYSIS</text>
  <line x1="${PAD_X}" y1="${SEC1_LINE_Y}" x2="${W - PAD_X}" y2="${SEC1_LINE_Y}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Column headers -->
  <text x="${PAD_X}" y="${COL_HEAD_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1.5" fill="${c.dim}">LANGUAGE</text>
  <text x="${BAR_X}" y="${COL_HEAD_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1.5" fill="${c.dim}">BYTE DISTRIBUTION</text>
  <text x="${R_X}" y="${COL_HEAD_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1.5" fill="${c.dim}">REPOSITORY METRICS</text>

  <!-- Right panel subtle tint -->
  <rect x="${R_X - 10}" y="${COLS_Y - 4}" width="${CARD_W + 18}" height="${SEC1_H - COLS_Y}"
        fill="url(#panelGrad)" rx="4"/>

  <!-- Column divider — fades to transparent (depth) -->
  <rect x="${BAR_COL_W + 10}" y="${SEC1_LINE_Y}" width="1" height="${SEC1_H - SEC1_LINE_Y - 10}"
        fill="url(#divGrad)"/>

  ${langBarsSVG}
  ${statCardsSVG}

  <!-- Source badge — bottom-right of §1 -->
  <text x="${W - PAD_X}" y="${SEC1_H - 4}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="8" letter-spacing="1" fill="${sourceColor}" opacity="0.65">${sourceLabel}</text>

  <!-- ══ §2  TECHNOLOGIES ═════════════════════════════════════════════════ -->
  <line x1="${PAD_X}" y1="${SEC2_Y}" x2="${W - PAD_X}" y2="${SEC2_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${TAGS_HDR}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// TECHNOLOGIES</text>

  ${tagEls}

  <!-- ══ §3  COMPOSITION BAR ══════════════════════════════════════════════ -->
  <line x1="${PAD_X}" y1="${SEC3_Y}" x2="${W - PAD_X}" y2="${SEC3_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${COMP_HDR}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// COMPOSITION</text>

  <rect x="${PAD_X}" y="${COMP_Y}" width="${COMP_W}" height="${COMP_H}" rx="5" fill="${c.border2}"/>
  ${segments}
  <rect x="${PAD_X}" y="${COMP_Y}" width="${COMP_W}" height="4" rx="5"
        fill="white" opacity="${c.shimmer}"/>
  ${legendSVG}

  <!-- ══ LEFT ACCENT STRIP — visual rhyme anchor on every card ════════════ -->
  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>
  <rect y="${H - 1}" width="${W}" height="1" fill="${c.border}"/>

</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type":  "image/svg+xml",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
