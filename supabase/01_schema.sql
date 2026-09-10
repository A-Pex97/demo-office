-- Base tables. ASCII only: Hebrew literals here break copy/paste into the SQL editor (bidi reordering).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('manager', 'employee'))
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null,
  missing_docs text,
  due_date date,
  assigned_to uuid references public.profiles (id) on delete set null,
  archived boolean not null default false
);

-- Helper: is the current user a manager?
create or replace function public.is_manager()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'manager'
  );
$$;
