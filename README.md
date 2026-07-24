# Solar System — Interactive 3D Experience

A premium, single-page interactive 3D solar system built with Three.js.
Split into separate files/folders so it deploys cleanly on Vercel (or any
static host).

## Project structure

```
solar-system/
├── index.html          → page markup, loads css/style.css and js/main.js
├── css/
│   └── style.css        → all styling
├── js/
│   ├── data.js           → astronomical data for the Sun + 8 planets
│   ├── audio.js           → synthesized ambient space sound (Web Audio API)
│   └── main.js            → scene setup, planets, moons, belt, camera, UI logic
├── package.json
├── vercel.json
└── README.md
```

No build step, no framework, no bundler — it's a static site that loads
Three.js from a CDN via an import map in `index.html`.

## Run locally

Just open `index.html` in a browser, or serve it locally:

```bash
npx serve .
```

## Deploy to Vercel

**Option A — Vercel CLI**
```bash
npm i -g vercel
cd solar-system
vercel
```

**Option B — Git + Vercel dashboard**
1. Push this folder to a GitHub/GitLab/Bitbucket repo.
2. In the Vercel dashboard, click **Add New → Project** and import the repo.
3. Framework preset: **Other** (static site). Leave build command empty,
   output directory as the project root.
4. Deploy — that's it, no environment variables needed.

## Features

- Realistic glowing Sun with animated light
- All 8 planets, correctly ordered, with relative orbital motion
- Major moons for Earth, Mars, Jupiter, Saturn, Uranus and Neptune
- Saturn's rings
- Earth cloud layer
- Procedural asteroid belt between Mars and Jupiter
- Procedural Milky Way / nebula backdrop plus a starfield
- Click any planet (or use the bottom dock) to zoom the camera in with a smooth animation
- Detailed info panel per body: distance from the Sun, orbital speed, axial tilt,
  orbital period, composition, atmosphere, oxygen %, water %, and moon list
- Optional synthesized ambient space sound (toggle button, bottom bar) — no audio
  files needed, generated in the browser
- Play/pause and speed control for the whole simulation
- Fully responsive layout for desktop, tablet and mobile

## Notes on scale

Distances and planet sizes are shown on a compressed, symbolic scale so the
whole system is visible on screen at once. Real astronomical figures (actual
distance in km, real orbital speed, etc.) are shown in the info panel for each body.

## Credits

Built with [Three.js](https://threejs.org/) (loaded from the unpkg CDN) and the
Cormorant Garamond / Manrope / Space Mono font families (Google Fonts).
"# Solar-System" 
