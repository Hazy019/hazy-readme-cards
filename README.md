<div align="center">

  <h1>⚡ Hazy Readme Cards</h1>

  <p><strong>Dynamic, terminal-inspired SVG cards engineered to build a striking, cohesive GitHub Profile README.</strong></p>

  <p>
    <a href="https://vercel.com"><img src="https://img.shields.io/badge/Vercel-Edge_Functions-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Edge"></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node 18+"></a>
    <a href="#-theme-support"><img src="https://img.shields.io/badge/Theme-Auto_Light_%26_Dark-39d353?style=for-the-badge" alt="Theme Support"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License"></a>
  </p>

</div>

---

## 🌟 Overview

**Hazy Readme Cards** is a design system and serverless API built for developers who want a sleek, modern terminal aesthetic for their GitHub profile. Each card renders pure SVG directly from Vercel Edge Functions, delivering zero cold-start latency, crisp typography, and automatic dark/light theme switching based on user preferences.

### Key Highlights

* 🖥️ **Terminal Micro-Aesthetic**: Clean visual hierarchy featuring simulated zsh header controls, status indicators, and subtle glowing stats.
* 🌗 **Native Theme Switching**: Powered by GitHub `<picture>` tags with `(prefers-color-scheme: dark)` and `(prefers-color-scheme: light)` support.
* 📊 **Live GitHub Statistics**: Real-time integration with GitHub's GraphQL and REST APIs to fetch stars, annual commits, PRs, and top language distributions.
* ⚡ **Edge Optimized**: Lightweight Vercel Edge Functions with smart HTTP caching headers for instant rendering.
* 🤝 **Human-Centered Engineering**: Designed to present your professional identity, software architecture philosophy, and technical stack with clarity and warmth.

---

## 🎴 Card Catalog & Snippets

Copy and paste the markdown snippets below into your GitHub profile `README.md`. Replace `https://your-deployment-url.vercel.app` with your deployed Vercel domain.

### 1. Animated Header Card
Displays your name, primary engineering roles, location badge, and an animated rotating terminal typing sequence.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/header?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/header?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/header?theme=dark" alt="Kyrell Santillan — Header Card" width="100%">
  </picture>
</div>
```

---

### 2. Profile & Live GitHub Stats Card
Showcases your personal engineering philosophy, background, core tech stack, live GitHub commit counter, star count, and pull requests.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/profile?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/profile?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/profile?theme=dark" alt="Kyrell Santillan — Profile & Stats Card" width="100%">
  </picture>
</div>
```

---

### 3. Skills & Technology Stack Card
Visualizes technical skill proficiency with physical sheen progress bars and a full-width grid of technology badges.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/skills?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/skills?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/skills?theme=dark" alt="Kyrell Santillan — Skills & Stack Card" width="100%">
  </picture>
</div>
```

---

### 4. Interactive Footer Links Card
Provides visual social and portfolio links styled as terminal pills alongside a live pulsing `Open For Work` status indicator.

> [!NOTE]
> **GitHub Link Interactivity**: When SVG images are embedded in GitHub READMEs via `<img>` or `<picture>` tags, browser security rules treat them as static images and disable internal SVG `<a href>` links. To provide instant, clickable social buttons on your GitHub profile, pair the footer card with markdown link badges as shown below:

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/footer?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/footer?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/footer?theme=dark" alt="Kyrell Santillan — Footer Links Card" width="100%">
  </picture>
  <br>
  <p>
    <a href="https://linkedin.com/in/kyrell-santillan"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/></a>
    <a href="https://github.com/Hazy019"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/></a>
    <a href="https://discord.gg/Hazy019"><img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"/></a>
    <a href="https://hazy.codedevs.com"><img src="https://img.shields.io/badge/Website-16A34A?style=for-the-badge&logo=googlechrome&logoColor=white"/></a>
  </p>
</div>
```

---

## 🛠️ Local Development & Preview Generator

This project includes a local HTML preview generator that renders both **Dark Mode** and **Light Mode** SVG outputs side-by-side in your browser without requiring a full server setup.

### 1. Clone the repository
```bash
git clone https://github.com/Hazy019/hazy-readme-cards.git
cd hazy-readme-cards
```

### 2. Generate Local HTML Design Preview
```bash
node preview.mjs
```
> This script executes the Edge function handlers locally and generates a rendered preview at `preview/index.html`.

### 3. Open preview in browser
```bash
# On Windows PowerShell / Command Prompt
start preview/index.html
```

---

## ⚙️ Customization Guide

Customizing the cards for your own profile is straightforward:

| File | Customization Target |
| :--- | :--- |
| `api/header.js` | Change name, role line, status badge, and animated typing sentences (`LINES` array). |
| `api/profile.js` | Set `USERNAME` constant, update the bio text in `ABOUT_LINES`, status tags (`CS Graduate`), and skills bullets. |
| `api/skills.js` | Adjust skill proficiency percentages, mastery tiers (`expert`, `strong`, `growing`), and technology tags. |
| `api/footer.js` | Update social media links (`LINKS` array), portfolio URLs, and brand text. |

---

## 🚀 One-Click Vercel Deployment

Deploy your own instance of Hazy Readme Cards to Vercel in seconds:

1. Fork or push this repository to your GitHub account.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and select **Add New Project**.
3. Import your repository.
4. *(Recommended)* Set an Environment Variable in Vercel:
   * **Key**: `GITHUB_TOKEN`
   * **Value**: Your Personal Access Token (PAT) with `read:user` and `repo` scope to bypass GitHub API rate limits.
5. Click **Deploy**.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<div align="center">
  <sub>Built with care by <a href="https://github.com/Hazy019">Kyrell Santillan</a></sub>
</div>
