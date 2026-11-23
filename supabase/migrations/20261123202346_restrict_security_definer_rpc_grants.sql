-- The profile initializer is a trigger-only function; it is not a client RPC.
-- The trigger already exists, so client roles do not need EXECUTE privileges.
revoke execute on function public.handle_new_member()
from public, anon, authenticated, service_role;

-- The public admin-check wrapper is intentionally called by signed-in clients.
-- Run it as the caller; its private helper performs the narrowly scoped privileged lookup.
alter function public.is_mystery_room_admin() security invoker;
revoke execute on function public.is_mystery_room_admin()
from public, anon;
grant execute on function public.is_mystery_room_admin()
to authenticated;
