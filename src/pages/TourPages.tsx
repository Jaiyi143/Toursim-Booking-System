import { Link, useSearchParams } from 'react-router'
import { TripCard } from '../components/TripCard'
import { photos, type Trip } from '../lib/trips'

const linkClass = 'inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-bold text-deep-blue underline underline-offset-4'
const headingClass = 'font-display text-[clamp(2.55rem,6vw,4.7rem)] leading-[0.98] tracking-[-0.06em]'
const fieldClass = 'mt-1.5 block min-h-11 w-full rounded-lg border border-line bg-white px-3 font-semibold text-ink'

export function Catalog({ trips, offline }: { trips: readonly Trip[]; offline: boolean }) {
  const [search, setSearch] = useSearchParams()
  const destinations = [...new Set(trips.map((trip) => trip.destination))]
  const categories = [...new Set(trips.map((trip) => trip.category))]
  const destination = search.get('destination') ?? ''
  const category = search.get('style') ?? ''
  const matching = trips.filter((trip) =>
    (!destination || trip.destination === destination) && (!category || trip.category === category),
  )

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(search)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearch(next)
  }

  return (
    <>
      <section className="overflow-hidden border-b border-line bg-mist">
        <div className="page-width grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <Link className={linkClass + ' mb-4'} to="/">← Home</Link>
            <h1 className={headingClass}>Explore Philippine tours</h1>
            <p className="mt-4 max-w-md leading-relaxed text-muted">Compare sample trips to Palawan, Bohol, and Siargao. Pick a destination to see what the itinerary could include.</p>
          </div>
          <img src={photos + 'bacuit-bay.jpg'} alt="Limestone cliffs above the water in Bacuit Bay" width={1280} height={853} className="hidden aspect-[2.3] w-full rounded-3xl object-cover lg:block" />
        </div>
      </section>
      <section className="page-width py-9 sm:py-12" aria-labelledby="catalog-heading">
        <h2 id="catalog-heading" className="sr-only">Tour results</h2>
        {offline && <p role="status" className="mb-5 rounded-lg border border-line bg-white p-4 text-sm text-muted">The live catalog is unavailable. Showing the sample collection.</p>}
        <div className="grid gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:p-5">
          <label className="text-sm font-bold">
            Destination
            <select value={destinations.includes(destination) ? destination : ''} onChange={(event) => setFilter('destination', event.target.value)} className={fieldClass}>
              <option value="">Any destination</option>
              {destinations.map((place) => <option key={place}>{place}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">
            Trip style
            <select value={categories.includes(category) ? category : ''} onChange={(event) => setFilter('style', event.target.value)} className={fieldClass}>
              <option value="">Any trip style</option>
              {categories.map((style) => <option key={style}>{style}</option>)}
            </select>
          </label>
          {(destination || category) && <Link to="/tours" className={linkClass + ' sm:self-end'}>Clear filters</Link>}
        </div>
        <p role="status" className="my-4 text-sm font-semibold text-muted">{matching.length} {matching.length === 1 ? 'trip' : 'trips'}</p>
        {matching.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matching.map((trip) => <TripCard key={trip.slug} trip={trip} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-white p-8 text-center">
            <h3 className="font-display text-2xl">No trips match these filters</h3>
            <p className="mt-2 text-sm text-muted">Choose another destination or trip style to see more itineraries.</p>
          </div>
        )}
      </section>
    </>
  )
}

export function TripDetails({ trip }: { trip: Trip }) {
  return (
    <article className="page-width pt-6 pb-16 sm:pt-9 sm:pb-24">
      <Link className={linkClass + ' mb-4'} to="/tours">← All tours</Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch">
        <img src={photos + trip.image} alt={trip.alt} width={960} height={640} className="aspect-[4/3] min-h-0 w-full rounded-3xl bg-mist object-cover sm:aspect-[16/10] lg:h-full" />
        <div className="flex flex-col justify-center rounded-3xl border border-line bg-white p-6 sm:p-9">
          <p className="mb-3 text-xs font-extrabold tracking-[0.14em] text-deep-blue uppercase">{trip.destination}, {trip.province}</p>
          <h1 className={headingClass}>{trip.title}</h1>
          <p className="mt-4 leading-relaxed text-muted">{trip.description}</p>
          <p className="mt-5 text-sm font-bold">{trip.duration} <span aria-hidden="true">·</span> {trip.category}</p>
          <Link className="primary-button mt-6 min-h-12 self-start" to={'/checkout/' + trip.slug}>Request this trip <span className="ml-3" aria-hidden="true">→</span></Link>
          <p className="mt-2 text-sm text-muted">Sample itinerary. Dates and prices are confirmed separately.</p>
        </div>
      </div>
      <section className="mt-10 max-w-3xl" aria-labelledby="highlights">
        <h2 id="highlights" className="font-display text-3xl tracking-tight sm:text-4xl">Itinerary highlights</h2>
        <ol className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white px-5 sm:px-7">
          {trip.highlights.map((stop, index) => (
            <li className="flex items-center gap-4 py-4" key={stop}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-deep-blue" aria-hidden="true">{index + 1}</span>
              <span>{stop}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  )
}

export function MissingTrip() {
  return (
    <section className="page-width py-16 sm:py-24">
      <h1 className={headingClass}>Page unavailable</h1>
      <p className="mt-4 text-muted">The page or trip you’re looking for could not be found.</p>
      <Link to="/tours" className={linkClass + ' mt-3'}>Browse tours →</Link>
    </section>
  )
}
