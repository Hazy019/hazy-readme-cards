# Hazy Readme Cards

A collection of dynamic, terminal-inspired SVG cards designed to build a striking, cohesive GitHub profile README. Powered by Vercel Edge Functions, these cards render instantly and provide live stats, animated headers, and a unified design system.

## Features

* **Terminal Aesthetic**: A consistent, hacker/developer-focused design with micro-typography, terminal dots, and cohesive visual rhymes.
* **Light & Dark Mode**: Fully responsive to GitHub's theme settings. Uses dynamic coloring based on `?theme=light` or `?theme=dark` parameters.
* **Live GitHub Stats**: Automatically fetches and caches your total stars, commits, pull requests, issues, and top languages.
* **Animated Elements**: Includes SMIL animations like typing effects in the header and pulsing status dots.
* **Edge Optimized**: Built on Vercel Edge Functions for zero-cold-start, lightning-fast rendering.

## Live Preview & Usage

To use these cards in your own GitHub `README.md`, you can host the project on your own Vercel account or use your deployed URL.

*(Note: Replace `https://your-deployment-url.vercel.app` with your actual Vercel project URL).*

### 1. Header Card
Features an animated typing effect, a simulated terminal window, and your role/location details.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/header?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/header?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/header?theme=dark" alt="Header">
  </picture>
</div>
```

### 2. Profile & GitHub Stats Card
Displays a short "About Me" section on the left and live GitHub statistics (Stars, Commits, PRs, Issues) on the right.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/profile?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/profile?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/profile?theme=dark" alt="Profile and Stats">
  </picture>
</div>
```

### 3. Skills & Stack Card
Visualizes your proficiency in various technologies using physical-sheen progress bars and a grid of technology badges.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/skills?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/skills?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/skills?theme=dark" alt="Skills and Tech Stack">
  </picture>
</div>
```

### 4. Footer / Links Card
A sleek footer for your social and professional links, featuring a pulsing "Open For Work" (OFW) indicator.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/footer?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/footer?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/footer?theme=dark" alt="Footer Links">
  </picture>
</div>
```

### 5. Banner Card
A minimal call-to-action banner.

```markdown
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://your-deployment-url.vercel.app/api/banner?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://your-deployment-url.vercel.app/api/banner?theme=light">
    <img src="https://your-deployment-url.vercel.app/api/banner?theme=dark" alt="Banner">
  </picture>
</div>
```

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hazy019/hazy-readme-cards.git
   cd hazy-readme-cards
   ```

2. **Install Vercel CLI (if not already installed):**
   ```bash
   npm i -g vercel
   ```

3. **Run the local development server:**
   ```bash
   vercel dev
   ```
   *The server will start, usually at `http://localhost:3000`.*

4. **Environment Variables (Optional but recommended):**
   For the `api/profile.js` card to fetch GitHub stats reliably without hitting rate limits, you should set a `GITHUB_TOKEN` environment variable.
   Create a `.env` file in the root:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token_here
   ```

## Deployment

This project is configured to deploy directly to Vercel as Edge Functions.

1. Push your code to a GitHub repository.
2. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New... > Project**.
3. Import your GitHub repository.
4. **Important:** Under Environment Variables, add your `GITHUB_TOKEN` so the profile stats can be fetched via the GitHub GraphQL/REST APIs.
5. Click **Deploy**.

## Customization

To personalize the cards for your own profile, you will need to edit the source files in the `api/` directory:

*   **`api/header.js`**: Update the `Kyrell Santillan` text, your roles, and the animated typing sentences in the `lines` array.
*   **`api/profile.js`**: Change the `USERNAME` constant at the top of the file to your GitHub username. Update the `ABOUT_LINES` array with your own bio. Update the location and status tags.
*   **`api/skills.js` / `api/stack.js`**: Update the `skills` array with your proficiency percentages and the `tags` array with your technology stack.
*   **`api/footer.js`**: Update the `LINKS` array with your own URLs and update the brand name at the bottom right.

## License

This project is open-source and available under the MIT License. Feel free to fork, customize, and use it for your own GitHub profile!
