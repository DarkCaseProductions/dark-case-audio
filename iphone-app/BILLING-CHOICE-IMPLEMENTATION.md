# Dark Case Audio — Google Play Billing Choice implementation plan

Working branch: android-billing-choice

This work is isolated from android-native-build. Do not merge or publish until the integration and device tests are complete.

## Selected Google flow

Use Google's rendered billing-choice screen with the external-web-link option (Google's scenario 2A), subject to Google approving the submitted enrolment request and enabling the relevant Play Console settings.

The app must not simply open existing Stripe URLs from the WebView. It must first invoke the Google Play Billing Choice flow for eligible digital products. If the user chooses Google Play Billing, continue through the standard Play purchase flow. If the user chooses the external link, obtain the external transaction token, associate it with the exact intended product/order, and open the matching Dark Case Audio website checkout.

## Required implementation work

1. Confirm Play Console enrolment approval and configure the app for the UK external-web-link option, including any required choice-screen and external-link preferences.
2. Add a maintained Android native bridge compatible with the current Expo SDK / React Native project and Play Billing Library 9.1 or later. Because this is an Expo managed project, implement/configure the native module through an Expo config plugin or another reproducible native-project integration. Do not make manual edits only to generated android/ files; the release workflow runs expo prebuild --clean.
3. Implement product discovery and the Google Play Billing purchase path. Map the app's purchasable audiobook/ebook catalogue entries to stable product identifiers; do not guess identifiers or prices.
4. For the external-link choice, obtain and persist the Google external transaction token server-side before opening the matching Stripe checkout. Bind the token to a specific product, user/session, and pending order.
5. On verified Stripe payment success, securely report the authorized transaction to Google Play through the required Billing Choice API within 24 hours. Do not trust a client-side success redirect as proof of payment.
6. Handle cancellations, abandoned checkout, refunds, duplicate callbacks, retries, and token expiry/idempotency.
7. Test both Google Play and Stripe paths with Play license testers/internal testing, then inspect the resulting signed AAB and Play Console declarations.

## Backend dependencies and secrets

The reporting flow requires a trusted backend and Google Play Developer API access. Keep service-account credentials and Stripe secrets on the server (for example, Supabase Edge Functions / secrets), never in the mobile app or Git repository.

Before coding the payment/reporting endpoints, inspect the existing Supabase audiobook-access function and Stripe webhook/session verification so the new order/token flow reuses verified payment evidence rather than duplicating or bypassing it.

## Current verified project facts

- Expo project lives in iphone-app/.
- App package ID: com.darkcaseproductions.darkcaseaudio.
- Current app uses a React Native WebView and Stripe Payment Links from the website.
- Current package.json does not include a Google Play Billing library or native billing bridge.
- The Android Play release workflow generates native files using expo prebuild --clean.
- The release workflow now checks out the branch selected when the workflow is run, rather than being hard-coded to android-native-build.

## Safety gates

- Do not modify the existing android-native-build branch.
- Do not add placeholder billing calls, fake tokens, guessed product IDs, or client-side Google service-account credentials.
- Do not run a production build or upload an AAB until the native bridge, backend reporting, product mapping, and Play Console enrollment are in place.
- A successful build alone does not prove Billing Choice compliance; complete end-to-end testing is required.