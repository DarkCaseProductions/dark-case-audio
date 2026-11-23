# Mystery Room database migration recovery

**Supabase project:** `inhiiamepxwjtfyqlqir`  
**Reviewed:** 23 November 2026  
**Purpose:** Preserve the migration history and clearly record what is and is not available for recovery.

## Important status

The production Supabase project already contains the Mystery Room schema, policies, functions and case content. The migration history below was read directly from Supabase's migration ledger.

The original SQL bodies for these historical migrations were **not present in the GitHub repository and are not returned by the migration-ledger listing**. This file is therefore an inventory and recovery record, **not a replayable migration set**. Do not copy these version names into a fresh project as empty migrations, and do not mark them as applied on another database. Doing so would create a false impression that the schema had been installed.

A proper portable migration set still needs to be reconstructed and tested against a separate empty Supabase project or disposable database before it can be treated as authoritative. The live database has not been changed as part of writing this document.

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

The private schema contains `private.mystery_room_admins`, which stores approved administrator user IDs. The private administrator-check function is `private.is_mystery_room_admin()`. The authenticated-only public wrapper is `public.is_mystery_room_admin()`. Both functions use an empty search path and are SECURITY DEFINER. The `anon` role cannot execute either function; authenticated users can execute the public wrapper. The private allow-list is not exposed to ordinary users.

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

## Recovery work still required

1. Reconstruct the original schema, constraints, indexes, functions, grants and RLS policies as versioned SQL migrations. The anonymous-grant hardening migration is now stored as an applied SQL file in `supabase/migrations/`.
2. Separate the case seed content from schema migrations where practical, and avoid embedding live member IDs or private member data.
3. Include an explicit, safe administrator bootstrap step that maps the approved account by email only when that account already exists; never hard-code a production auth UUID into a reusable migration.
4. Recreate the feature in a disposable Supabase project and verify all policies and access paths before calling the migrations portable.
5. Keep production and the live website unchanged until the owner approves a tested deployment plan.

## Do not treat this document as a backup

This is a migration-history and recovery inventory. It is not a database backup and does not contain private member notes, member submissions, discussion posts, auth records, payment records or a complete export of the database.
