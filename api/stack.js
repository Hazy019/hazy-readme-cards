export const config = { runtime: "edge" };

// ─────────────────────────────────────────────────────────────────────────────
//  STACK.JS — Dynamic GitHub Language Intelligence
//  Fetches real language bytes from the GitHub API, falls back gracefully.
//  Design System: "Terminal Noir" — dark #0a0c10, accent #39d353
// ─────────────────────────────────────────────────────────────────────────────

const USERNAME = "Hazy019";

// Canonical language → display color mapping
const LANG_META = {
  TypeScript:  { color: "#3178c6", short: "TS"  },
  Python:      { color: "#3572a5", short: "PY"  },
  JavaScript:  { color: "#f1e05a", short: "JS"  },
  CSS:         { color: "#8b5cf6", short: "CSS" },
  HTML:        { color: "#e34c26", short: "HTM" },
  Shell:       { color: "#89e051", short: "SH"  },
  Dockerfile:  { color: "#0db7ed", short: "DOK" },
  MDX:         { color: "#fcb32c", short: "MDX" },
  default:     { color: "#8b949e", short: "---" },
};

// Fallback when GitHub API is unavailable
const FALLBACK_LANGS = [
  { name: "TypeScript",  bytes: 41000 },
  { name: "Python",      bytes: 36000 },
  { name: "CSS",         bytes: 11000 },
  { name: "JavaScript",  bytes:  7000 },
  { name: "HTML",        bytes:  3200 },
];

const FALLBACK_REPOS   = 12;
const FALLBACK_STARS   = 4;
const FALLBACK_COMMITS = 265;

// ── GitHub data fetcher ───────────────────────────────────────────────────────
async function fetchLiveData() {
  const token = typeof process !== "undefined" ? process.env.GITHUB_TOKEN : undefined;
  const base  = { "User-Agent": "hazy-readme/3.0", Accept: "application/vnd.github.v3+json" };
  const hdrs  = token ? { ...base, Authorization: `Bearer ${token}` } : base;

  // ── GraphQL path (authenticated) ─────────────────────────────────────────
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
      const res  = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { ...hdrs, "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const { data } = await res.json();
      const u = data.user;

      // Aggregate language bytes across all repos
      const lm = {};
      u.repositories.nodes.forEach(r =>
        r.languages.edges.forEach(({ size, node }) => {
          lm[node.name] = (lm[node.name] || 0) + size;
        })
      );

      const totalBytes = Object.values(lm).reduce((a, b) => a + b, 0);
      const stars      = u.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0);

      // Top 6 languages by byte count
      const langs = Object.entries(lm)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, bytes]) => ({ name, bytes, pct: Math.round((bytes / totalBytes) * 100) }));

      return {
        langs,
        repoCount: u.repositories.totalCount,
        stars,
        commits: u.contributionsCollection.totalCommitContributions,
        totalBytes,
        source: "graphql",
      };
    } catch { /* fall through */ }
  }

  // ── REST path (unauthenticated) ───────────────────────────────────────────
  try {
    const [reposRes, commitsRes] = await Promise.allSettled([
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&type=owner`, { headers: hdrs }),
      fetch(
        `https://api.github.com/search/commits?q=author:${USERNAME}+committer-date:2026-01-01..2026-12-31&per_page=1`,
        { headers: { ...hdrs, Accept: "application/vnd.github.cloak-preview+json" } }
      ),
    ]);

    let repos      = [];
    let repoCount  = FALLBACK_REPOS;
    let stars      = FALLBACK_STARS;
    let commits    = FALLBACK_COMMITS;

    if (reposRes.status === "fulfilled" && reposRes.value.ok) {
      repos     = await reposRes.value.json();
      repoCount = Array.isArray(repos) ? repos.length : FALLBACK_REPOS;
      stars     = Array.isArray(repos)
        ? repos.reduce((s, r) => s + (r.stargazers_count || 0), 0)
        : FALLBACK_STARS;
    }

    if (commitsRes.status === "fulfilled" && commitsRes.value.ok) {
      const d = await commitsRes.value.json();
      commits = d.total_count ?? FALLBACK_COMMITS;
    }

    // Fetch language bytes for each repo concurrently (REST: per-repo endpoint)
    const langMap = {};
    if (repos.length > 0) {
      const langFetches = repos.slice(0, 30).map(r =>
        fetch(`https://api.github.com/repos/${USERNAME}/${r.name}/languages`, { headers: hdrs })
          .then(res => res.ok ? res.json() : {})
          .catch(() => ({}))
      );
      const results = await Promise.allSettled(langFetches);
      results.forEach(r => {
        if (r.status === "fulfilled") {
          Object.entries(r.value).forEach(([lang, bytes]) => {
            langMap[lang] = (langMap[lang] || 0) + bytes;
          });
        }
      });
    }

    // Build langs array
    const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);
    let langs;

    if (totalBytes > 0) {
      langs = Object.entries(langMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, bytes]) => ({ name, bytes, pct: Math.round((bytes / totalBytes) * 100) }));
    } else {
      const fbTotal = FALLBACK_LANGS.reduce((a, l) => a + l.bytes, 0);
      langs = FALLBACK_LANGS.map(l => ({
        ...l,
        pct: Math.round((l.bytes / fbTotal) * 100),
      }));
    }

    return { langs, repoCount, stars, commits, totalBytes, source: "rest" };
  } catch {
    // Hard fallback
    const fbTotal = FALLBACK_LANGS.reduce((a, l) => a + l.bytes, 0);
    return {
      langs:     FALLBACK_LANGS.map(l => ({ ...l, pct: Math.round((l.bytes / fbTotal) * 100) })),
      repoCount: FALLBACK_REPOS,
      stars:     FALLBACK_STARS,
      commits:   FALLBACK_COMMITS,
      totalBytes: fbTotal,
      source:    "fallback",
    };
  }
}

// ── Byte count → human readable ──────────────────────────────────────────────
function fmtBytes(b) {
  if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)}MB`;
  if (b >= 1_000)     return `${Math.round(b / 1_000)}KB`;
  return `${b}B`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  HANDLER
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens ──────────────────────────────────────────────────────────
  const c = dark
    ? {
        bg:       "#0a0c10",
        bgPanel:  "#0d1015",
        bgCard:   "#12151b",
        text:     "#e6edf3",
        muted:    "#8b949e",
        dim:      "#6e7681",
        border:   "#30363d",
        border2:  "#21262d",
        accent:   "#39d353",
        accentD:  "#238636",
        mid:      "#79c0ff",
        cyan:     "#56d4dd",
        tagBg:    "#12151b",
        tagText:  "#8b949e",
        tagBdr:   "#30363d",
        statBg:   "#0d1015",
        shimmer:  "0.11",
      }
    : {
        bg:       "#fcfbf9",
        bgPanel:  "#f5f2eb",
        bgCard:   "#f0ead6",
        text:     "#1a1a1a",
        muted:    "#57606a",
        dim:      "#8c959f",
        border:   "#e5e1d8",
        border2:  "#d4cdbc",
        accent:   "#16a34a",
        accentD:  "#15803d",
        mid:      "#0550ae",
        cyan:     "#0891b2",
        tagBg:    "#f5f2eb",
        tagText:  "#57606a",
        tagBdr:   "#e5e1d8",
        statBg:   "#f0ead6",
        shimmer:  "0.30",
      };

  // Fetch live GitHub data
  const { langs, repoCount, stars, commits, totalBytes, source } = await fetchLiveData();

  // ── Layout constants ────────────────────────────────────────────────────────
  const W       = 900;
  const PAD_X   = 28;
  const STRIP_W = 3;

  // ── Section 1: Live Language Breakdown (two-column) ────────────────────────
  //  Left col  = language bars
  //  Right col = meta stats panel
  const SEC1_Y   = 28;      // section header baseline
  const COLS_Y   = 44;      // columns start
  const BAR_COL_W = 510;    // left col width

  const LABEL_W  = 118;
  const BAR_X    = PAD_X + LABEL_W + 10;
  const BAR_W    = BAR_COL_W - LABEL_W - 10 - 56;
  const PCT_X    = BAR_X + BAR_W + 8;
  const BYTE_X   = PCT_X + 36;
  const ROW_H    = 31;

  const langBarsSVG = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const y    = COLS_Y + i * ROW_H;
    const fw   = Math.max(4, Math.round((lang.pct / 100) * BAR_W));

    return `
  <!-- lang row: ${lang.name} -->
  <!-- Language dot (visual rhyme: same circle used in legend, header badge, footer OFW) -->
  <circle cx="${PAD_X + 7}" cy="${y + 9}" r="4" fill="${meta.color}"/>
  <text x="${PAD_X + LABEL_W + 6}" y="${y + 13}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="11.5" font-weight="600"
        fill="${c.text}">${lang.name}</text>

  <!-- Track -->
  <rect x="${BAR_X}" y="${y + 4}" width="${BAR_W}" height="9" rx="4.5"
        fill="${c.border2}"/>
  <!-- Fill (language color) -->
  <rect x="${BAR_X}" y="${y + 4}" width="${fw}" height="9" rx="4.5"
        fill="${meta.color}"/>
  <!-- Sheen highlight (depth — physical bar feel) -->
  <rect x="${BAR_X}" y="${y + 4}" width="${fw}" height="4" rx="2"
        fill="white" opacity="${c.shimmer}"/>

  <!-- Percentage (opacity tier 1) -->
  <text x="${PCT_X}" y="${y + 13}"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" font-weight="700"
        fill="${meta.color}">${lang.pct}%</text>

  <!-- Byte size (opacity tier 3 — supporting data) -->
  <text x="${BYTE_X + 14}" y="${y + 13}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" fill="${c.dim}">${fmtBytes(lang.bytes)}</text>

  ${i < langs.length - 1
    ? `<line x1="${PAD_X}" y1="${y + ROW_H - 2}" x2="${BAR_COL_W}" y2="${y + ROW_H - 2}"
             stroke="${c.border}" stroke-width="0.4" opacity="0.5"/>`
    : ""}`;
  }).join("");

  // ── Right col: meta stat cards ─────────────────────────────────────────────
  const R_X      = BAR_COL_W + 20;
  const CARD_W   = W - R_X - PAD_X;
  const STAT_CARDS = [
    { label: "Repositories", value: repoCount, icon: "⬡", color: c.accent  },
    { label: "Stars Earned",  value: stars,     icon: "★", color: "#f1c40f" },
    { label: "Commits 2026",  value: commits,   icon: "↑", color: c.mid     },
    { label: "Code Written",  value: fmtBytes(totalBytes), icon: "◈", color: c.cyan },
  ];

  const CARD_H    = 42;
  const CARD_GAP  = 10;

  const statCardsSVG = STAT_CARDS.map(({ label, value, icon, color }, i) => {
    const cy = COLS_Y + i * (CARD_H + CARD_GAP);
    return `
  <!-- stat card: ${label} -->
  <rect x="${R_X}" y="${cy}" width="${CARD_W}" height="${CARD_H}" rx="6"
        fill="${c.bgCard}" stroke="${c.border}" stroke-width="0.5"/>
  <!-- Left accent bar on each card (visual rhyme: left strip on outer card) -->
  <rect x="${R_X}" y="${cy}" width="3" height="${CARD_H}" rx="6"
        fill="${color}" opacity="0.8"/>
  <rect x="${R_X}" y="${cy + CARD_H / 2}" width="3" height="${CARD_H / 2}"
        fill="${color}" opacity="0.8"/>

  <!-- Icon -->
  <text x="${R_X + 14}" y="${cy + 14}"
        font-family="'Courier New',Consolas,monospace"
        font-size="11" fill="${color}" opacity="0.8">${icon}</text>
  <!-- Label (opacity tier 3) -->
  <text x="${R_X + 14}" y="${cy + 30}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1" fill="${c.dim}">${label.toUpperCase()}</text>

  <!-- Value (opacity tier 1 — the number is the star) -->
  <text x="${R_X + CARD_W - 10}" y="${cy + 27}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="22" font-weight="800"
        fill="${color}">${value}</text>`;
  }).join("");

  // Section 1 total height
  const SEC1_H = COLS_Y + Math.max(langs.length * ROW_H, STAT_CARDS.length * (CARD_H + CARD_GAP)) + 16;

  // ── Data source badge (live vs fallback — transparency) ───────────────────
  const sourceLabel = source === "graphql"  ? "● LIVE · GraphQL"
                    : source === "rest"     ? "● LIVE · REST"
                    : "◌ CACHED · fallback";
  const sourceColor = source === "fallback" ? c.dim : c.accent;

  // ── Section 2: Technology Badges ──────────────────────────────────────────
  const SEC2_Y    = SEC1_H + 6;
  const TAGS_HEAD = SEC2_Y + 20;
  const TAGS_Y    = TAGS_HEAD + 16;
  const TAG_GAP   = 8;
  const TAG_H     = 26;
  const PER_ROW   = 7;

  const tags = [
    "Python", "HTML", "CSS", "JavaScript", "React",
    "Next.js", "Tailwind", "Flask", "PostgreSQL", "PyQt6",
    "Figma", "Git", "CyberSec",
  ];

  function fullStretchRow(items, yPos) {
    const n          = items.length;
    const total_gap  = TAG_GAP * (n - 1);
    const tw         = Math.floor((W - PAD_X * 2 - total_gap) / n);
    return items.map((t, i) => {
      const x = PAD_X + i * (tw + TAG_GAP);
      return `
  <rect x="${x}" y="${yPos}" width="${tw}" height="${TAG_H}" rx="13"
        fill="${c.tagBg}" stroke="${c.tagBdr}" stroke-width="0.5"/>
  <!-- Micro accent dot prefix (visual rhyme: badge / footer pill dots) -->
  <circle cx="${x + 10}" cy="${yPos + 13}" r="2.5" fill="${c.accent}" opacity="0.45"/>
  <text x="${x + 20 + (tw - 20) / 2}" y="${yPos + 17}" text-anchor="middle"
        font-family="'Courier New',Consolas,monospace"
        font-size="10" fill="${c.tagText}">${t}</text>`;
    }).join("");
  }

  const row1   = tags.slice(0, PER_ROW);
  const row2   = tags.slice(PER_ROW);
  const tagEls = fullStretchRow(row1, TAGS_Y)
    + fullStretchRow(row2, TAGS_Y + TAG_H + TAG_GAP);

  // ── Section 3: Language Composition Segmented Bar ─────────────────────────
  const SEC3_Y    = TAGS_Y + 2 * (TAG_H + TAG_GAP) + 18;
  const COMP_HEAD = SEC3_Y + 18;
  const COMP_Y    = COMP_HEAD + 14;
  const COMP_H    = 10;
  const COMP_W    = W - PAD_X * 2;

  // Build segments (rounded ends on first and last)
  let segX = PAD_X;
  const segments = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const sw   = Math.max(6, Math.round((lang.pct / 100) * COMP_W));
    const rx   = i === 0 ? 5 : (i === langs.length - 1 ? 5 : 0);
    const el   = `<rect x="${segX}" y="${COMP_Y}" width="${sw}" height="${COMP_H}"
          rx="${rx}" fill="${meta.color}" opacity="0.9"/>`;
    segX += sw;
    return el;
  }).join("\n  ");

  // Legend for the composition bar
  const LEGEND_Y = COMP_Y + COMP_H + 12;
  const legendSVG = langs.map((lang, i) => {
    const meta = LANG_META[lang.name] || LANG_META.default;
    const lx   = PAD_X + i * 130;
    if (lx + 120 > W) return "";
    return `
  <circle cx="${lx + 5}" cy="${LEGEND_Y - 3}" r="4" fill="${meta.color}"/>
  <text x="${lx + 14}" y="${LEGEND_Y}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" fill="${c.dim}">${lang.name} ${lang.pct}%</text>`;
  }).join("");

  const H = LEGEND_Y + 20;

  // ── SVG assembly ───────────────────────────────────────────────────────────
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <clipPath id="stc"><rect width="${W}" height="${H}"/></clipPath>
  <!-- Right panel subtle tint gradient (depth layer) -->
  <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%"   stop-color="${c.bgPanel}" stop-opacity="${dark ? "0.6" : "0.4"}"/>
    <stop offset="100%" stop-color="${c.bg}"       stop-opacity="0"/>
  </linearGradient>
  <!-- Column divider vertical gradient (fade-out — depth) -->
  <linearGradient id="divGrad" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0%"   stop-color="${c.accent}" stop-opacity="0.5"/>
    <stop offset="100%" stop-color="${c.accent}" stop-opacity="0"/>
  </linearGradient>
  <!-- Number glow filter (dark mode only) -->
  <filter id="numGlow" x="-30%" y="-60%" width="160%" height="220%">
    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>
<g clip-path="url(#stc)">

  <!-- ── BASE ─────────────────────────────────────────────────────────── -->
  <rect width="${W}" height="${H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <!-- ── SECTION 1: LIVE LANGUAGE ANALYSIS ────────────────────────────── -->
  <text x="${PAD_X}" y="${SEC1_Y - 10}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// LANGUAGE ANALYSIS</text>
  <line x1="${PAD_X}" y1="${SEC1_Y - 2}" x2="${W - PAD_X}" y2="${SEC1_Y - 2}"
        stroke="${c.border}" stroke-width="0.5"/>

  <!-- Right stats panel tint (depth — elevation panel) -->
  <rect x="${R_X - 10}" y="${COLS_Y - 4}" width="${CARD_W + 20}" height="${SEC1_H - COLS_Y}"
        fill="url(#panelGrad)" rx="4"/>

  <!-- Column divider (gradient fade accent line) -->
  <rect x="${BAR_COL_W + 10}" y="${SEC1_Y - 2}" width="1" height="${SEC1_H - SEC1_Y - 8}"
        fill="url(#divGrad)"/>

  <!-- Column header: left -->
  <text x="${PAD_X}" y="${COLS_Y - 4}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1.5" fill="${c.dim}">LANGUAGE</text>
  <text x="${BAR_X}" y="${COLS_Y - 4}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1.5" fill="${c.dim}">BYTE DISTRIBUTION</text>

  <!-- Column header: right -->
  <text x="${R_X}" y="${COLS_Y - 4}"
        font-family="'Courier New',Consolas,monospace"
        font-size="8.5" letter-spacing="1.5" fill="${c.dim}">REPOSITORY METRICS</text>

  <!-- Language bars (left column) -->
  ${langBarsSVG}

  <!-- Stat cards (right column) -->
  ${statCardsSVG}

  <!-- Data source badge (bottom right of sec1, opacity tier 3 — subtle provenance) -->
  <text x="${W - PAD_X}" y="${SEC1_H - 4}" text-anchor="end"
        font-family="'Courier New',Consolas,monospace"
        font-size="8" letter-spacing="1" fill="${sourceColor}" opacity="0.65">${sourceLabel}</text>

  <!-- ── SECTION 2: TECHNOLOGIES ──────────────────────────────────────── -->
  <line x1="${PAD_X}" y1="${SEC2_Y}" x2="${W - PAD_X}" y2="${SEC2_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${TAGS_HEAD}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// TECHNOLOGIES</text>
  ${tagEls}

  <!-- ── SECTION 3: LANGUAGE COMPOSITION ─────────────────────────────── -->
  <line x1="${PAD_X}" y1="${SEC3_Y}" x2="${W - PAD_X}" y2="${SEC3_Y}"
        stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${COMP_HEAD}"
        font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// COMPOSITION</text>

  <!-- Segmented composition bar -->
  <rect x="${PAD_X}" y="${COMP_Y}" width="${COMP_W}" height="${COMP_H}" rx="5"
        fill="${c.border2}"/>
  ${segments}
  <!-- Sheen overlay (depth — physical, glassy bar) -->
  <rect x="${PAD_X}" y="${COMP_Y}" width="${COMP_W}" height="4" rx="5"
        fill="white" opacity="${c.shimmer}"/>

  <!-- Bar legend -->
  ${legendSVG}

  <!-- ── LEFT ACCENT STRIP (visual rhyme — same on every card) ────────── -->
  <rect x="0" y="0" width="${STRIP_W}" height="${H}" fill="${c.accent}" opacity="0.7"/>

  <!-- Bottom border -->
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
