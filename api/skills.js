export const config = { runtime: "edge" };

const USERNAME = "Hazy019";

// Dictates clean display naming conventions for raw GitHub topic strings
const TOPIC_MAP = {
  "typescript": "TypeScript",
  "python": "Python",
  "nextjs": "Next.js",
  "react": "React",
  "tailwindcss": "Tailwind",
  "flask": "Flask",
  "postgresql": "PostgreSQL",
  "pyqt6": "PyQt6",
  "figma": "Figma",
  "git": "Git",
  "cybersecurity": "CyberSec",
  "javascript": "JavaScript",
  "html": "HTML",
  "css": "CSS"
};

// Fallback stack if API limits or network issues occur
const FALLBACK_TAGS = ["Python", "Next.js", "React", "Tailwind", "Flask", "PostgreSQL", "Figma", "Git", "CyberSec", "TypeScript", "JavaScript", "CSS", "HTML"];

export default async function handler(req) {
  const dark = new URL(req.url).searchParams.get("theme") !== "light";

  // ── Design Tokens (Mirrors header.js and profile.js exactly) ──────────────
  const c = dark
    ? {
        bg:      "#0a0c10",
        text:    "#e6edf3",
        muted:   "#8b949e",
        dim:     "#6e7681",
        border:  "#30363d",
        border2: "#21262d",
        accent:  "#39d353",
        tagBg:   "#12151b",
        tagText: "#8b949e",
        tagBdr:  "#30363d",
      }
    : {
        bg:      "#fcfbf9",
        text:    "#1a1a1a",
        muted:   "#57606a",
        dim:     "#8c959f",
        border:  "#e5e1d8",
        border2: "#d4cdbc",
        accent:  "#16a34a",
        tagBg:   "#f5f2eb",
        tagText: "#57606a",
        tagBdr:  "#e5e1d8",
      };

  const W = 900;
  const PAD_X = 28; // Standardized grid padding
  const STRIP_W = 3;

  // ── Automated Data Pipeline ───────────────────────────────────────────────
  let displayTags = [];
  let dataSource = "LIVE · Topics Engine";

  try {
    const token = typeof globalThis !== "undefined" && globalThis.GITHUB_TOKEN;
    const hdrs = { 
      "User-Agent": "hazy-skills-engine/3.0", 
      Accept: "application/vnd.github.v3+json",
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=60&type=owner`, { headers: hdrs });
    
    if (!res.ok) throw new Error("API_LIMIT_OR_ERROR");
    
    const repos = await res.json();
    
    if (Array.isArray(repos)) {
      const topicCounts = {};
      
      // Extract and tally topics across all active repositories
      repos.forEach(repo => {
        if (repo.topics && Array.isArray(repo.topics)) {
          repo.topics.forEach(t => {
            const normalized = t.toLowerCase();
            topicCounts[normalized] = (topicCounts[normalized] || 0) + 1;
          });
        }
      });

      // Sort tags based on frequency of occurrence in codebases
      const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => TOPIC_MAP[topic] || topic.charAt(0).toUpperCase() + topic.slice(1));

      // Merge with map definitions to clean up missing items, keeping unique entries
      displayTags = [...new Set([...sortedTopics, ...Object.values(TOPIC_MAP)])].slice(0, 14);
    }
  } catch (err) {
    displayTags = FALLBACK_TAGS;
    dataSource = "CACHED · System Fallback";
  }

  if (!displayTags || displayTags.length === 0) {
    displayTags = FALLBACK_TAGS;
  }

  // ── Layout Calculations ────────────────────────────────────────────────────
  const TAG_H = 26;
  const TAG_GAP = 8;
  const PER_ROW = Math.ceil(displayTags.length / 2); // Dynamically balancing grid rows

  const HDR_Y = 22;
  const GRID_START_Y = HDR_Y + 20;

  // Generates fluid rows that expand to full width smoothly
  function generateFlexibleRow(items, yPos) {
    const n = items.length;
    const totalGaps = TAG_GAP * (n - 1);
    const usableWidth = W - (PAD_X * 2);
    const itemWidth = Math.floor((usableWidth - totalGaps) / n);

    return items.map((tag, i) => {
      const x = PAD_X + i * (itemWidth + TAG_GAP);
      return `
  <rect x="${x}" y="${yPos}" width="${itemWidth}" height="${TAG_H}" rx="4"
        fill="${c.tagBg}" stroke="${c.tagBdr}" stroke-width="0.5"/>
  <circle cx="${x + 12}" cy="${yPos + 13}" r="2.5" fill="${c.accent}" opacity="0.6"/>
  <text x="${x + 22 + (itemWidth - 22) / 2}" y="${yPos + 16.5}" text-anchor="middle"
        font-family="'Courier New', Consolas, monospace"
        font-size="10.5" font-weight=\"700\" fill="${c.tagText}">${tag}</text>`;
    }).join("");
  }

  const row1 = generateFlexibleRow(displayTags.slice(0, PER_ROW), GRID_START_Y);
  const row2 = generateFlexibleRow(displayTags.slice(PER_ROW), GRID_START_Y + TAG_H + TAG_GAP);

  const FINAL_H = GRID_START_Y + (2 * TAG_H) + TAG_GAP + 24;

  // ── SVG Canvas Output ──────────────────────────────────────────────────────
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${FINAL_H}" viewBox="0 0 ${W} ${FINAL_H}">
<defs>
  <clipPath id=\"cardClip\"><rect width="${W}" height="${FINAL_H}"/></clipPath>
</defs>
<g clip-path="url(#cardClip)">

  <rect width="${W}" height="${FINAL_H}" fill="${c.bg}"/>
  <rect width="${W}" height="0.5" fill="${c.border}"/>

  <text x="${PAD_X}" y="${HDR_Y}"
        font-family="'Courier New', Consolas, monospace"
        font-size="9" font-weight="700" letter-spacing="2" fill="${c.dim}">// AUTOMATED TECH STACK DEPLOYMENT</text>
  
  <text x="${W - PAD_X}" y="${HDR_Y}" text-anchor="end"
        font-family="'Courier New', Consolas, monospace"
        font-size="8" font-weight="700" fill="${dark ? c.accent : c.muted}" opacity="0.7">${dataSource}</text>

  <line x1="${PAD_X}" y1="${HDR_Y + 8}" x2="${W - PAD_X}" y2="${HDR_Y + 8}" stroke="${c.border}" stroke-width="0.5"/>

  ${row1}
  ${row2}

  <rect x="0" y="0" width="${STRIP_W}" height="${FINAL_H}" fill="${c.accent}" opacity="0.7"/>
  <rect y="${FINAL_H - 1}" width="${W}" height="1" fill="${c.border}"/>

</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800",
    },
  });
}
