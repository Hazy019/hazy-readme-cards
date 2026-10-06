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

## 🌟 Overview & Architecture

### What is this?
**Hazy Readme Cards** turns your GitHub profile into a live, interactive hacker terminal. Instead of embedding static images that get outdated, this project provides a set of **serverless API endpoints** that generate dynamic, crisp SVG cards in real-time.

### How it works under the hood (in plain English)
Even if you are a developer, here is the quick mental model of what happens when someone visits your GitHub profile:

```
+------------------+         1. Requests Image URL         +-----------------------------+
|  GitHub Profile  |  ==================================>  |     Vercel Edge Function    |
| (Your README.md) |                                       |      (e.g., /api/profile)   |
+------------------+                                       +-----------------------------+
         ^                                                                |
         |                                                                | 2. Fetches Live Stats
         |                                                                |    (uses GITHUB_TOKEN)
         |                                                                v
         |               4. Sends Crisp SVG Vector Image   +-----------------------------+
         +================================================ |       GitHub GraphQL &      |
                                                           |           REST APIs         |
                                                           +-----------------------------+
```

1. **GitHub requests the image**: When someone loads your GitHub profile, the browser / GitHub image proxy requests an image from your Vercel URL (e.g. `https://your-app.vercel.app/api/profile?theme=dark`).
2. **Vercel runs code at the edge**: Vercel executes a lightweight JavaScript function located in the `/api` directory.
3. **Pulls real-time data**: The function securely calls GitHub's official APIs to fetch your latest commit count, total stars, pull requests, and top languages.
4. **Draws and returns an SVG**: The function assembles a handcrafted SVG card with terminal typography, syntax highlighting, and animations, returning it as a vector image (`image/svg+xml`).
5. **Auto Dark / Light Mode**: By using GitHub's `<picture>` and `<source media="(prefers-color-scheme: ...)">` tags, GitHub automatically switches between dark and light themes depending on each visitor's system preferences.

---

## 🚀 Step-by-Step Setup Guide

Follow these 5 steps to deploy your personal terminal cards in under 5 minutes.

### Step 1: Fork or Clone This Repository
Click the **Fork** button in the top-right corner of this repository to create your own copy under your GitHub account.

---

### Step 2: Create a GitHub Personal Access Token (PAT)

#### ❓ Why do we need this secret key?
1. **Bypass GitHub Rate Limits**: Without a token, GitHub strictly limits unauthenticated API requests to **60 requests per hour per IP address**. Because Vercel functions share server IP pools, your cards will quickly hit rate limits and fail to load (`403 Rate Limit Exceeded`). With a personal access token, your limit increases to **5,000 requests per hour**.
2. **Access Real-Time Contributions & GraphQL**: GitHub requires an authenticated token to query the GraphQL API for accurate annual commits, PRs, and language breakdown statistics.

> [!NOTE]
> **Is your token safe?**
> Yes. Your token is stored encrypted in Vercel's private environment variables. It runs purely on the server/edge backend and is **never** exposed to the browser, public web, or generated SVG output.

#### 🛠️ How to generate your token:
1. Go to your GitHub [Personal Access Tokens (Classic)](https://github.com/settings/tokens) page:
   - Click your profile photo (top right) → **Settings** → **Developer settings** (bottom of left sidebar) → **Personal access tokens** → **Tokens (classic)**.
   - Or open this direct link: **[Generate New Token (Classic)](https://github.com/settings/tokens/new)**.
2. Fill in the token details:
   - **Note**: `Hazy Readme Cards Token`
   - **Expiration**: Select `No expiration` (or your preferred duration).
   - **Select scopes**:
     - [x] `read:user` (to read your profile data)
     - [x] `repo` (to calculate repository stars, languages, and commit stats across your repos)
3. Scroll to the bottom and click **Generate token**.
4. **Copy the generated token** (starts with `ghp_...`). *Save it temporarily—GitHub will not display it again.*

---

### Step 3: Deploy to Vercel

[Vercel](https://vercel.com) hosts the serverless functions for free on their Hobby tier.

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and log in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Find your forked `hazy-readme-cards` repository and click **Import**.
4. Keep the default settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build and Output Settings**: Leave as default (no build command needed).

---

### Step 4: Add Environment Variables in Vercel

Before clicking Deploy (or under **Settings → Environment Variables** if already imported):

Add the following two environment variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | `ghp_yourCopiedTokenHere` | Your GitHub Personal Access Token generated in Step 2. |
| `GITHUB_USERNAME` | `your-github-username` | Your GitHub login handle (e.g. `LinkHAckerman`). |

Click **Deploy**.

---

### Step 5: Copy Your Deployed URL

Once deployment finishes, Vercel gives you a public domain (e.g., `https://hazy-readme-cards-yourname.vercel.app`).

Test it immediately in your browser:
```
https://your-deployment-url.vercel.app/api/header?theme=dark
https://your-deployment-url.vercel.app/api/profile?theme=dark
```
If you see the terminal card SVG rendered in your browser, your deployment is live and working! 🎉

---

## 🎴 Card Catalog & Profile README Snippets

Copy and paste these snippets into your GitHub Profile `README.md` (the special repository matching your GitHub username, e.g. `username/username`).

> [!IMPORTANT]
> Replace every instance of `https://your-deployment-url.vercel.app` with your actual Vercel project domain!

### 1. Animated Header Card
Displays your name, primary roles, location badge, and an animated terminal typing sequence.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/header?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/header?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/header?theme=dark" alt="Header Card" width="100%">
  </picture>
</div>
```

---

### 2. Profile & Live GitHub Stats Card
Showcases your personal bio, engineering focus, and live GitHub commit counter, stars, PRs, and top languages.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/profile?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/profile?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/profile?theme=dark" alt="Profile & Stats Card" width="100%">
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
    <img src="https://your-deployment-url.vercel.app/api/skills?theme=dark" alt="Skills & Stack Card" width="100%">
  </picture>
</div>
```

---

### 4. Interactive Footer Links Card
Provides visual social and portfolio links styled as terminal pills alongside a live pulsing `Open For Work` indicator.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/footer?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/footer?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/footer?theme=dark" alt="Footer Links Card" width="100%">
  </picture>
  <br>
  <!-- GitHub markdown link badges for instant clickability -->
  <p>
    <a href="https://linkedin.com/in/your-handle"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"/></a>
    <a href="https://github.com/your-username"><img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/></a>
    <a href="https://discord.gg/your-invite"><img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white"/></a>
    <a href="https://your-website.com"><img src="https://img.shields.io/badge/Website-16A34A?style=for-the-badge&logo=googlechrome&logoColor=white"/></a>
  </p>
</div>
```

---

## ⚙️ Customization Guide

All cards are simple, modular JavaScript files located in `/api`. Edit them directly in your repository to personalize your content:

| Endpoint File | What You Can Customize |
| :--- | :--- |
| [`api/header.js`](api/header.js) | Change your displayed display name, terminal title bar (`~/your-name`), role subtitle, and animated typing messages in the `LINES` array. |
| [`api/profile.js`](api/profile.js) | Personalize the `ABOUT_LINES` bio paragraphs, custom bullet points, or override the default username. |
| [`api/skills.js`](api/skills.js) | Modify skill progress bars (`skills` array with percentage and tier) and tech stack tags (`tags` array). |
| [`api/footer.js`](api/footer.js) | Update your social media handles and external URLs in the `LINKS` array. |
| [`api/banner.js`](api/banner.js) | Minimal one-line terminal banner card. |

Whenever you push changes to your `main` branch on GitHub, Vercel automatically redeploys your updates within seconds!

---

## 🛠️ Local Development & Instant Preview

You do not need to push to Vercel just to see your design tweaks. This repository includes a zero-dependency local preview generator:

### 1. Clone your repository
```bash
git clone https://github.com/your-username/hazy-readme-cards.git
cd hazy-readme-cards
```

### 2. Generate the local preview
```bash
node preview.mjs
```

### 3. Open in browser
```bash
# Windows
start preview/index.html

# macOS
open preview/index.html

# Linux
xdg-open preview/index.html
```

The script renders all dark and light mode cards side-by-side in `preview/index.html`.

---

## ❓ Frequently Asked Questions & Troubleshooting

<details>
<summary><strong>1. Why are my GitHub stats showing fallback / default numbers?</strong></summary>

- **Missing or expired GITHUB_TOKEN**: Verify that `GITHUB_TOKEN` is properly set in your Vercel Project Settings → Environment Variables.
- **Missing Token Scopes**: Make sure your token has both `read:user` and `repo` scopes checked.
- **Token Redeployment**: When adding or updating environment variables in Vercel, you must trigger a **Redeploy** (Deployments tab → click `...` on latest deployment → **Redeploy**) for the new variables to take effect.
- **Incorrect Username**: Check that `GITHUB_USERNAME` matches your exact GitHub handle (case-insensitive).
</details>

<details>
<summary><strong>2. I updated my cards, but GitHub still shows the old images. Why?</strong></summary>

GitHub uses an internal proxy service called **Camo** to cache all external images in markdown files.
- Camo caches images for a period of time to optimize page load speeds.
- To bypass GitHub's cache and verify immediate changes, open your Vercel URL directly in a new private browser tab:
  `https://your-deployment-url.vercel.app/api/header?theme=dark&v=1`
- You can also add a cache-busting query parameter in your README snippet, like `?theme=dark&t=1`.
</details>

<details>
<summary><strong>3. Why don't the links inside the SVG footer open when clicked on GitHub?</strong></summary>

GitHub's markdown renderer sanitizer wraps all embedded SVGs inside static `<img>` or `<picture>` elements for security reasons, disabling interactive SVG `<a href>` links. To solve this, our footer snippet includes standard Shields.io markdown link badges right below the card so visitors can click your links seamlessly.
</details>

<details>
<summary><strong>4. Is Vercel free for this project?</strong></summary>

Yes! Vercel's Hobby (free) tier includes 100,000 Edge Function executions per day, which is more than enough for personal GitHub profile cards.
</details>

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<div align="center">
  <sub>Built with care by <a href="https://github.com/Hazy019">Kyrell Santillan</a></sub>
</div>
