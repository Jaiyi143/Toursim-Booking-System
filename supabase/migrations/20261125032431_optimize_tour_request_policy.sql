alter policy "Travelers submit their own trip requests"
on public.tour_requests
with check (
  (select auth.uid()) = traveler_id
  and ((select auth.jwt()) ->> 'is_anonymous') = 'false'
  and nullif((select auth.jwt()) ->> 'email', '') is not null
  and preferred_date > (now() at time zone 'Asia/Manila')::date
  and preferred_date <= (now() at time zone 'Asia/Manila')::date + 365
  and exists (select 1 from public.tour_trips where slug = trip_slug and active)
);
