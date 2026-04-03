# Content OS

An AI-powered content creation tool for creators and marketers. Generates video scripts, carousels, lead magnets, text posts, and newsletters — all in your voice, for your audience.

Built with React + Vite. Powered by the Anthropic API.

---

## What it does

- **Video scripts** — structured with Hook, Agitate, Value, Proof, CTA sections
- **Carousels** — 5 styles: branded dark, news editorial, stats/data, step-by-step, quotes. Downloads as 1080×1080 PNGs ready to post
- **Lead magnets** — downloadable assets tied to your comment trigger keyword
- **LinkedIn text posts** — adapted from your script, downloadable as PNG or TXT
- **Weekly newsletter** — 5 items with your honest take, ready to paste into Beehiiv
- **Download everything** — scripts as PNG or TXT, carousels as PNG, newsletter as TXT

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/content-os.git
cd content-os
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Anthropic API key

Get your key at console.anthropic.com → API Keys → Create Key. Add $10 credit to start (~1 month of use at 5 posts/week).

**Option A — Local .env file:**

Create a file called `.env.local` in the root:

```
VITE_ANTHROPIC_KEY=sk-ant-your-key-here
```

**Option B — In-app key input:**

Open the app, click the key icon top right, paste your key. Stored in browser session only — never saved anywhere.

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:5173

---

## Deploy to Vercel (free, permanent URL)

1. Push this repo to GitHub
2. Go to vercel.com → Add New Project → Import your repo
3. Vercel auto-detects Vite — click Deploy
4. Add your API key: Settings → Environment Variables → name: VITE_ANTHROPIC_KEY, value: sk-ant-...
5. Redeploy → your app is live

---

## File structure

```
content-os/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    └── App.jsx
```

---

## How to use

1. Open the app
2. Go to the Profile tab — fill in your name, role, niche, audience, voice, and rules
3. Add your Anthropic API key
4. Pick a day, pick a content type, optionally enter a topic
5. Click Generate on any section
6. Edit, revise, or download

---

## Sharing with others

No personal details are hardcoded anywhere. Anyone can use this app with their own API key and their own profile. To share: deploy to Vercel and send the URL.

---

## Tech stack

- React 18 + Vite 5
- Anthropic API (claude-sonnet-4-20250514) with live web search
- Canvas API for carousel PNG generation
- No other dependencies

---

## API cost

Approximately $8–12/month at 5 posts per week. Pay-as-you-go.
