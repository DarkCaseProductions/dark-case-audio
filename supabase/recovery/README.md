# Mystery Room recovery candidate

These files are a reconstruction from the live Supabase schema, not copies of the missing historical migration SQL.

## Files

- `20261123153000_mystery_room_schema_candidate.sql` — eight Mystery Room tables, constraints, indexes, row-level security policies, administrator helper functions and grants.
- `seed_mystery_room_public_content.sql` — the two published case records, their case backgrounds and guided questions, and 11 evidence entries.

## Dependencies

The existing Dark Case Audio application schema must already provide:

- Supabase Auth (`auth.users` and `auth.uid()`).
- `public.dark_case_subscriptions`, with the same `user_id`, `status` and `current_period_end` fields used by the current membership system.
- The Supabase roles `anon`, `authenticated` and `service_role`.

This is a feature-level baseline, not a complete Dark Case Audio database backup or a complete new-project bootstrap.

## Data intentionally excluded

The seed contains public case material only. It does not copy any member investigation notes, draft or submitted conclusions, discussion posts, editorial reviews, account data, subscription records, or administrator IDs.

The administrator allow-list is intentionally empty after a clean install. Add the approved administrator only after that account exists in the target Auth project. Never copy a production user UUID into a reusable seed.

## Validation completed

On 23 November 2026, the schema candidate and seed were executed together inside isolated temporary schemas on the connected Supabase database, in a transaction that was rolled back. Follow-up role simulations in the same isolated setup returned:

- Anonymous visitor: 2 published catalogue cards, 6 Enfield preview evidence entries, and no SELECT privilege on notes, submissions, discussions or reviews.
- Ordinary authenticated free member: 2 catalogue cards, 1 case background, 6 evidence entries, and no visible notes, submissions, discussions or reviews for the simulated account.

No objects or rows from these validation runs were retained in the live database.

This does not replace a replay test in a separate clean Supabase project. Do not move these files into `supabase/migrations/`, mark them applied, or run them against production until that separate test and review are complete.

## Fresh-project test procedure

1. Create a disposable Supabase project with the required existing application prerequisites, or first install the base Dark Case Audio schema.
2. Apply the schema candidate.
3. Apply the public-content seed.
4. Create a test admin account and add only that account to `private.mystery_room_admins`.
5. Test anonymous, free-member, active-Plus, cancelled-Plus and admin access separately.
6. Confirm that notes and conclusions remain private, discussion requires a submitted conclusion, and Plus-only case material is unavailable to non-Plus members.
7. Only after the replay and access tests pass, decide how to fold the reconstruction into the canonical migration history.

A separate project may incur charges. Check the exact project cost and obtain owner approval before creating one.
