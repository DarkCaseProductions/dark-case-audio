-- Anonymous visitors need read-only access to the public Mystery Room catalogue and free-preview material.
-- Row Level Security continues to decide which published rows and preview items are visible.
revoke all privileges on table
  public.mystery_cases,
  public.mystery_case_content,
  public.mystery_evidence,
  public.mystery_investigation_notes,
  public.mystery_submissions,
  public.mystery_discussion_posts,
  public.mystery_case_reviews
from anon;

grant select on table
  public.mystery_cases,
  public.mystery_case_content,
  public.mystery_evidence
to anon;
