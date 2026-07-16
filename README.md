# Daytime Sessions — Venue Finder (dynamic version)

A tiny app: a webpage with a search box, plus a small backend that holds
your Anthropic API key privately and does the search. Anyone with the
link can use it — no Claude account, no exposed key.

## 1. Get an API key
- Go to https://console.anthropic.com
- Create an API key (Settings → API Keys)
- Keep it secret — never put it in the frontend code

## 2. Deploy (easiest: Render.com, free tier)
1. Create a free account at https://render.com
2. New → Web Service → connect this folder (push it to a GitHub repo first,
   or use Render's "Deploy from folder" option if offered)
3. Build command: `npm install`
4. Start command: `npm start`
5. Add an environment variable: `ANTHROPIC_API_KEY` = your key from step 1
6. Deploy — Render gives you a live URL like `https://your-app.onrender.com`

Alternatives that work the same way: Railway.app, Fly.io, or a basic
DigitalOcean droplet. Avoid Vercel/Netlify's default setup for this one —
they're built for short-lived functions, and this uses a small persistent
Express server, so Render/Railway are the simpler fit.

## 3. Test it
Open the URL Render gives you in Safari on your phone. Type a location,
tap Find. If it works, you're done.

## 4. Add to iPhone home screen
- Open the live URL in Safari
- Tap the Share icon → "Add to Home Screen"
- It now sits on the home screen like a real app

## 5. Share with your friend
Just send them the same URL. They do the same "Add to Home Screen" step
on their own phone. Your API key stays on the server the whole time —
they never see it, and usage is billed to you, so keep an eye on usage
at console.anthropic.com if you're sharing widely.

## Files
- `server.js` — backend, holds the API key, does the search
- `public/index.html` — the frontend your friend actually sees
- `package.json` — dependencies (just Express)
