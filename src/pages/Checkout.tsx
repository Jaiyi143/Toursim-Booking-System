import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link } from 'react-router'
import { photos, type Trip } from '../lib/trips'
import { supabase } from '../lib/supabase'

const inputClass = 'mt-2 block min-h-12 w-full rounded-lg border border-line bg-paper px-3 text-base text-ink'

function manilaDateAt(offset: number) {
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  const date = new Date(today + 'T00:00:00Z')
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

export function Checkout({ trip, offline }: { trip: Trip; offline: boolean }) {
  const [session, setSession] = useState<Session | null | undefined>(supabase ? undefined : null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [receipt, setReceipt] = useState<{ id: string; traveler: string } | null>(null)

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.unsubscribe()
  }, [])

  async function emailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || pending) return
    const email = String(new FormData(event.currentTarget).get('email')).trim()
    setPending(true)
    setMessage('')
    setSentTo('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin + window.location.pathname },
      })
      if (error) {
        setMessage(error.code === 'email_address_not_authorized'
          ? 'This project’s email service can only send links to authorized test addresses.'
          : 'The sign-in link could not be sent. Check the address and try again shortly.')
      } else {
        setSentTo(email)
      }
    } catch {
      setMessage('Could not reach the sign-in service. Try again.')
    } finally {
      setPending(false)
    }
  }

  async function requestTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !session || pending) return
    const form = new FormData(event.currentTarget)
    const preferredDate = String(form.get('date'))
    const guests = Number(form.get('guests'))
    setPending(true)
    setMessage('')

    try {
      const { data, error } = await supabase.from('tour_requests')
        .insert({ trip_slug: trip.slug, preferred_date: preferredDate, guests })
        .select('id')
        .single()
      if (error) {
        setMessage(error.code === '23505'
          ? 'You already requested this trip for that date.'
          : 'We couldn’t send the request. Check your date and group size, then try again.')
      } else {
        setReceipt({ id: data.id, traveler: session.user.id })
      }
    } catch {
      setMessage('Could not reach the booking service. Your details are still in the form.')
    } finally {
      setPending(false)
    }
  }

  async function switchEmail() {
    if (!supabase || pending) return
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    setSentTo('')
    setMessage(error ? 'Could not sign out. Try again.' : '')
  }

  const signedIn = session?.user.email && !session.user.is_anonymous
  const confirmed = receipt && receipt.traveler === session?.user.id

  return (
    <section className="page-width pt-6 pb-16 sm:pt-9 sm:pb-24" aria-labelledby="checkout-heading">
      <Link to={'/tours/' + trip.slug} className="mb-4 inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-deep-blue underline underline-offset-4">← Back to trip details</Link>
      <h1 id="checkout-heading" className="font-display text-[clamp(2.65rem,6vw,4.6rem)] leading-none tracking-[-0.06em]">Request your trip</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">Share a preferred date and group size. A request starts a conversation about availability and price.</p>
      <div className="mt-7 grid items-start gap-5 lg:grid-cols-[1fr_0.66fr]">
        <div className="rounded-3xl border border-line bg-white p-5 sm:p-8">
          {offline ? (
            <p role="status" className="rounded-xl bg-mist p-4 text-sm text-ink">Online requests are temporarily unavailable. Your trip details are still available in the catalog.</p>
          ) : session === undefined ? (
            <p role="status" className="text-sm text-muted">Checking your sign-in…</p>
          ) : confirmed ? (
            <div role="status">
              <h2 className="font-display text-3xl">Request received</h2>
              <p className="mt-3 text-muted">Your preferred date and group size were recorded. Availability and pricing still need to be confirmed.</p>
              <p className="mt-5 text-xs font-bold tracking-wider text-deep-blue uppercase">Request reference</p>
              <p className="mt-1 font-mono text-sm break-all">{receipt.id}</p>
              <Link to="/tours" className="primary-button mt-6 min-h-11">Back to tours</Link>
            </div>
          ) : signedIn ? (
            <>
              <h2 className="font-display text-3xl">Travel preferences</h2>
              <p className="mt-2 text-sm break-words text-muted">Signed in as {session.user.email}.</p>
              <button type="button" onClick={switchEmail} className="min-h-11 cursor-pointer rounded-sm text-sm font-bold text-deep-blue underline underline-offset-4">Use a different email</button>
              <form onSubmit={requestTrip} className="mt-3 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="min-w-0 text-sm font-bold">
                    Preferred date
                    <input className={inputClass} name="date" type="date" min={manilaDateAt(1)} max={manilaDateAt(365)} required />
                  </label>
                  <label className="text-sm font-bold">
                    Guests
                    <input className={inputClass} name="guests" type="number" min={1} max={10} step={1} defaultValue={1} required />
                  </label>
                </div>
                <p className="text-sm text-muted">Dates use Philippine time. Requests are available for groups of 1–10.</p>
                <button type="submit" disabled={pending} className="primary-button min-h-12 disabled:cursor-wait disabled:opacity-65">{pending ? 'Sending request…' : 'Send trip request'}</button>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-display text-3xl">Continue with email</h2>
              <p className="mt-2 leading-relaxed text-muted">We’ll send a sign-in link. Open it to return to checkout and enter your travel preferences.</p>
              <form onSubmit={emailSignIn} className="mt-5 space-y-4">
                <label className="block text-sm font-bold">
                  Email address
                  <input name="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={254} className={inputClass} required />
                </label>
                <button type="submit" disabled={pending} className="primary-button min-h-12 disabled:cursor-wait disabled:opacity-65">{pending ? 'Sending link…' : 'Send sign-in link'}</button>
              </form>
              {sentTo && <p role="status" className="mt-4 rounded-xl bg-mist p-4 text-sm break-words">Check {sentTo} for your sign-in link.</p>}
            </>
          )}
          {message && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-900">{message}</p>}
        </div>
        <aside className="overflow-hidden rounded-3xl border border-line bg-white" aria-labelledby="trip-summary">
          <img src={photos + trip.image} alt={trip.alt} width={960} height={640} className="aspect-[2] w-full bg-mist object-cover" />
          <div className="p-5 sm:p-6">
            <p className="mb-2 text-xs font-bold tracking-wider text-deep-blue uppercase">Trip summary</p>
            <h2 id="trip-summary" className="font-display text-3xl tracking-tight">{trip.title}</h2>
            <p className="mt-3 text-sm text-muted">{trip.destination}, {trip.province} · {trip.duration}</p>
            <p className="mt-4 border-t border-line pt-4 text-sm text-muted">No payment is taken at this step.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
