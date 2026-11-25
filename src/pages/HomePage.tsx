import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { photos, type Trip } from '../lib/trips'
import { TripCard } from '../components/TripCard'

const emptyFilters = { destination: '', category: '' }

export function HomePage({ trips }: { trips: readonly Trip[] }) {
  const tripTypes = [...new Set(trips.map((trip) => trip.category))]
  const [draft, setDraft] = useState(emptyFilters)
  const [filters, setFilters] = useState(emptyFilters)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  const tripDialog = useRef<HTMLDialogElement>(null)

  const results = trips.filter((trip) =>
    (!filters.destination || trip.destination === filters.destination) &&
    (!filters.category || trip.category === filters.category),
  )

  function findTrips(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFilters(draft)
    resultsHeading.current?.focus()
  }

  function filterByCategory(category: string) {
    setDraft((currentDraft) => ({ ...currentDraft, category }))
    setFilters((currentFilters) => ({ ...currentFilters, category }))
  }

  function resetFilters() {
    setDraft(emptyFilters)
    setFilters(emptyFilters)
    resultsHeading.current?.focus()
  }

  return (
    <>
        <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink text-white">
          <img
            src={photos + 'bacuit-bay.jpg'}
            alt=""
            width={1280}
            height={853}
            fetchPriority="high"
            className="absolute inset-0 -z-20 size-full object-cover object-[57%_center] sm:object-[center_54%]"
          />
          <div className="hero-shade absolute inset-0 -z-10" aria-hidden="true" />
          <div className="page-width flex min-h-[480px] items-center py-20 sm:min-h-[520px] sm:pb-24 lg:min-h-[525px]">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.19em] text-sky-100 uppercase">
                <span className="h-px w-8 bg-sky-200" aria-hidden="true" />
                Explore the Philippines
              </p>
              <h1 id="hero-title" className="font-display text-[clamp(3.65rem,9vw,7.6rem)] leading-[0.88] tracking-[-0.075em]">
                Find your
                <br />
                <em className="pr-3 font-normal text-sky-100">next island.</em>
              </h1>
              <p className="mt-7 max-w-[25rem] text-base leading-relaxed text-white/95 sm:text-lg">
                Island-hop through Palawan, follow the hills of Bohol, or slow down on Siargao.
              </p>
            </div>
          </div>
          <p className="absolute right-8 bottom-14 hidden rounded-full border border-white/30 bg-ink/80 px-4 py-2 text-xs font-semibold tracking-wide text-white lg:block xl:right-[max(2rem,calc((100vw-76rem)/2))]">
            Bacuit Bay, El Nido
          </p>
        </section>

        <div className="page-width relative z-10 -mt-8 sm:-mt-10">
          <form onSubmit={findTrips} aria-label="Trip finder" className="grid gap-3 rounded-[1.5rem] border border-line bg-white p-4 shadow-[0_16px_45px_#15242d17] sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-[1fr_1fr_auto]">
            <label htmlFor="destination" className="rounded-xl bg-mist px-4 pt-2.5 pb-1">
              <span className="block text-xs font-bold text-muted">Where to?</span>
              <select id="destination" value={draft.destination} onChange={(event) => setDraft({ ...draft, destination: event.target.value })} className="min-h-11 w-full cursor-pointer rounded-sm bg-transparent pr-2 font-bold text-ink">
                <option value="">Any destination</option>
                {trips.map(({ destination }) => <option key={destination}>{destination}</option>)}
              </select>
            </label>
            <label htmlFor="trip-category" className="rounded-xl bg-mist px-4 pt-2.5 pb-1">
              <span className="block text-xs font-bold text-muted">Trip style</span>
              <select id="trip-category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="min-h-11 w-full cursor-pointer rounded-sm bg-transparent pr-2 font-bold text-ink">
                <option value="">Any trip style</option>
                {tripTypes.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <button type="submit" className="primary-button min-h-13 gap-6 sm:col-span-2 lg:col-span-1 lg:px-8">
              Find trips <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>

        <section id="trips" aria-labelledby="trip-heading" className="page-width scroll-mt-8 pt-14 pb-20 sm:pt-20 sm:pb-24">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
            <div>
              <h2 ref={resultsHeading} id="trip-heading" tabIndex={-1} className="w-fit rounded-sm font-display text-[clamp(2.6rem,6vw,4.1rem)] leading-none tracking-[-0.06em] text-ink">Explore the islands</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">Sample itineraries for three ways to see the Philippines.</p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by trip style">
              {['', ...tripTypes].map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={category === filters.category}
                  onClick={() => filterByCategory(category)}
                  className="min-h-11 cursor-pointer rounded-full border border-line bg-white px-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white"
                >
                  {category || 'All styles'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex min-h-11 items-center justify-between gap-4">
            <p role="status" className="text-sm font-medium text-muted">
              {results.length} {results.length === 1 ? 'trip' : 'trips'}{filters.destination && ' in ' + filters.destination}
            </p>
            {(filters.destination || filters.category) && (
              <button type="button" onClick={resetFilters} className="min-h-11 cursor-pointer rounded-sm text-sm font-bold text-deep-blue underline underline-offset-4">Clear filters</button>
            )}
          </div>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center sm:py-14">
              <h3 className="font-display text-2xl text-ink">No trips match these filters</h3>
              <p className="mt-2 text-sm text-muted">Choose a different destination or trip style to see more itineraries.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((trip) => (
                <TripCard key={trip.slug} trip={trip} onPreview={(selected) => {
                  setSelectedTrip(selected)
                  tripDialog.current?.showModal()
                }} />
              ))}
            </div>
          )}
          <Link to="/tours" className="mt-6 inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-deep-blue underline underline-offset-4">Browse the full catalog <span aria-hidden="true" className="ml-2">→</span></Link>
        </section>
      <dialog ref={tripDialog} aria-labelledby="itinerary-title" className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[1.5rem] border border-line bg-white p-6 text-ink shadow-2xl backdrop:bg-ink/70 sm:p-8">
        {selectedTrip && <>
        <div className="flex flex-wrap items-center justify-between gap-x-4">
          <p className="text-xs font-extrabold tracking-[0.12em] text-deep-blue uppercase">Sample itinerary · {selectedTrip.duration}</p>
          <form method="dialog">
            <button type="submit" className="min-h-11 cursor-pointer rounded-sm px-2 text-sm font-bold text-deep-blue hover:underline hover:underline-offset-4">Close</button>
          </form>
        </div>
        <h2 id="itinerary-title" className="mt-2 font-display text-4xl leading-none tracking-[-0.055em]">{selectedTrip.title}</h2>
        <p className="mt-4 leading-relaxed text-muted">{selectedTrip.description}</p>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink">
          {selectedTrip.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
        <Link className="primary-button mt-6 min-h-11" to={'/tours/' + selectedTrip.slug} onClick={() => tripDialog.current?.close()}>Full trip details</Link>
        </>}
      </dialog>
    </>
  )
}
