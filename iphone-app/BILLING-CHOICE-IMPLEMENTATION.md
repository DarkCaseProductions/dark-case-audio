# Dark Case Audio — Google Play Billing Choice implementation plan

Working branch: android-billing-choice

This work is isolated from android-native-build. Do not merge or publish until the integration and device tests are complete.

## Selected Google flow

Use Google's rendered billing-choice screen with the external-web-link option (Google's scenario 2A), subject to Google approving the submitted enrolment request and enabling the relevant Play Console settings.

The app must not simply open existing Stripe URLs from the WebView. It must first invoke the Google Play Billing Choice flow for eligible digital products. If the user chooses Google Play Billing, continue through the standard Play purchase flow. If the user chooses the external link, obtain the external transaction token, associate it with the exact intended audiobook/order, and open the matching Dark Case Audio website checkout.

## Verified Google requirements (checked 31 October 2026)

- The selected route is Scenario 2A: Google renders the billing-choice screen and the user is sent to the external website when they choose the external option.
- Google requires Billing Choice enrolment and the external-link preferences to be enabled in Play Console before the app flow is used.
- The Android integration must use Play Billing Library 9.1 or later.
- For Scenario 2A, obtain a reporting token using `createBillingProgramReportingDetailsAsync` with `DeveloperBillingType.EXTERNAL_LINK`, then pass it to the Billing Choice flow / external-link launch as required by the current Play Billing API.
- After a successful external purchase, report it through Google Play Developer API `externaltransactions.createexternaltransaction`. The one-time purchase payload requires the token, a unique external transaction ID, transaction time, original pre-tax amount, original tax amount, and the user's tax region code. For this digital-content link, report `externalOfferDetails.linkType = LINK_TO_DIGITAL_CONTENT_OFFER`.
- Google requires reporting authorized transactions within 24 hours. Refunds must also be reported through the corresponding external-transactions refund API.
- These requirements are for audiobook purchases only. Ebooks are withdrawn from sale and are excluded from all app catalogue, checkout, reporting and refund work.

## Required implementation work

1. Confirm Play Console enrolment approval and configure the app for the UK external-web-link option, including any required choice-screen and external-link preferences.
2. Add a maintained Android native bridge compatible with the current Expo SDK / React Native project and Play Billing Library 9.1 or later. Because this is an Expo managed project, implement/configure the native module through an Expo config plugin or another reproducible native-project integration. Do not make manual edits only to generated android/ files; the release workflow runs expo prebuild --clean.
3. Implement product discovery and the Google Play Billing purchase path. Map only the currently purchasable audiobook catalogue entries to stable product identifiers; ebooks are withdrawn from sale and must not appear in the app purchase flow.
4. For the external-link choice, obtain and persist the Google external transaction token server-side before opening the matching Stripe checkout. Bind the token to a specific audiobook, user/session, and pending order.
5. Use a new server-created Stripe Checkout Session for app-originated purchases, carrying a server-controlled order reference. The existing static website Payment Links must remain unchanged. On verified Stripe payment success, report the authorized one-time transaction to Google Play through the External Transactions API within 24 hours, including the correct pre-tax/tax split, GBP currency, UK tax region, transaction timestamp, unique external transaction ID, token and digital-content-offer link type. Do not trust a client-side success redirect as proof of payment.
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

## Existing checkout constraint and implementation boundary

The current website checkout uses fixed Stripe Payment Links. These remain untouched. They do not provide the required server-controlled association between a Billing Choice external transaction token and a specific pending audiobook order. App-originated external-link purchases therefore need a separate server-created Stripe Checkout Session flow that:

- accepts only an allow-listed audiobook identifier and a valid pending-order reference;
- stores the Google token against that pending order before creating the Stripe session;
- sets server-controlled Stripe metadata / client reference data to identify the pending order;
- verifies the completed Stripe session directly with Stripe on the server;
- calculates and reports the exact GBP pre-tax and tax amounts from the verified Stripe transaction, without guessing tax values;
- uses an idempotent report state so webhook retries cannot create duplicate Google reports;
- handles failed/abandoned checkouts and refunds without granting audiobook access prematurely.

The current `audiobook-access` function remains the existing website delivery path and must not be changed as part of this work. A separate app purchase/reporting path should be implemented and tested before any production deployment.

## Outstanding prerequisites before implementation can be completed

- Google Play Billing Choice enrolment approval and external-link preferences enabled for this app.
- Confirmation of the Play Console external-link configuration and any required declarations.
- A Google Play Developer API service account with the required access, configured only as a Supabase Edge Function secret.
- A secure backend order/token schema and app-specific Stripe Checkout Session endpoint.
- A confirmed mapping of all currently-for-sale audiobooks to the existing Stripe Price IDs and verified prices/tax treatment.
- An Expo-compatible native module/config plugin that builds reproducibly through the repository's `expo prebuild --clean` release workflow.


## Temporary app-testing mode (31 October 2026)

The immediate priority is to test the app without implementing paid in-app purchases yet.

- The app home screen now routes audiobook access to `tester-audiobooks.html`, not the public paid audiobook catalogue.
- A dedicated tester catalogue page has been added. It reuses the existing `tester-audiobook-access` Edge Function and the existing membership sign-in session.
- The Edge Function checks the authenticated Supabase user ID against its server-side allow-list before issuing a one-hour signed download URL. The page does not grant access based on a client-side flag.
- The current Edge Function allow-list contains two tester user IDs. Additional testers must be explicitly authorised server-side; do not make the function public or remove its user check.
- The app WebView hides Stripe Payment Link anchors and blocks navigation to Stripe Checkout hosts in tester mode. The live website and its existing paid audiobook checkout links remain unchanged.
- Ebooks remain withdrawn and are not included.

### Testing-mode verification still required

1. Confirm the two currently allow-listed membership accounts are the intended testers.
2. Test sign-in and sign-out in the app WebView, including session persistence between Membership and Tester Audiobooks.
3. Test one authorised tester download and one non-authorised account (which must be denied).
4. Verify that paid Stripe checkout links are hidden and blocked in the app, while the normal public website still displays its paid audiobook shop.
5. Run the Android build workflow on this branch and install the resulting build through an internal testing track. Do not upload to production.

### Paid release is deferred

Billing Choice, app-originated Stripe Checkout Sessions, external transaction reporting, refunds and Google Play billing integration are deferred until after app testing and before public paid release. No production Supabase functions, live website checkout links, or public sales settings are to be changed for this temporary phase.
