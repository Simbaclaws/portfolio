# Digital workbench portfolio

Astro + strict TypeScript + plain CSS + Three.js. Local prototype; nothing has been deployed.

## Run

Use Node 24 LTS and npm. In this folder run `npm ci`, then `npm run dev`. Open the URL printed by Astro. `npm run check` checks Astro/TypeScript; `npm run build` creates the static `dist/` folder; `npm run preview` serves that build. `npm run measure` reports raw and gzip file sizes after a build.

## Connected worlds

The fullscreen Three.js portfolio contains six lazy-built scenes: Home, Delft, Dungeon, DigiNova factory, Health upstairs, and Filmhuis Lumen cinema. The opening animation approaches the home once per browser tab session. Skip intro and reduced-motion preferences bypass it. Drag to orbit, scroll to zoom, click objects to explore, or use the keyboard-accessible room navigation.

Home connects to Delft, Dungeon and Health. The factory and cinema are separate buildings reached from Delft and return to Delft. The factory location near TU Delft is fictional. Project screenshots link to the supplied websites and retain the user's exact contribution descriptions. The Projects directory also exposes every link without WebGL.

- `src/data/projects.ts`: five project URLs and contribution copy.
- `src/data/delft-route.ts`: projected published shuttle route and stops.
- `src/scripts/worlds.ts`: room geometry, furnishings, project screens and ambient animations.
- `src/scripts/lab.ts`: camera, raycasting, intro, scene transitions and motion controls.
- `src/pages/index.astro`: accessible navigation, native project dialogs and fallback content.
- `src/styles/global.css`: fullscreen layout and responsive controls; explicitly embedded in the static page.

Public website screenshots are served locally from `public/images`. Image textures are cached and reused. Device pixel ratio is capped at 1.5; the animation loop stops in hidden tabs and settles when paused. Run `npm run check`, `npm run build`, then `npm run verify` for types, static output, project links, stylesheet inclusion and gzip budgets.

## Delft references (checked September 7, 2026)

This is a simplified geographic model, not a street-accurate navigation map. Landmark positions use public PDOK address results; canals and urban massing were interpreted from Google Maps satellite imagery. The shuttle follows the website's published GPX, which may differ from current operations.

- Google Maps overview: https://www.google.com/maps/@52.0085,4.3665,15z
- Published shuttle route: https://delftcityshuttle.nl/route/ and https://delftcityshuttle.nl/dcs.gpx
- Church locations: https://www.oudeennieuwekerkdelft.nl/en/contact/
- Current Lumen address, Van Leeuwenhoekpark 55: https://filmhuis-lumen.nl/locatie-bereikbaarheid/
- Lumen building reference: https://nieuwdelft.nl/portfolio/de-hooghe-delft/
- Address coordinates: https://api.pdok.nl/bzk/locatieserver/search/v3_1/free

## GitHub Pages, when ready

Astro static output works with GitHub Pages. There is no adapter or server dependency. Official guide: https://docs.astro.build/en/guides/deploy/github/

Set build environment variables `SITE_URL` to your actual origin (for example `https://<username>.github.io`) and `BASE_PATH` to `/<repository>` for a project site. For an account root site or custom domain, use `/` as the base. These are placeholders, not configured addresses. PowerShell example:

```powershell
$env:SITE_URL = 'https://<username>.github.io'
$env:BASE_PATH = '/<repository>'
npm run build
```

Without SITE_URL, canonical metadata and the sitemap are intentionally omitted. With a real origin, the sitemap integration emits them. Clear the variables for a default local build. Local asset imports and fragment navigation respect a subpath. Add future public assets with `import.meta.env.BASE_URL`, rather than root-relative URLs.

When publishing is authorized, follow the official guide to create `.github/workflows/deploy.yml`: checkout, build/upload with `withastro/action`, and deploy with `actions/deploy-pages`; enable GitHub Actions as the Pages source. Copy the current workflow versions from that guide, set the real site/base variables in the build job, and set its branch trigger to the actual branch. No active deployment workflow is installed here, so pushing this scaffold alone cannot start a Pages deployment.

## Performance targets and measurement

These are budgets, not field measurements: initial HTML + CSS + loader under 35 KB gzip; initial JS under 5 KB gzip; optional 3D code under 180 KB gzip; future above-fold imagery under 150 KB; first loaded models/textures under 750 KB combined. Run `npm run measure` and review network requests after every asset addition. Do not increase budgets without a reason.

For screenshots, use Astro `Picture` from `astro:assets` with AVIF/WebP and a JPEG/PNG fallback, explicit dimensions and responsive sizes. Lazy-load below-fold images. Only an actual above-fold LCP image should receive eager loading/high priority; no speculative preloads or external fonts are currently needed. Keep any future GLB/texture imports behind the scene import; use compressed geometry/textures and an explicit resource budget.

Before release, use a production preview and Lighthouse mobile throttling, test keyboard navigation, 200% zoom, narrow screens, JavaScript off, WebGL unavailable, reduced motion, station selection and the pause control. Check the Network panel before/after loading 3D. Field LCP, INP and CLS need real traffic; no perfect Web Vitals score is promised.

## Codex project

Add `C:\Users\User\projects\portfolio` through Codex's Add project / Open folder flow. This task did not create a saved project or initialize/push a Git repository.

## Verification — immersive revision

Run `npm run check`, `npm run build`, and `npm run verify`. The verify script checks static project links, anchors, separate scene bundling and gzip budgets. Browser checks cover object picking, dialog/project link presentation, machinery controls, keyboard shortcuts and responsive appearance. No publishing was performed.

The scene now loads automatically, superseding the first prototype’s click-to-load interaction. Runtime memory/GPU cost is higher than the initial sparse display study. Measure real devices before release; field Web Vitals have not been measured.
