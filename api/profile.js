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

async function fetchStats() {
  const token = (typeof process !== "undefined") ? process.env.GITHUB_TOKEN : null;

  // ==========================================
  // PATH 1: HAS TOKEN (Fully Dynamic Pro Stats)
  // ==========================================
  if (token) {
    const query = `
      query {
        user(login: "${USERNAME}") {
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
            nodes {
              stargazerCount
              languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                edges { size node { name } }
              }
            }
          }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
          }
        }
      }
    `;

    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query }),
      });

      const { data } = await res.json();
      const user = data.user;

      // Calculate Stars
      const stars = user.repositories.nodes.reduce((acc, repo) => acc + repo.stargazerCount, 0);

      // Calculate Languages by actual byte size
      const langMap = {};
      user.repositories.nodes.forEach(repo => {
        repo.languages.edges.forEach(edge => {
          langMap[edge.node.name] = (langMap[edge.node.name] || 0) + edge.size;
        });
      });

      const totalBytes = Object.values(langMap).reduce((a, b) => a + b, 0);
      const langs = Object.entries(langMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, bytes]) => ({ name, pct: Math.round((bytes / totalBytes) * 100) }));

      return {
        labels: ["Total Stars", "Commits (Year)", "Pull Requests", "Issues"],
        values: [
          stars, 
          user.contributionsCollection.totalCommitContributions, 
          user.contributionsCollection.totalPullRequestContributions, 
          user.contributionsCollection.totalIssueContributions
        ],
        langs: langs.length > 0 ? langs : [{name: "Python", pct: 100}]
      };
    } catch (e) {
      console.error("GraphQL Failed, dropping to REST API", e);
    }
  }

  // ==========================================
  // PATH 2: NO TOKEN (Dynamic Public Fallback)
  // ==========================================
  try {
    const userRes = await fetch(`https://api.github.com/users/${USERNAME}`);
    const repoRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`);
    
    const userData = await userRes.json();
    const repoData = await repoRes.json();

    const stars = repoData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
    
    // Calculate simple languages based on repo count (since bytes requires GraphQL)
    const langMap = {};
    repoData.forEach(repo => {
      if (repo.language) langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    });
    
    const totalReposWithLangs = Object.values(langMap).reduce((a, b) => a + b, 0);
    const langs = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, pct: Math.round((count / totalReposWithLangs) * 100) }));

    return {
      // If no token, we show public stats that don't get blocked by GitHub
      labels: ["Total Stars", "Public Repos", "Followers", "Following"],
      values: [stars, userData.public_repos, userData.followers, userData.following],
      langs: langs.length > 0 ? langs : [{name: "Python", pct: 100}]
    };
  } catch (e) {
    // Ultimate failsafe so your image never breaks
    return {
      labels: ["Total Stars", "Commits", "Pull Requests", "Issues"],
      values: [4, 28, 6, 8],
      langs: [{ name: "Python", pct: 50 }, { name: "CSS", pct: 50 }]
    };
  }
}

export default async function handler() {
  const [ff, stats] = await Promise.all([loadFonts(), fetchStats()]);
  
  const W = 900, H = 415;

  const statsRowsSVG = stats.labels.map((label, i) => {
    const val = stats.values[i];
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
  const langBarsSVG = stats.langs.map(({ name, pct }, i) => {
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

  <text x="24" y="44" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="3" fill="rgba(212,175,55,0.38)">ABOUT</text>
  <line x1="24" y1="53" x2="74" y2="53" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" style="filter:drop-shadow(0 0 3px rgba(255,255,255,0.65))"/>

  <text x="24" y="76" font-family="'Rajdhani',sans-serif" font-size="11" font-weight="600" letter-spacing="0.3" fill="rgba(212,175,55,0.65)">I am a graduating Computer Science student and aspiring</text>
  <text x="24" y="91" font-family="'Rajdhani',sans-serif" font-size="11" font-weight="600" letter-spacing="0.3" fill="rgba(212,175,55,0.65)">Software Engineer dedicated to building secure, high-</text>
  <text x="24" y="106" font-family="'Rajdhani',sans-serif" font-size="11" font-weight="600" letter-spacing="0.3" fill="rgba(212,175,55,0.65)">performance apps that bridge the gap between complex</text>
  <text x="24" y="121" font-family="'Rajdhani',sans-serif" font-size="11" font-weight="600" letter-spacing="0.3" fill="rgba(212,175,55,0.65)">logic and intentional UI. Currently, I am pursuing the</text>
  <text x="24" y="136" font-family="'Rajdhani',sans-serif" font-size="11" font-weight="600" letter-spacing="0.3" fill="rgba(212,175,55,0.65)">Google Cybersecurity Cert, focusing on resilient frameworks.</text>
  <text x="24" y="151" font-family="'Rajdhani',sans-serif" font-size="11" font-weight="600" letter-spacing="0.3" fill="rgba(212,175,55,0.65)">Experience includes DTI systems and Cyberthon competition.</text>
  
  <text x="24" y="178" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" fill="rgba(212,175,55,0.5)"><tspan fill="rgba(212,175,55,0.35)">›</tspan>  Figma · UI Design · Responsive CSS</text>
  <text x="24" y="196" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" fill="rgba(212,175,55,0.5)"><tspan fill="rgba(212,175,55,0.35)">›</tspan>  Next.js · React · Flask · PostgreSQL</text>
  <text x="24" y="214" font-family="'Rajdhani',sans-serif" font-size="12" font-weight="600" fill="rgba(212,175,55,0.5)"><tspan fill="rgba(212,175,55,0.35)">›</tspan>  CyberSecurity Fundamentals · UTC+8</text>
  
  <rect x="476" y="18" width="400" height="196" rx="8" fill="rgba(10,8,0,0.82)" stroke="rgba(212,175,55,0.2)" stroke-width="1"/>
  <line x1="491" y1="18" x2="861" y2="18" stroke="rgba(212,175,55,0.5)" stroke-width="1"/>

  <text x="498" y="46" font-family="'Orbitron',monospace" font-size="10" font-weight="900" letter-spacing="2" fill="rgba(212,175,55,0.38)">GITHUB STATS</text>
  <line x1="498" y1="56" x2="858" y2="56" stroke="rgba(212,175,55,0.1)" stroke-width="0.5"/>

  ${statsRowsSVG}

  <line x1="24" y1="232" x2="${W - 24}" y2="232" stroke="rgba(212,175,55,0.07)" stroke-width="0.8"/>

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
