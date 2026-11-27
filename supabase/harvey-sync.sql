begin;

create table if not exists public.harvey_sync (
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  revision integer not null default 1 check (revision > 0),
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 5242880),
  primary key (user_id, module)
);

alter table public.harvey_sync
  drop constraint if exists harvey_sync_module_check,
  add constraint harvey_sync_module_check
  check (module in ('workspace', 'reading', 'ielts17', 'ielts18', 'ielts19', 'vocabulary'));

alter table public.harvey_sync enable row level security;
revoke all on table public.harvey_sync from public, anon, authenticated;
grant select, insert, update on table public.harvey_sync to authenticated;

drop policy if exists "Read own Harvey data" on public.harvey_sync;
create policy "Read own Harvey data" on public.harvey_sync for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Create own Harvey data" on public.harvey_sync;
create policy "Create own Harvey data" on public.harvey_sync for insert to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Update own Harvey data" on public.harvey_sync;
create policy "Update own Harvey data" on public.harvey_sync for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

commit;
