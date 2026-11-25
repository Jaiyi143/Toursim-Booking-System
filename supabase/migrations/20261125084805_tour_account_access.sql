create table public.tour_owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.tour_owners enable row level security;
revoke all on public.tour_owners from public, anon, authenticated;
grant select (user_id) on public.tour_owners to authenticated;

create policy "Owners can verify their membership after password sign-in"
on public.tour_owners for select to authenticated
using (
  user_id = (select auth.uid())
  and ((select auth.jwt()) -> 'amr') @> '[{"method":"password"}]'::jsonb
);

create policy "Owners read all tour requests after password sign-in"
on public.tour_requests for select to authenticated
using (exists (
  select 1 from public.tour_owners where user_id = (select auth.uid())
));
