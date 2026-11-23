# Mystery Room release checks

Reviewed 23 November 2026.

## Current position

- Website work remains on the `mystery-room-build` GitHub branch.
- Pull request #2 remains open, unmerged and in draft.
- The live website's `main` branch has not been updated by this work.
- The Mystery Room database schema is already installed in the connected Supabase project.
- Anonymous table grants have been tightened: anonymous visitors have read-only access to the catalogue, case background and evidence tables; they have no table privileges on member notes, conclusions, discussions or reviews. A test as `anon` sees the two published catalogue cards (the Zodiac appears only as a Plus teaser) and six Enfield preview evidence items.
- A separate Cloudflare Pages preview is still required for end-to-end browser testing of the static website pages.
- The active-Plus member journey still requires a real account with a currently active or trialing Plus subscription.

## Publication and access

The live database currently reports the Enfield Poltergeist as a published free sample and the Zodiac Killer case as published Plus-only content. The Zodiac case is not a draft at present. Its five evidence items are all marked non-preview. The row-level security policies are intended to keep that content unavailable to anonymous and free members.

## Release blockers

- [ ] Create and test a static Cloudflare Pages preview without changing the live domain or production project.
- [ ] Verify sign-in, free Enfield sample, private notes, saving a draft conclusion, submitting a conclusion, discussion access and editorial review in a browser.
- [ ] Verify the Plus-only Zodiac case with a real active/trialing Plus account.
- [ ] Verify that an expired/cancelled Plus account cannot access the Plus case, its evidence, discussion or review.
- [ ] Reconstruct and test the original schema migrations as a portable Supabase migration set in a disposable project. The applied anonymous-grant hardening migration is now stored under `supabase/migrations/`.
- [ ] Review the Mystery Room Privacy Policy and Terms in the context of the actual feature and business arrangements.
- [ ] Owner approval before merging or publishing.

## Current known limitations

The migration ledger provides version names but not the original SQL bodies. The migration inventory is recorded in `supabase/MYSTERY-ROOM-MIGRATION-RECOVERY.md`. That inventory is not replayable SQL and is not a database backup.
