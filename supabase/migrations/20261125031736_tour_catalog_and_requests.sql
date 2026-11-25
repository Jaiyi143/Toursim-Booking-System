create table public.tour_trips (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  destination text not null,
  province text not null,
  title text not null,
  category text not null,
  image text not null,
  alt text not null,
  duration text not null,
  description text not null,
  highlights text[] not null,
  position smallint not null unique,
  active boolean not null default true
);

create table public.tour_requests (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  trip_slug text not null references public.tour_trips(slug),
  preferred_date date not null,
  guests smallint not null check (guests between 1 and 10),
  created_at timestamptz not null default now(),
  unique (traveler_id, trip_slug, preferred_date)
);

create index tour_requests_trip_slug_idx on public.tour_requests (trip_slug);

alter table public.tour_trips enable row level security;
alter table public.tour_requests enable row level security;

revoke all on public.tour_trips, public.tour_requests from public, anon, authenticated;
grant select on public.tour_trips to anon, authenticated;
grant select on public.tour_requests to authenticated;
grant insert (trip_slug, preferred_date, guests) on public.tour_requests to authenticated;

create policy "Visitors read active tours"
on public.tour_trips for select to anon, authenticated
using (active);

create policy "Travelers read their own requests"
on public.tour_requests for select to authenticated
using ((select auth.uid()) = traveler_id);

create policy "Travelers submit their own trip requests"
on public.tour_requests for insert to authenticated
with check (
  (select auth.uid()) = traveler_id
  and (select auth.jwt() ->> 'is_anonymous') = 'false'
  and nullif((select auth.jwt() ->> 'email'), '') is not null
  and preferred_date > (now() at time zone 'Asia/Manila')::date
  and preferred_date <= (now() at time zone 'Asia/Manila')::date + 365
  and exists (select 1 from public.tour_trips where slug = trip_slug and active)
);

insert into public.tour_trips
  (slug, destination, province, title, category, image, alt, duration, description, highlights, position)
values
  ('el-nido-lagoon-days', 'El Nido', 'Palawan', 'El Nido Lagoon Days', 'Island hopping', 'el-nido.jpg',
   'Turquoise water winding between the limestone walls of Big Lagoon', '3 days',
   'Paddle through limestone lagoons and spend an afternoon on the beaches of Bacuit Bay.',
   array['Kayak in Big Lagoon', 'Snorkel in Bacuit Bay', 'Take a beach break between island stops'], 1),
  ('hills-of-bohol', 'Bohol', 'Central Visayas', 'Hills of Bohol', 'Countryside', 'bohol.jpg',
   'Rounded Chocolate Hills stretching across the Bohol countryside', '2 days',
   'Take in the Chocolate Hills, follow the Loboc River, and make time for a countryside stop.',
   array['Visit the Chocolate Hills viewpoint', 'Stop by the Loboc River', 'Explore the Bohol countryside'], 2),
  ('slow-days-in-siargao', 'Siargao', 'Surigao del Norte', 'Slow Days in Siargao', 'Island escape', 'siargao.jpg',
   'A wide canopy of coconut palms on Siargao Island', '4 days',
   'Spend a few unhurried days among coconut groves, tidal pools, and the shores of General Luna.',
   array['Look out over the coconut groves', 'Visit the Magpupungko tidal pools when tides allow', 'Spend a free afternoon in General Luna'], 3);
