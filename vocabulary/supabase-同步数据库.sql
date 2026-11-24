-- “拾词”免费云同步数据库
-- 在 Supabase 项目的 SQL Editor 中完整运行一次即可。

create table if not exists public.vocab_sync (
  sync_id uuid primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.vocab_sync enable row level security;
revoke all on table public.vocab_sync from anon, authenticated;

create or replace function public.pull_vocab(p_sync_id uuid)
returns table(data jsonb, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select v.data, v.updated_at
  from public.vocab_sync v
  where v.sync_id = p_sync_id
  limit 1;
$$;

create or replace function public.push_vocab(p_sync_id uuid, p_data jsonb)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_at timestamptz;
begin
  if pg_column_size(p_data) > 5242880 then
    raise exception '同步数据超过 5 MB';
  end if;

  insert into public.vocab_sync(sync_id, data, updated_at)
  values (p_sync_id, p_data, now())
  on conflict (sync_id) do update
  set data = excluded.data,
      updated_at = excluded.updated_at
  returning updated_at into saved_at;

  return saved_at;
end;
$$;

revoke all on function public.pull_vocab(uuid) from public;
revoke all on function public.push_vocab(uuid, jsonb) from public;
grant execute on function public.pull_vocab(uuid) to anon, authenticated;
grant execute on function public.push_vocab(uuid, jsonb) to anon, authenticated;

