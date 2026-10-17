# Dark Case Audio PWA foundation — test branch only

Branch: `pwa-foundation`

## Safety status

These files are isolated on this branch. The live `main` branch and live website have not been changed by this PWA work. The existing `index.html` has not been edited to reference the manifest or register the service worker.

## Files

- `manifest.webmanifest`: install metadata for Dark Case Audio.
- `service-worker.js`: conservative shell cache.
- `pwa-register.js`: registration script, intentionally not linked from the live homepage.
- `pwa-preview.html`: a separate copy of the existing homepage with the manifest and service-worker registration enabled for testing only.

## Cache policy

Only the homepage shell and the small public logo are allowlisted. Cross-origin requests and non-GET requests are not intercepted. Audio/video requests are not cached. Supabase, Stripe, user account pages, paid downloads, and other URLs are not in the cache allowlist.

## Important preview limitation

Creating a Git branch does not create a separate public preview website. `pwa-preview.html` exists only on this branch and is not live yet. Do not merge this branch into `main` or change GitHub Pages settings to test it. Before browser testing, choose an isolated preview method that cannot replace the live custom-domain deployment.

## Next test steps

1. Review the branch files and confirm the cache allowlist.
2. Choose a separate HTTPS preview host or a local HTTPS-capable preview that cannot alter the current GitHub Pages deployment.
3. Generate proper square PNG app icons (recommended 192×192 and 512×512) from approved Dark Case Audio artwork; the current manifest temporarily references the existing small JPEG logo.
4. Preview `pwa-preview.html` in that isolated test origin.
5. Test installation, offline shell fallback, online freshness, radio streaming, search, sign-in, and downloads.
6. Keep all changes on this branch until explicitly approved.
