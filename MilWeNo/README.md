# SkyCast — Weather PWA

A progressive web app that gathers and presents weather data with smart desktop notifications.

## Features
- 🔍 Search any city, region, or country
- 🌡️ Current conditions, hourly & 7-day forecast
- 🔔 Desktop notifications for:
  - Heat alerts (>30°C)
  - Freeze warnings (<0°C)
  - Thunderstorm warnings
  - Snowfall alerts
- 📲 Installable as a PWA (desktop + mobile)
- 🔄 Auto-refreshes every 30 minutes
- 💯 100% free — uses Open-Meteo API (no API key required)

## Files
- `index.html` — Main app
- `sw.js` — Service worker (caching + push support)
- `manifest.json` — PWA manifest

## How to Deploy

### Option A: GitHub Pages (Free)
1. Create a GitHub repo
2. Upload all 3 files
3. Go to Settings → Pages → Deploy from main branch
4. Your app is live at `https://yourusername.github.io/repo-name`

### Option B: Netlify (Free, drag & drop)
1. Go to netlify.com
2. Drag the folder onto the deploy zone
3. Done — you get a live HTTPS URL instantly

### Option C: Vercel (Free)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` inside the folder
3. Follow prompts

### Option D: Any static host
Just upload the 3 files to any web host that serves HTTPS.
**PWA features (install prompt, notifications) require HTTPS.**

## Tech Stack
- Vanilla HTML/CSS/JS — no build step, no dependencies
- Open-Meteo API — free, no API key needed
- Open-Meteo Geocoding API — for city search
- Web Notifications API — for alerts
- Service Worker — for PWA/caching

## Extending It
- Add more weather sources (OpenWeatherMap, WeatherAPI) for side-by-side comparison
- Add a backend for server-push notifications (so alerts fire even when app is closed)
- Add charts (Chart.js) for temperature trend visualization
- Add radar/satellite map embed
