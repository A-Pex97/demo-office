-- מדיניות RLS: מנהל רואה ומעדכן הכל, עובד רק את הלקוחות שלו

alter table public.profiles enable row level security;
alter table public.clients  enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
drop policy if exists "profiles_update_self"          on public.profiles;
drop policy if exists "profiles_manager_all"          on public.profiles;

-- כל משתמש מחובר יכול לקרוא שמות (נדרש לעמודת "אחראי")
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- מנהל: הרשאה מלאה על הפרופילים
create policy "profiles_manager_all"
  on public.profiles for all
  to authenticated
  using (public.is_manager())
  with check (public.is_manager());

-- עובד: עדכון הפרופיל של עצמו בלבד
create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "clients_manager_all"      on public.clients;
drop policy if exists "clients_employee_select"  on public.clients;
drop policy if exists "clients_employee_update"  on public.clients;

-- מנהל: קריאה וכתיבה מלאה על כל הלקוחות
create policy "clients_manager_all"
  on public.clients for all
  to authenticated
  using (public.is_manager())
  with check (public.is_manager());

-- עובד: קריאה רק של לקוחות המשויכים אליו
create policy "clients_employee_select"
  on public.clients for select
  to authenticated
  using (assigned_to = auth.uid());

-- עובד: עדכון רק של לקוחות המשויכים אליו
create policy "clients_employee_update"
  on public.clients for update
  to authenticated
  using (assigned_to = auth.uid())
  with check (assigned_to = auth.uid());
