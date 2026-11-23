-- Keep the auth signup trigger's profile insert schema-qualified and remove its mutable search path.
-- The function remains trigger-only; client EXECUTE privileges stay revoked.
create or replace function public.handle_new_member()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username'
  );
  return new;
end;
$function$;

revoke execute on function public.handle_new_member()
from public, anon, authenticated, service_role;
