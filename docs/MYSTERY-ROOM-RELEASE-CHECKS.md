# Mystery Room release checks

Reviewed 23 November 2026.

## Current position

- Website work remains on the `mystery-room-build` GitHub branch.
- Pull request #2 remains open, unmerged and in draft.
- The live website's `main` branch has not been updated by this work.
- A separate Cloudflare Pages project, `dark-case-audio-mystery-preview`, is deployed. Its production environment remains connected to `main`; the `mystery-room-build` branch produces preview deployments only. No live custom domain was assigned to this preview project.
- The Mystery Room database schema is already installed in the connected Supabase project.
- Anonymous table grants have been tightened: anonymous visitors have read-only access to the catalogue, case background and evidence tables; they have no table privileges on member notes, conclusions, discussions or reviews. A test as `anon` sees the two published catalogue cards (the Zodiac appears only as a Plus teaser) and six Enfield preview evidence items.
- The public Mystery Room admin-check wrapper runs as SECURITY INVOKER and is executable only by authenticated users. The profile signup trigger is not callable as an RPC by client roles and has an empty search path. A rolled-back synthetic signup test confirmed the trigger still creates the profile row.
- Supabase security advisors no longer flag the Mystery Room admin wrapper or profile signup trigger as exposed SECURITY DEFINER functions. One account-wide warning remains: leaked-password protection is disabled. It has not been changed as part of this feature.
- Browser testing already completed by the owner covers visitors without membership, free members, the Enfield free sample, private notes/conclusions and the relevant access restrictions. Do not ask the owner to repeat those tests.
- The stable branch-preview URL was manually checked by the owner on 23 November 2026. The Mystery Room catalogue loads with both published case cards; the membership page loads in the same preview, recognises the signed-in account as cancelled and displays audiobook download history without a `Failed to fetch` error. The owner's test account is on the private Mystery Room administrator allow-list, so it is not suitable for testing ordinary-member RLS restrictions.
- Four browser-facing Stripe/Plus Edge Functions now have CORS configured for the live site and the stable `mystery-room-build.dark-case-audio-mystery-preview.pages.dev` branch-preview address. Their deployed source files are tracked under `supabase/functions/` on this branch. Use the stable branch-preview address for future testing; hash-specific deployment URLs are not automatically allowed.
- The active-Plus member journey still requires a real account with a currently active or trialing Plus subscription. No active or trialing subscription was present in the database during this review.

## Publication and access

The live database currently reports the Enfield Poltergeist as a published free sample and the Zodiac Killer case as published Plus-only content. The Zodiac case is not a draft at present. Its five evidence items are all marked non-preview. The row-level security policies are intended to keep that content unavailable to anonymous and free members.

## Remaining release blockers

- [ ] Verify the full Plus unlock journey in the browser with a real active/trialing Plus account. Do not use a live payment solely to complete this test without the owner's approval.
- [x] Simulated active and cancelled subscriptions for a non-admin member inside rolled-back database transactions. Active access revealed the Zodiac background and all five Plus evidence items; cancelled access revealed only the Enfield background and six preview evidence items. Neither state exposed Zodiac discussions or reviews. No test subscription records were retained.
- [ ] Confirm the active Plus journey in the browser once a genuine active/trialing account is available.
- [ ] Replay-test the reconstructed schema candidate in a separate clean Supabase project. The candidate and a development-only seed are under `supabase/recovery/`; they have passed a transactional replay against isolated temporary schemas in the connected database, with rollback and no live changes. They depend on the existing application tables `auth.users` and `public.dark_case_subscriptions` and are not yet certified as portable. The three applied security hardening migrations are stored under `supabase/migrations/`.
- [x] Update the Privacy Policy and Terms on the development branch to describe private investigation records, administrator access, member-visible discussion posts, editorial reviews and moderation.
- [ ] Final owner/legal review of the Privacy Policy and Terms, including the actual data-retention arrangements and applicable UK data-protection obligations.
- [ ] Owner approval before merging or publishing.

## Current known limitations

The migration ledger provides version names but not the original SQL bodies. The reconstructed baseline and privacy-safe public-content seed are under `supabase/recovery/`, outside the automatic migration directory. Their SQL passed a rolled-back isolated-schema replay, but they are not the verbatim historical migrations and still need a fresh-project integration test. The migration inventory is not a database backup.
