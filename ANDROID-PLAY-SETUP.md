# Dark Case Audio — Android build preparation

## Selected Android identity
- App name: Dark Case Audio
- Android package ID: `com.darkcaseproductions.darkcaseaudio`
- Website: `https://darkcaseaudio.com/`
- Existing app source: `iphone-app/` (Expo / React Native, shared iOS and Android project)

## What is already present
- `iphone-app/App.js`: native React Native home screen with WebView-based access to the live site, radio, catalogue, case files, membership and forums.
- `iphone-app/app.json`: Android package ID is already set to the agreed value.
- `iphone-app/package.json`: Expo project dependencies and scripts.
- `iphone-app/eas.json`: EAS development, preview and production build profiles.
- The project README explicitly says it is a starting point and has not yet been built or tested on a device.

## Build approach
Use the existing Expo project for the Android build instead of creating a second, competing Trusted Web Activity project. Keep the project in `iphone-app/`; do not replace the live website with the native app.

## Before creating a release build
1. Core versions have been aligned with Expo SDK 58 (Expo ~58.0.0, React 19.3.0, React Native 0.88.1 and expo-status-bar ~58.0.0). Still install dependencies and run Expo diagnostics to verify the complete dependency tree, especially react-native-webview.
2. Add approved, square PNG app icon and adaptive icon assets. No icon assets are configured yet; the launcher icon must be supplied before a reliable store build. Do not use a remote website banner as the launcher icon.
3. Test the radio player, background/lock-screen behavior as intended, in-app navigation, external links, sign-in, free downloads and paid audiobook/Stripe flows on the Android test phone.
4. Create/use an Expo account and configure EAS Build. Store any access token only in a private secret store; never commit tokens or signing credentials.
5. Build an Android preview APK for device testing, then a production Android App Bundle (AAB) for Play Console.
6. Enrol in Play App Signing on the first Play upload and retain secure recovery/ownership of the upload key.
7. Complete Play Console listing, privacy policy and Data safety disclosures, content rating, app access instructions, ads declaration if applicable, and any required closed testing before requesting production access.

## Safety boundary
This branch is based on `main` but does not change `main` or GitHub Pages deployment. Do not merge this branch or publish the app until build and device tests pass. No signing keys, tokens, or passwords belong in this repository.

## Current status
This document is preparation only. Core Expo/React Native versions have been aligned, but dependencies have not been installed or diagnosed in a build environment. No Android APK/AAB has yet been built, no Play Console listing has been created, and no production release has been submitted.
