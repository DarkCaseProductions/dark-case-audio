# Dark Case Audio PWA foundation — test branch only

Branch: `pwa-foundation`

## Safety status

These files are isolated on this branch. The live `main` branch and live website have not been changed by this PWA work. The existing `index.html` has not been edited to reference the manifest or register the service worker.

## Files

- `manifest.webmanifest`: install metadata for Dark Case Audio.
- `service-worker.js`: conservative shell cache.
- `pwa-register.js`: registration script, intentionally not linked from the homepage yet.

## Cache policy

Only the homepage shell and the small public logo are allowlisted. Cross-origin requests and non-GET requests are not intercepted. Audio/video requests are not cached. Supabase, Stripe, user account pages, paid downloads, and other URLs are not in the cache allowlist.

## Important preview limitation

Creating a Git branch does not create a separate public preview website. Do not merge this branch into `main` or change GitHub Pages settings to test it. First choose an isolated preview method that cannot replace the live custom-domain deployment.

## Next test steps

1. Review the branch files and confirm the cache allowlist.
2. Generate proper square PNG app icons (recommended 192×192 and 512×512) from approved Dark Case Audio artwork; the current manifest temporarily references the existing small JPEG logo.
3. Preview in an isolated test origin or local HTTPS-capable preview.
4. Only after successful checks, add manifest and registration references to a test copy of the homepage.
5. Test installation, offline shell fallback, online freshness, radio streaming, search, sign-in, and downloads.
6. Keep all changes on this branch until explicitly approved.
