# Dark Case Audio — iPhone/iPad app

This is a first native Expo / React Native app shell for Dark Case Audio. It keeps the dark crimson visual identity and links into the existing live website for current catalogue, membership, forums, case files, and audio delivery. It is separate from the live website files.

## Preview without paying Apple

1. Install Node.js LTS on the Windows PC.
2. Download this repository from GitHub, or open this folder in a terminal after cloning it.
3. Run `npm install`.
4. Run `npx expo start --web` to preview the layout in a browser. If the web bundler asks for an extra package, follow its prompt.
5. For cloud iOS simulator builds, create a free Expo account and configure EAS. An Apple Developer membership is not needed for a simulator-only build; installing on a physical iPhone or publishing to the App Store has separate Apple signing and membership requirements.

## Cloud build configuration

- App name: Dark Case Audio
- Bundle ID: `com.darkcaseproductions.darkcaseaudio`
- Platforms: iOS and Android
- Cloud build: Expo Application Services (EAS)

## Before App Store release

- Confirm the live radio stream is playable inside the app on iOS, including background/lock-screen behavior if desired.
- Verify membership sign-in, free downloads, paid audiobook delivery and Stripe redirects on an iPhone.
- Confirm any external links and payment flows comply with Apple's current review rules.
- Add final app icon, screenshots, privacy disclosures, and store listing details.
- A paid Apple Developer account is required to submit to the App Store.

This initial version is a working starting point, not a claim that it has already been built, tested on an iPhone, or approved by Apple.
