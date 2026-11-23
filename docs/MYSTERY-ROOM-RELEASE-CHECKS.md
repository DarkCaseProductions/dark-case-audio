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
- The Plus status page now successfully loads subscription status and audiobook download history in the preview. The owner's test account is recognised as cancelled, so it correctly does not receive Plus access.
- Four browser-facing Stripe/Plus Edge Functions now have CORS configured for the live site and the stable `mystery-room-build.dark-case-audio-mystery-preview.pages.dev` branch-preview address. Their deployed source files are tracked under `supabase/functions/` on this branch. Use the stable branch-preview address for future testing; hash-specific deployment URLs are not automatically allowed.
- The active-Plus member journey still requires a real account with a currently active or trialing Plus subscription. No active or trialing subscription was present in the database during this review.

## Publication and access

The live database currently reports the Enfield Poltergeist as a published free sample and the Zodiac Killer case as published Plus-only content. The Zodiac case is not a draft at present. Its five evidence items are all marked non-preview. The row-level security policies are intended to keep that content unavailable to anonymous and free members.

## Remaining release blockers

- [ ] Verify the Plus-only Zodiac case with a real active/trialing Plus account. Do not use a live payment solely to complete this test without the owner's approval.
- [ ] Verify that an expired/cancelled Plus account cannot access the Plus case, its evidence, discussion or review. The membership page currently confirms the test account is cancelled; the earlier free-member restriction checks are already complete.
- [ ] Reconstruct and test the original schema migrations as a portable Supabase migration set in a disposable project. The applied anonymous-grant hardening migration and the three additional security hardening migrations are stored under `supabase/migrations/`.
- [ ] Review the Mystery Room Privacy Policy and Terms in the context of the actual feature and business arrangements.
- [ ] Owner approval before merging or publishing.

## Current known limitations

The migration ledger provides version names but not the original SQL bodies. The migration inventory is recorded in `supabase/MYSTERY-ROOM-MIGRATION-RECOVERY.md`. That inventory is not replayable SQL and is not a database backup. The original migration set must be reconstructed and tested before the project can be described as fully portable.
