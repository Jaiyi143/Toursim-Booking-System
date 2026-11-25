import { Link } from 'react-router'
import { photos, type Trip } from '../lib/trips'

const actionClass = 'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-sm text-sm font-bold text-deep-blue hover:underline hover:underline-offset-4'

export function TripCard({ trip, onPreview }: { trip: Trip; onPreview?: (trip: Trip) => void }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-[1.25rem] border border-line bg-white shadow-[0_5px_18px_#15242d08]">
      <div className="relative">
        <img src={photos + trip.image} alt={trip.alt} loading="lazy" width={960} height={640} className="aspect-[16/10] w-full bg-mist object-cover" />
        <p className="absolute top-4 left-4 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-ink">{trip.category}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-extrabold tracking-[0.12em] text-deep-blue uppercase">{trip.destination}, {trip.province}</p>
        <h3 className="mt-2 font-display text-[1.75rem] leading-tight tracking-[-0.035em]">{trip.title}</h3>
        <p className="mt-2 mb-5 text-sm leading-relaxed text-muted">{trip.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-2">
          <p className="text-sm font-semibold text-muted">{trip.duration}</p>
          {onPreview ? (
            <button type="button" className={actionClass} aria-label={'View itinerary for ' + trip.title} onClick={() => onPreview(trip)}>
              View itinerary <span aria-hidden="true">↗</span>
            </button>
          ) : (
            <Link to={'/tours/' + trip.slug} className={actionClass} aria-label={'See trip details for ' + trip.title}>
              Trip details <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
