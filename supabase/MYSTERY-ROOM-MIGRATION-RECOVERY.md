# Mystery Room database migration recovery

**Supabase project:** `inhiiamepxwjtfyqlqir`  
**Reviewed:** 23 November 2026  
**Purpose:** Preserve the migration history and clearly record what is and is not available for recovery.

## Important status

The production Supabase project already contains the Mystery Room schema, policies, functions and case content. The migration history below was read directly from Supabase's migration ledger.

The original SQL bodies for these historical migrations were **not present in the GitHub repository and are not returned by the migration-ledger listing**. This file is therefore an inventory and recovery record, not a verbatim copy of the historical migration set. Do not copy these version names into a fresh project as empty migrations, and do not mark them as applied on another database.

A reconstructed baseline candidate and a development seed now live under `supabase/recovery/`. They were executed together against isolated temporary schemas inside a transaction on 23 November 2026; the transaction was rolled back. This confirms that the candidate SQL parses and its tables, constraints, indexes, functions, policies, grants and public case seed can be created together without colliding with the live Mystery Room objects. It is **not** a full clean-project replay: the candidate depends on the existing application tables `auth.users` and `public.dark_case_subscriptions`, and it has not yet been tested in a separate Supabase project. The live database has not been changed by this validation.

## Recorded migration history

The following records were returned by Supabase, in order:

| Version | Migration name |
|---|---|
| 20261112203424 | create_broadcast_partner_applications |
| 20261123154052 | create_mystery_room_foundation |
| 20261123154110 | gate_case_discussions_and_reviews |
| 20261123154119 | limit_notes_and_submissions_to_accessible_cases |
| 20261123154234 | separate_case_catalogue_from_full_background |
| 20261123154313 | publish_enfield_poltergeist_free_sample |
| 20261123154437 | consolidate_mystery_room_access_policies |
| 20261123154556 | tighten_case_discussion_update_policy |
| 20261123154627 | prepare_mystery_room_admin_controls |
| 20261123154721 | add_zodiac_killer_research_draft |
| 20261123154729 | grant_admin_editor_table_privileges |
| 20261123165337 | gate_mystery_room_discussions_by_membership |
| 20261123195155 | expose_safe_mystery_admin_check |
| 20261123202232 | restrict_mystery_room_anon_table_grants |
| 20261123202346 | restrict_security_definer_rpc_grants |
| 20261123202405 | harden_profile_signup_trigger_search_path |

## Current schema inventory

The seven public Mystery Room tables present in the project are:

- `mystery_cases`
- `mystery_case_content`
- `mystery_evidence`
- `mystery_investigation_notes`
- `mystery_submissions`
- `mystery_discussion_posts`
- `mystery_case_reviews`

Row Level Security was confirmed enabled on all seven tables. Their policies distinguish published case catalogue access, free-preview evidence, active/trialing Plus access, owner-only notes and conclusions, submitted-member discussions and administrator controls.

Anonymous table privileges were tightened in migration `20261123202232_restrict_mystery_room_anon_table_grants`: `anon` now has `SELECT` only on the public catalogue, case background and evidence tables, and has no table privileges on notes, submissions, discussions or reviews. Authenticated users retain the table privileges required by the member and administrator workflows; RLS still governs row access.

The RPC surface was also hardened. Migration `20261123202346_restrict_security_definer_rpc_grants` removes client execution privileges from the trigger-only `public.handle_new_member()` function, changes the intended `public.is_mystery_room_admin()` wrapper to SECURITY INVOKER, and allows only authenticated users to execute that wrapper. Migration `20261123202405_harden_profile_signup_trigger_search_path` gives the signup trigger an empty search path and keeps its profile table reference schema-qualified. A rolled-back test insert into `auth.users` confirmed the trigger still creates the matching profile row after these changes.

The private schema contains `private.mystery_room_admins`, which stores approved administrator user IDs. The private administrator-check helper is `private.is_mystery_room_admin()`: it is SECURITY DEFINER, uses an empty search path and is executable only by authenticated users. The public wrapper `public.is_mystery_room_admin()` is SECURITY INVOKER, also uses an empty search path, and is executable only by authenticated users. The `anon` role cannot execute either function. The private allow-list is not exposed to ordinary users. The approved administrator identity returns `true` through the wrapper; a normal authenticated member returns `false`.

## Current case publication state

The current database state was checked directly:

- **The Enfield Poltergeist** — `published`, free preview enabled. Six evidence entries are marked as preview.
- **The Zodiac Killer: The Four Confirmed Attacks** — `published`, free preview disabled. All five evidence entries are marked Plus-only. This case is not a draft in the current database, despite the original migration name containing the word `draft`. Its public catalogue card/title and synopsis are visible as a Plus teaser; the full case background and evidence remain protected for eligible active/trialing Plus members.

Do not change these publication settings as part of migration recovery without an explicit content decision.

## Verified checks

- Seven public Mystery Room tables have RLS enabled.
- Anonymous grants were read back after the hardening migration: `SELECT` only on `mystery_cases`, `mystery_case_content` and `mystery_evidence`; no grants on private member or discussion tables.
- Anonymous and ordinary non-admin access simulations did not reveal Plus-only case material, private conclusions, reviews or discussions.
- The approved administrator account is on the private allow-list and can manage the Mystery Room using the existing Dark Case Audio login.
- The membership-status Edge Function `dark-case-plus-status` is active and performs its own bearer-token validation. Its deployed configuration currently has JWT gateway verification disabled; do not change that setting without reviewing the function's manual authentication logic.
- No Supabase development branches were present at the time of review.

## Recovery files and verification

- `supabase/recovery/20261123153000_mystery_room_schema_candidate.sql` — reconstructed baseline candidate for the eight Mystery Room tables, constraints, indexes, RLS policies, admin helper functions and role grants. This is deliberately outside `supabase/migrations/` so it cannot be accidentally pushed to the connected production project.
- `supabase/recovery/seed_mystery_room_public_content.sql` — development seed for the two published cases, their case backgrounds/questions and 11 evidence entries. It excludes member notes, submissions, discussion posts, editorial reviews and admin IDs.
- Both files were executed together in isolated temporary schemas inside a transaction on the connected database on 23 November 2026. The transaction rolled back successfully. This was a SQL replay/syntax check, not a disposable-project integration test.

## Recovery work still required

1. Verify the baseline against a fresh Supabase project that already has the required application prerequisites (`auth.users` and `public.dark_case_subscriptions`). A new project may incur cost and requires an owner-selected organization and cost approval.
2. Add a safe administrator bootstrap procedure that maps the approved account by email only when that account already exists; never hard-code a production auth UUID into a reusable migration.
3. Decide whether to retain this reconstructed baseline as the new canonical starting point or to reconstruct the original historical migration sequence more faithfully. Do not claim it is the original SQL.
4. Keep production and the live website unchanged until the owner approves a tested deployment plan.

## Do not treat this document as a backup

This is a migration-history and recovery inventory. It is not a database backup and does not contain private member notes, member submissions, discussion posts, auth records, payment records or a complete export of the database.
