# Dark Case Audio — Android / Google Play preparation

## Safety boundary
This branch is preparation only. Do not merge it into `main` and do not change GitHub Pages settings as part of this work. The live website must remain untouched until the PWA and Play requirements have been tested.

## Proposed Android identity
- App display name: Dark Case Audio
- Android application ID / package name: `com.darkcaseproductions.darkcaseaudio`
- Website origin: `https://darkcaseaudio.com`
- Packaging approach: Trusted Web Activity (TWA), using Bubblewrap or PWABuilder after the live web manifest and origin are confirmed.

The package name is intended to be stable. Confirm it in Google Play Console before creating the app listing; do not create a second listing with a different ID.

## Current findings
- The `main` branch contains `manifest.webmanifest`, but the live homepage currently does not link to it.
- The `pwa-foundation` branch has a separate `pwa-preview.html`, `pwa-icon.svg`, `pwa-register.js`, and a conservative `service-worker.js`.
- The `desktop-install-option` branch has different PWA files and its test notes do not match all files found there.
- No completed Android project or verified Android App Bundle was found during the review.
- The website's root `/.well-known/assetlinks.json` has not been confirmed in the live site.

## Required sequence
1. Keep the work on this branch and test the PWA against an isolated HTTPS preview; do not point the preview at the live homepage in a way that changes deployment.
2. Verify manifest fields and use square launcher icons in PNG format at suitable Android sizes (including 192×192 and 512×512).
3. Decide and verify the final app identity in Play Console.
4. Generate the TWA Android project from the confirmed HTTPS manifest URL and the package ID above.
5. Build and install a test APK/AAB on the Android test device; verify radio streaming, navigation, membership sign-in, search, and downloads remain online and behave as expected.
6. Enrol in Play App Signing when uploading the first release. Do not commit keystores, passwords, signing credentials, or private keys to this repository.
7. After Play Console exposes the correct **app-signing certificate SHA-256 fingerprint**, create the Digital Asset Links file using that exact fingerprint and package ID. Do not guess the fingerprint or publish a placeholder assetlinks file.
8. Test `https://darkcaseaudio.com/.well-known/assetlinks.json` over HTTPS and confirm TWA verification before submitting the release.
9. Complete Play Console declarations, store listing, privacy/data-safety details, testing requirements, and review.

## Signing and verification warning
The certificate used for local/upload signing can differ from the Play App Signing certificate used on users' installed copies. Use the app-signing SHA-256 fingerprint shown in Play Console for the website association. The association file is not ready to publish until that fingerprint is known.

## Not done yet
No live website changes, Play Console listing creation, signing-key generation, release upload, or production release has been performed by this branch preparation.
