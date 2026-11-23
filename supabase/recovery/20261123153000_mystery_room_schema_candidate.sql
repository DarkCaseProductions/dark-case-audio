-- RECOVERY CANDIDATE ONLY — generated from the live schema on 2026-11-23.
-- Do not move into supabase/migrations or apply to production until reviewed and
-- replay-tested against a disposable Supabase project.
-- Prerequisites: public.dark_case_subscriptions and auth.users already exist.
-- This file recreates Mystery Room schema and access rules only. It intentionally
-- does not copy member notes, submissions, discussion posts, reviews or admin IDs.

begin;
create schema if not exists private;
set local search_path = public, extensions;

create table public.mystery_case_content (case_id uuid not null,
  case_background text not null,
  editorial_context text,
  updated_at timestamp with time zone default now() not null,
  investigation_questions jsonb default '[]'::jsonb not null);

create table public.mystery_case_reviews (id uuid default gen_random_uuid() not null,
  case_id uuid not null,
  review_title text not null,
  review_body text not null,
  created_at timestamp with time zone default now() not null);

create table public.mystery_cases (id uuid default gen_random_uuid() not null,
  slug text not null,
  category text not null,
  title text not null,
  subtitle text,
  synopsis text not null,
  hero_image_url text,
  status text default 'draft'::text not null,
  is_free_preview boolean default false not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null);

create table public.mystery_discussion_posts (id uuid default gen_random_uuid() not null,
  case_id uuid not null,
  user_id uuid not null,
  parent_id uuid,
  content text not null,
  status text default 'visible'::text not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null);

create table public.mystery_evidence (id uuid default gen_random_uuid() not null,
  case_id uuid not null,
  title text not null,
  evidence_type text not null,
  description text,
  body text,
  source_label text,
  source_url text,
  file_url text,
  is_preview boolean default false not null,
  display_order integer default 0 not null,
  created_at timestamp with time zone default now() not null);

create table public.mystery_investigation_notes (id uuid default gen_random_uuid() not null,
  case_id uuid not null,
  user_id uuid not null,
  notes text default ''::text not null,
  updated_at timestamp with time zone default now() not null);

create table public.mystery_submissions (id uuid default gen_random_uuid() not null,
  case_id uuid not null,
  user_id uuid not null,
  theory text default ''::text not null,
  answers jsonb default '{}'::jsonb not null,
  status text default 'draft'::text not null,
  submitted_at timestamp with time zone,
  updated_at timestamp with time zone default now() not null);

create table private.mystery_room_admins (user_id uuid not null,
  added_at timestamp with time zone default now() not null);

alter table mystery_case_content add constraint mystery_case_content_pkey PRIMARY KEY (case_id);
alter table mystery_case_reviews add constraint mystery_case_reviews_pkey PRIMARY KEY (id);
alter table mystery_cases add constraint mystery_cases_pkey PRIMARY KEY (id);
alter table mystery_discussion_posts add constraint mystery_discussion_posts_pkey PRIMARY KEY (id);
alter table mystery_evidence add constraint mystery_evidence_pkey PRIMARY KEY (id);
alter table mystery_investigation_notes add constraint mystery_investigation_notes_pkey PRIMARY KEY (id);
alter table mystery_submissions add constraint mystery_submissions_pkey PRIMARY KEY (id);
alter table private.mystery_room_admins add constraint mystery_room_admins_pkey PRIMARY KEY (user_id);
alter table mystery_case_reviews add constraint mystery_case_reviews_case_id_key UNIQUE (case_id);
alter table mystery_cases add constraint mystery_cases_slug_key UNIQUE (slug);
alter table mystery_investigation_notes add constraint mystery_investigation_notes_case_id_user_id_key UNIQUE (case_id, user_id);
alter table mystery_submissions add constraint mystery_submissions_case_id_user_id_key UNIQUE (case_id, user_id);
alter table mystery_cases add constraint mystery_cases_category_check CHECK ((category = ANY (ARRAY['crime'::text, 'paranormal'::text])));
alter table mystery_cases add constraint mystery_cases_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text])));
alter table mystery_discussion_posts add constraint mystery_discussion_posts_content_check CHECK (((char_length(content) >= 1) AND (char_length(content) <= 10000)));
alter table mystery_discussion_posts add constraint mystery_discussion_posts_status_check CHECK ((status = ANY (ARRAY['visible'::text, 'hidden'::text])));
alter table mystery_evidence add constraint mystery_evidence_evidence_type_check CHECK ((evidence_type = ANY (ARRAY['document'::text, 'photograph'::text, 'audio'::text, 'video'::text, 'timeline'::text, 'report'::text, 'other'::text])));
alter table mystery_submissions add constraint mystery_submissions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text])));
alter table mystery_case_content add constraint mystery_case_content_case_id_fkey FOREIGN KEY (case_id) REFERENCES mystery_cases(id) ON DELETE CASCADE;
alter table mystery_case_reviews add constraint mystery_case_reviews_case_id_fkey FOREIGN KEY (case_id) REFERENCES mystery_cases(id) ON DELETE CASCADE;
alter table mystery_discussion_posts add constraint mystery_discussion_posts_case_id_fkey FOREIGN KEY (case_id) REFERENCES mystery_cases(id) ON DELETE CASCADE;
alter table mystery_discussion_posts add constraint mystery_discussion_posts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES mystery_discussion_posts(id) ON DELETE CASCADE;
alter table mystery_discussion_posts add constraint mystery_discussion_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table mystery_evidence add constraint mystery_evidence_case_id_fkey FOREIGN KEY (case_id) REFERENCES mystery_cases(id) ON DELETE CASCADE;
alter table mystery_investigation_notes add constraint mystery_investigation_notes_case_id_fkey FOREIGN KEY (case_id) REFERENCES mystery_cases(id) ON DELETE CASCADE;
alter table mystery_investigation_notes add constraint mystery_investigation_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table mystery_submissions add constraint mystery_submissions_case_id_fkey FOREIGN KEY (case_id) REFERENCES mystery_cases(id) ON DELETE CASCADE;
alter table mystery_submissions add constraint mystery_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table private.mystery_room_admins add constraint mystery_room_admins_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX mystery_discussion_case_created_idx ON public.mystery_discussion_posts USING btree (case_id, created_at);
CREATE INDEX mystery_discussion_parent_idx ON public.mystery_discussion_posts USING btree (parent_id);
CREATE INDEX mystery_discussion_user_idx ON public.mystery_discussion_posts USING btree (user_id);
CREATE INDEX mystery_evidence_case_order_idx ON public.mystery_evidence USING btree (case_id, display_order);
CREATE INDEX mystery_notes_user_case_idx ON public.mystery_investigation_notes USING btree (user_id, case_id);
CREATE INDEX mystery_submissions_user_case_idx ON public.mystery_submissions USING btree (user_id, case_id);

create or replace function private.is_mystery_room_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1 from private.mystery_room_admins a
    where a.user_id = (select auth.uid())
  );
$function$;

create or replace function public.is_mystery_room_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select private.is_mystery_room_admin();
$function$;

revoke all on function private.is_mystery_room_admin() from public, anon;
grant execute on function private.is_mystery_room_admin() to authenticated;
revoke all on function public.is_mystery_room_admin() from public, anon;
grant execute on function public.is_mystery_room_admin() to authenticated;


create policy "Accessible case backgrounds are visible" on mystery_case_content as permissive for select to anon, authenticated using ((EXISTS ( SELECT 1
   FROM mystery_cases c
  WHERE ((c.id = mystery_case_content.case_id) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now())))))))));
create policy "Mystery Room administrators can manage case content" on mystery_case_content as permissive for all to authenticated using (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin)) with check (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin));

create policy "Members see editorial review after submitting their investigati" on mystery_case_reviews as permissive for select to authenticated using ((EXISTS ( SELECT 1
   FROM (mystery_submissions sub
     JOIN mystery_cases c ON ((c.id = sub.case_id)))
  WHERE ((sub.case_id = mystery_case_reviews.case_id) AND (sub.user_id = ( SELECT auth.uid() AS uid)) AND (sub.status = 'submitted'::text) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now())))))))));
create policy "Mystery Room administrators can manage editorial reviews" on mystery_case_reviews as permissive for all to authenticated using (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin)) with check (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin));

create policy "Mystery Room administrators can manage cases" on mystery_cases as permissive for all to authenticated using (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin)) with check (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin));
create policy "Published case catalogue is visible" on mystery_cases as permissive for select to anon, authenticated using ((status = 'published'::text));

create policy "Members can edit their own discussion posts after submission" on mystery_discussion_posts as permissive for update to authenticated using (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM (mystery_submissions sub
     JOIN mystery_cases c ON ((c.id = sub.case_id)))
  WHERE ((sub.case_id = mystery_discussion_posts.case_id) AND (sub.user_id = ( SELECT auth.uid() AS uid)) AND (sub.status = 'submitted'::text) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now())))))))))) with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM (mystery_submissions sub
     JOIN mystery_cases c ON ((c.id = sub.case_id)))
  WHERE ((sub.case_id = mystery_discussion_posts.case_id) AND (sub.user_id = ( SELECT auth.uid() AS uid)) AND (sub.status = 'submitted'::text) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now()))))))))));
create policy "Members who submitted a case can post to its discussions" on mystery_discussion_posts as permissive for insert to authenticated with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM (mystery_submissions sub
     JOIN mystery_cases c ON ((c.id = sub.case_id)))
  WHERE ((sub.case_id = mystery_discussion_posts.case_id) AND (sub.user_id = ( SELECT auth.uid() AS uid)) AND (sub.status = 'submitted'::text) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now()))))))))));
create policy "Members who submitted a case can read its discussions" on mystery_discussion_posts as permissive for select to authenticated using (((status = 'visible'::text) AND (EXISTS ( SELECT 1
   FROM (mystery_submissions sub
     JOIN mystery_cases c ON ((c.id = sub.case_id)))
  WHERE ((sub.case_id = mystery_discussion_posts.case_id) AND (sub.user_id = ( SELECT auth.uid() AS uid)) AND (sub.status = 'submitted'::text) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now()))))))))));
create policy "Mystery Room administrators can moderate discussions" on mystery_discussion_posts as permissive for all to authenticated using (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin)) with check (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin));

create policy "Accessible case evidence is visible" on mystery_evidence as permissive for select to anon, authenticated using ((EXISTS ( SELECT 1
   FROM mystery_cases c
  WHERE ((c.id = mystery_evidence.case_id) AND (c.status = 'published'::text) AND (((c.is_free_preview = true) AND (mystery_evidence.is_preview = true)) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now())))))))));
create policy "Mystery Room administrators can manage evidence" on mystery_evidence as permissive for all to authenticated using (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin)) with check (( SELECT private.is_mystery_room_admin() AS is_mystery_room_admin));

create policy "Members can create notes for accessible cases" on mystery_investigation_notes as permissive for insert to authenticated with check (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM mystery_cases c
  WHERE ((c.id = mystery_investigation_notes.case_id) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now()))))))))));
create policy "Members can delete their own investigation notes" on mystery_investigation_notes as permissive for delete to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy "Members can read their own investigation notes" on mystery_investigation_notes as permissive for select to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy "Members can update notes for accessible cases" on mystery_investigation_notes as permissive for update to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM mystery_cases c
  WHERE ((c.id = mystery_investigation_notes.case_id) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now()))))))))));

create policy "Members can create conclusions for accessible cases" on mystery_submissions as permissive for insert to authenticated with check (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM mystery_cases c
  WHERE ((c.id = mystery_submissions.case_id) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now()))))))))));
create policy "Members can delete their own draft conclusions" on mystery_submissions as permissive for delete to authenticated using (((( SELECT auth.uid() AS uid) = user_id) AND (status = 'draft'::text)));
create policy "Members can read their own conclusions" on mystery_submissions as permissive for select to authenticated using ((( SELECT auth.uid() AS uid) = user_id));
create policy "Members can update conclusions for accessible cases" on mystery_submissions as permissive for update to authenticated using ((( SELECT auth.uid() AS uid) = user_id)) with check (((( SELECT auth.uid() AS uid) = user_id) AND (EXISTS ( SELECT 1
   FROM mystery_cases c
  WHERE ((c.id = mystery_submissions.case_id) AND (c.status = 'published'::text) AND ((c.is_free_preview = true) OR (EXISTS ( SELECT 1
           FROM dark_case_subscriptions s
          WHERE ((s.user_id = ( SELECT auth.uid() AS uid)) AND (s.status = ANY (ARRAY['active'::text, 'trialing'::text])) AND (s.current_period_end > now()))))))))));

alter table public.mystery_case_content enable row level security;
alter table public.mystery_case_reviews enable row level security;
alter table public.mystery_cases enable row level security;
alter table public.mystery_discussion_posts enable row level security;
alter table public.mystery_evidence enable row level security;
alter table public.mystery_investigation_notes enable row level security;
alter table public.mystery_submissions enable row level security;
alter table private.mystery_room_admins enable row level security;

grant usage on schema private to authenticated;
revoke all on table private.mystery_room_admins from anon, authenticated;
grant select on table public.mystery_cases, public.mystery_case_content, public.mystery_evidence to anon;
grant all on table public.mystery_cases, public.mystery_case_content, public.mystery_evidence,
  public.mystery_investigation_notes, public.mystery_submissions,
  public.mystery_discussion_posts, public.mystery_case_reviews to authenticated;
grant all on table public.mystery_cases, public.mystery_case_content, public.mystery_evidence,
  public.mystery_investigation_notes, public.mystery_submissions,
  public.mystery_discussion_posts, public.mystery_case_reviews to service_role;

commit;
