export const config = { runtime: "edge" };

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design tokens ──────────────────────────────────────────────────────────
  const c = dark
    ? {
      bg: "#0a0c10",
      text: "#e6edf3",
      muted: "#8b949e",
      dim: "#6e7681",
      border: "#30363d",
      border2: "#21262d",
      accent: "#39d353",
      accentD: "#238636",
      mid: "#79c0ff",
      tagBg: "#12151b",
      tagText: "#8b949e",
      tagBdr: "#30363d",
    }
    : {
      bg: "#fcfbf9",
      text: "#1a1a1a",
      muted: "#57606a",
      dim: "#8c959f",
      border: "#e5e1d8",
      border2: "#d4cdbc",
      accent: "#16a34a",
      accentD: "#15803d",
      mid: "#0550ae",
      tagBg: "#f5f2eb",
      tagText: "#57606a",
      tagBdr: "#e5e1d8",
    };

  const STRIP_W = 3;  
  const W = 900;
  const PAD_X = 28;

  // ── DYNAMIC GITHUB FETCH ───────────────────────────────────────────────────
  let topLanguages = [];
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`, // <-- MATCHES YOUR VERCEL ENVIRONMENT VARIABLE
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            viewer {
              repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
                nodes {
                  languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                    edges {
                      size
                      node {
                        name
                        color
                      }
                    }
                  }
                }
              }
            }
          }
        `
      })
    });

    const json = await response.json();
    const repos = json.data?.viewer?.repositories?.nodes || [];
    
    const langMap = {};
    let totalSize = 0;

    repos.forEach(repo => {
      repo.languages?.edges?.forEach(edge => {
        const name = edge.node.name;
        const size = edge.size;
        totalSize += size;
        if (!langMap[name]) {
          langMap[name] = { name, size, color: edge.node.color || c.accent };
        } else {
          langMap[name].size += size;
        }
      });
    });

    topLanguages = Object.values(langMap)
      .sort((a, b) => b.size - a.size)
      .slice(0, 4)
      .map(lang => ({
        name: lang.name,
        pct: totalSize > 0 ? Math.round((lang.size / totalSize) * 100) : 0,
        color: lang.color
      }));
  } catch (err) {
    console.error("Failed fetching live stats, rolling back to fallback placeholders", err);
    topLanguages = [
      { name: "TypeScript", pct: 45, color: "#3178c6" },
      { name: "Python", pct: 30, color: "#3572A5" },
      { name: "JavaScript", pct: 15, color: "#f1e05a" },
      { name: "CSS", pct: 10, color: "#563d7c" }
    ];
  }

  if (topLanguages.length === 0) {
    topLanguages = [{ name: "No Repository Data", pct: 100, color: c.dim }];
  }

  // ── RENDER DYNAMIC DATA ────────────────────────────────────────────────────
  const LABEL_W = 110;
  const BAR_X = PAD_X + LABEL_W + 15;
  const BAR_MAX_W = W - BAR_X - PAD_X - 45; 

  let barsSVG = "";
  topLanguages.forEach((lang, i) => {
    const y = 56 + (i * 28);
    const pixelWidth = (lang.pct / 100) * BAR_MAX_W;

    barsSVG += `
      <rect x="${PAD_X}" y="${y - 14}" width="${W - (PAD_X * 2)}" height="22" rx="3" fill="${c.bg}" opacity="0.1"/>
      <text x="${PAD_X + LABEL_W}" y="${y}" text-anchor="end"
            font-family="monospace" font-size="12" font-weight="700" fill="${c.text}">${lang.name}</text>
      <rect x="${BAR_X}" y="${y - 9}" width="${BAR_MAX_W}" height="10" rx="2" fill="${dark ? c.border2 : c.border}"/>
      <rect x="${BAR_X}" y="${y - 9}" width="${pixelWidth}" height="10" rx="2" fill="${lang.color}"/>
      <text x="${BAR_X + BAR_MAX_W + 12}" y="${y}"
            font-family="'Courier New',Consolas,monospace" font-size="11" font-weight="bold" fill="${c.muted}">${lang.pct}%</text>
    `;
  });

  const DynamicHeight = 85 + (topLanguages.length * 28);
  const SEP_Y = DynamicHeight + 10;
  const LABEL_Y = SEP_Y + 24;
  const TAGS_Y = LABEL_Y + 16;

  const tags = ["Next.js 16", "React 19", "FastAPI", "Tailwind v4", "AWS Lambda", "FFmpeg", "CyberSecurity"];
  
  let tagEls = "";
  let currentX = PAD_X;
  let currentY = TAGS_Y;

  tags.forEach((tag) => {
    const approxCharWidth = 7.2;
    const paddingX = 14;
    const boxW = Math.round((tag.length * approxCharWidth) + paddingX);
    
    if (currentX + boxW > W - PAD_X) {
      currentX = PAD_X;
      currentY += 28;
    }

    tagEls += `
      <rect x="${currentX}" y="${currentY}" width="${boxW}" height="20" rx="4" fill="${c.tagBg}" stroke="${c.tagBdr}" stroke-width="0.5"/>
      <text x="${currentX + (boxW / 2)}" y="${currentY + 13}" text-anchor="middle"
            font-family="'Courier New',Consolas,monospace" font-size="10.5" font-weight="700" fill="${c.tagText}">${tag}</text>
    `;
    currentX += boxW + 8;
  });

  const FINAL_H = currentY + 36;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${FINAL_H}" viewBox="0 0 ${W} ${FINAL_H}">
<defs>
  <clipPath id="bc"><rect width="${W}" height="${FINAL_H}" rx="8"/></clipPath>
</defs>
<g clip-path="url(#bc)">
  <rect width="${W}" height="${FINAL_H}" fill="${c.bg}"/>
  <rect x="0" y="0" width="${W}" height="${FINAL_H}" fill="none" stroke="${c.border}" stroke-width="1" opacity="0.3"/>

  <text x="${PAD_X}" y="20" font-family="'Courier New',Consolas,monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// AUTOMATED REPO LANGUAGES PROFILE</text>
  <line x1="${PAD_X}" y1="24" x2="${W - PAD_X}" y2="24" stroke="${c.border}" stroke-width="0.5"/>

  <text x="${PAD_X + LABEL_W}" y="40" text-anchor="end" font-family="'Courier New',Consolas,monospace" font-size="9" fill="${c.dim}">CORE CORE</text>
  <text x="${BAR_X}" y="40" font-family="'Courier New',Consolas,monospace" font-size="9" fill="${c.dim}">GIT PROFILE DISTRIBUTION</text>

  ${barsSVG}

  <line x1="${PAD_X}" y1="${SEP_Y}" x2="${W - PAD_X}" y2="${SEP_Y}" stroke="${c.border}" stroke-width="0.5"/>
  <text x="${PAD_X}" y="${LABEL_Y}" font-family="'Courier New',Consolas,monospace" font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// CORE STACK DEPLOYMENTS</text>

  ${tagEls}

  <rect x="0" y="0" width="${STRIP_W}" height="${FINAL_H}" fill="${c.accent}" opacity="0.7"/>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=600",
    },
  });
}
