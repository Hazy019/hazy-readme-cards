/**
 * preview.mjs — Local SVG preview generator
 * Run: node preview.mjs
 * Opens: preview/index.html in your browser
 *
 * Works because Node 18+ exposes Request/Response globals
 * that match the Vercel Edge runtime API surface.
 */

import { writeFileSync, mkdirSync } from "fs";
import { createServer } from "http";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));

// ── Polyfill Request if needed (Node 18 has it natively) ──────────────────
if (typeof Request === "undefined") {
  console.error("Node 18+ required. Please upgrade Node.");
  process.exit(1);
}

// ── Dynamic imports of all handlers ───────────────────────────────────────
const { default: headerHandler }  = await import("./api/header.js");
const { default: profileHandler } = await import("./api/profile.js");
const { default: skillsHandler }  = await import("./api/skills.js");
const { default: footerHandler }  = await import("./api/footer.js");
const { default: bannerHandler }  = await import("./api/banner.js");

const handlers = [
  { name: "header",  handler: headerHandler,  label: "Header"          },
  { name: "profile", handler: profileHandler, label: "Profile / Stats"  },
  { name: "skills",  handler: skillsHandler,  label: "Skills & Stack"   },
  { name: "footer",  handler: footerHandler,  label: "Footer"           },
  { name: "banner",  handler: bannerHandler,  label: "Deploy Banner"    },
];

// ── Generate SVGs for both themes ─────────────────────────────────────────
async function getSVG(handler, theme) {
  const url = `http://localhost/api?theme=${theme}`;
  const req = new Request(url);
  const res = await handler(req);
  return await res.text();
}

console.log("\n🎨 Generating preview SVGs...\n");

const svgs = {};
for (const { name, handler } of handlers) {
  svgs[`${name}_dark`]  = await getSVG(handler, "dark");
  svgs[`${name}_light`] = await getSVG(handler, "light");
  console.log(`  ✓ ${name} (dark + light)`);
}
console.log();

// ── Build preview HTML ─────────────────────────────────────────────────────
const cardSection = (label, name) => `
  <section class="card-group">
    <h2>${label}</h2>
    <div class="theme-row">
      <div class="theme-col">
        <span class="theme-label dark-label">◉ DARK MODE</span>
        <div class="svg-wrap dark-bg">
          ${svgs[`${name}_dark`]}
        </div>
      </div>
      <div class="theme-col">
        <span class="theme-label light-label">◉ LIGHT MODE</span>
        <div class="svg-wrap light-bg">
          ${svgs[`${name}_light`]}
        </div>
      </div>
    </div>
  </section>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>hazy-readme-cards — Design Preview</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #060810;
      --surface: #0e1117;
      --border:  #1e2530;
      --text:    #e6edf3;
      --muted:   #8b949e;
      --accent:  #39d353;
      --mid:     #79c0ff;
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 48px 32px 80px;
    }

    header {
      text-align: center;
      margin-bottom: 56px;
    }

    header .badge {
      display: inline-block;
      background: #0f2a18;
      border: 1px solid #1a4a2a;
      color: var(--accent);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 2px;
      padding: 4px 12px;
      border-radius: 20px;
      margin-bottom: 16px;
    }

    header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 8px;
    }

    header p {
      color: var(--muted);
      font-size: 14px;
    }

    .card-group {
      max-width: 1900px;
      margin: 0 auto 52px;
    }

    .card-group h2 {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--muted);
      margin-bottom: 16px;
      padding-left: 4px;
    }

    .card-group h2::before { content: "// "; color: var(--accent); }

    .theme-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .theme-col { display: flex; flex-direction: column; gap: 8px; }

    .theme-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
    }

    .dark-label  { color: #39d353; }
    .light-label { color: #1a7f37; }

    .svg-wrap {
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border);
    }

    .svg-wrap svg { display: block; width: 100%; height: auto; }

    .dark-bg  { background: #0d1117; }
    .light-bg { background: #ffffff; }

    hr.divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 0 0 52px;
    }

    footer-note {
      display: block;
      text-align: center;
      color: var(--muted);
      font-size: 12px;
      margin-top: 60px;
    }
  </style>
</head>
<body>

<header>
  <div class="badge">DESIGN PREVIEW · v24</div>
  <h1>hazy-readme-cards</h1>
  <p>Light &amp; Dark · Both themes · All 4 cards</p>
</header>

${handlers.map(({ label, name }) => cardSection(label, name)).join("\n<hr class='divider'/>\n")}

<footer-note>
  hazy-readme-cards — Kyrell Santillan · Hazy019
</footer-note>

</body>
</html>`;

// ── Write file ─────────────────────────────────────────────────────────────
mkdirSync(join(__dir, "preview"), { recursive: true });
const outPath = join(__dir, "preview", "index.html");
writeFileSync(outPath, html, "utf8");

console.log(`✅  Preview written to: preview/index.html`);
console.log(`\n   Open it with:\n   start preview\\index.html\n`);
