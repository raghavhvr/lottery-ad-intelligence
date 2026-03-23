# Lottery Ad Intelligence

AI-powered creative spec generator for lottery/raffle brands in the Middle East.
Uses **Google Gemini 1.5 Flash** (free) + **Serper.dev** (free) as Vercel serverless functions.

---

## Deploy in 4 steps

### Step 1 — Get your two free API keys

**Gemini API key**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google → click "Create API key"
3. Copy the key

**Serper.dev API key**
1. Go to https://serper.dev
2. Sign up with email — no credit card needed
3. Your key appears immediately on the dashboard
4. Free tier: 2,500 searches/month

---

### Step 2 — Push to GitHub

1. Go to https://github.com/new and create a new **private** repo named `lottery-ad-intelligence`
2. Unzip the downloaded project folder on your computer
3. Open a terminal in that folder and run:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/lottery-ad-intelligence.git
git push -u origin main
```

---

### Step 3 — Deploy on Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository** → select `lottery-ad-intelligence`
3. Vercel auto-detects Vite — leave all build settings as-is
4. **Before clicking Deploy**, click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | your Gemini key |
| `SERPER_API_KEY` | your Serper.dev key |

5. Click **Deploy**
6. In ~60 seconds you'll get a live URL like `https://lottery-ad-intelligence-xyz.vercel.app`

---

### Step 4 — Done

Open your Vercel URL. The app is live. No server to manage.

Every time you push a commit to GitHub, Vercel redeploys automatically.

---

## Updating your API keys later

Vercel dashboard → your project → **Settings** → **Environment Variables** → edit values → redeploy.

---

## Project structure

```
lottery-ad-intelligence/
├── api/
│   ├── search.js       # Serper.dev serverless function
│   └── generate.js     # Gemini serverless function
├── vercel.json         # Vercel routing config
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.module.css
    ├── index.css
    ├── lib/
    │   ├── agent.js        # Search queries + generate logic
    │   └── filters.js      # All filter definitions
    ├── hooks/
    │   ├── useFilters.js
    │   └── useStorage.js
    └── components/
        ├── FilterPills.jsx / .module.css
        ├── ResultCard.jsx  / .module.css
        ├── AgentLog.jsx    / .module.css
        └── SavedCards.jsx  / .module.css
```

---

## Extending

**Add a filter** — edit `src/lib/filters.js` only. UI picks it up automatically.

**Swap to a different model** — in `api/generate.js` replace `gemini-1.5-flash` with any model at https://ai.google.dev/models

**Free tier limits**
- Gemini: 15 req/min, 1,500 req/day, 1M tokens/day
- Serper.dev: 2,500 searches/month (each agent run uses up to 5)
- Vercel: 100GB bandwidth/month, unlimited serverless function calls on free plan
