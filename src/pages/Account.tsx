import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Link, Navigate, useSearchParams } from 'react-router'
import { authErrorMessage, useAuthSession } from '../lib/useAuthSession'
import { supabase } from '../lib/supabase'

const field = 'mt-2 block min-h-12 w-full rounded-lg border border-line bg-paper px-3 text-base'
const link = 'inline-flex min-h-11 items-center font-bold text-sm text-deep-blue underline underline-offset-4'

export function PasswordAuth({ signup = false }: { signup?: boolean }) {
  const session = useAuthSession()
  const [search] = useSearchParams()
  const requested = search.get('next') ?? ''
  const next = /^\/checkout\/[a-z0-9-]+$/.test(requested) ? requested : '/account'
  const query = next === '/account' ? '' : '?next=' + encodeURIComponent(next)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || busy) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email')).trim()
    const password = String(form.get('password'))
    setBusy(true)
    setFeedback(null)
    try {
      const emailRedirectTo = new URL(import.meta.env.BASE_URL + next.slice(1), window.location.origin).href
      const result = signup
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo } })
        : await supabase.auth.signInWithPassword({ email, password })
      if (result.error) {
        setFeedback({ error: true, text: authErrorMessage(result.error, signup ? 'Could not create the account. Check the email and password.' : 'Check your email and password and try again.') })
      } else if (signup && !result.data.session) {
        setFeedback({ error: false, text: 'Check your email for a confirmation link. If you already have an account, sign in.' })
      }
    } catch {
      setFeedback({ error: true, text: 'Could not reach the sign-in service.' })
    } finally {
      setBusy(false)
    }
  }

  if (session?.user.email && !session.user.is_anonymous) return <Navigate to={next} replace />

  return (
    <section className="page-width py-10 sm:py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-5 sm:p-8">
        <h1 className="font-display text-4xl tracking-tight">{signup ? 'Create a customer account' : 'Sign in'}</h1>
        <p className="mt-3 text-muted">{signup ? 'Keep your trip requests together with an email and password.' : 'Customers and the site owner sign in here.'}</p>
        {!supabase && <p className="mt-4 text-muted">Account access is temporarily unavailable.</p>}
        {supabase && (
          <form onSubmit={submit} className="mt-5 grid gap-4">
            <label className="text-sm font-bold">Email address
              <input name="email" type="email" autoComplete="email" maxLength={254} className={field} required />
            </label>
            <label className="text-sm font-bold">Password
              <input name="password" type="password" autoComplete={signup ? 'new-password' : 'current-password'} minLength={signup ? 8 : undefined} className={field} required />
            </label>
            {signup && <p className="text-sm text-muted">Use at least eight characters.</p>}
            <button disabled={busy || session === undefined} className="primary-button min-h-12 disabled:opacity-60" type="submit">
              {busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
            </button>
          </form>
        )}
        {feedback && <p role={feedback.error ? 'alert' : 'status'} className="mt-4 rounded-xl bg-mist p-4 text-sm">{feedback.text}</p>}
        <div className="mt-3 flex flex-wrap gap-x-4">
          <Link className={link} to={(signup ? '/login' : '/signup') + query}>{signup ? 'Sign in instead' : 'Create a customer account'}</Link>
          {!signup && <Link className={link} to="/forgot-password">Forgot password?</Link>}
          {next !== '/account' && <Link className={link} to={next}>Continue as guest</Link>}
        </div>
      </div>
    </section>
  )
}

type Request = { id: string; trip_slug: string; preferred_date: string; guests: number }
type DashboardData = { isOwner: boolean; requests: Request[] }

function Dashboard({ session }: { session: Session }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState('')
  const [passwordNote, setPasswordNote] = useState('')
  const [saving, setSaving] = useState(false)
  const token = session.access_token

  useEffect(() => {
    if (!supabase) return
    const controller = new AbortController()
    void Promise.all([
      supabase.from('tour_owners').select('user_id').abortSignal(controller.signal).maybeSingle(),
      supabase.from('tour_requests').select('id,trip_slug,preferred_date,guests').order('created_at', { ascending: false }).limit(100).abortSignal(controller.signal),
    ]).then(([owner, requests]) => {
      if (controller.signal.aborted) return
      if (owner.error || requests.error || !requests.data) {
        setError('Could not load your trip requests. Refresh to try again.')
        return
      }
      setError('')
      setData({ isOwner: Boolean(owner.data), requests: requests.data })
    })
    return () => controller.abort()
  }, [token])

  async function signOut() {
    if (!supabase) return
    const result = await supabase.auth.signOut({ scope: 'local' })
    if (result.error) setError('Could not sign out. Try again.')
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || saving) return
    const form = event.currentTarget
    const password = String(new FormData(form).get('password'))
    setSaving(true)
    setPasswordNote('')
    try {
      const result = await supabase.auth.updateUser({ password })
      setPasswordNote(result.error ? 'Could not save that password. Try signing in again and using a stronger password.' : 'Password saved. You can sign in with it next time.')
      if (!result.error) form.reset()
    } catch {
      setPasswordNote('Could not reach the sign-in service.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="page-width py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl tracking-tight">{data?.isOwner ? 'Owner dashboard' : 'My account'}</h1>
          <button type="button" className={link + ' cursor-pointer'} onClick={signOut}>Sign out</button>
        </div>
        <p className="mt-2 break-words text-muted">{session.user.email}</p>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-900">{error}</p>}
        <div className="mt-6 rounded-3xl border border-line bg-white p-5 sm:p-8">
          <h2 className="font-display text-2xl">{data?.isOwner ? 'Recent trip requests' : 'Your trip requests'}</h2>
          {!data && !error && <p role="status" className="mt-3 text-muted">Loading trip requests…</p>}
          {data?.requests.length === 0 && <p className="mt-3 text-muted">No trip requests yet.</p>}
          {data && data.requests.length > 0 && (
            <ul className="mt-4 divide-y divide-line">
              {data.requests.map((request) => (
                <li key={request.id} className="py-3">
                  <Link to={'/tours/' + request.trip_slug} className="font-semibold text-deep-blue underline underline-offset-4">
                    {request.trip_slug.replaceAll('-', ' ')}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{request.preferred_date} · {request.guests} {request.guests === 1 ? 'guest' : 'guests'}</p>
                  <p className="mt-1 font-mono text-xs break-all text-muted">{request.id}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        {data && !data.isOwner && (
          <details className="mt-5 rounded-2xl border border-line bg-white p-5">
            <summary className="cursor-pointer font-semibold">Set or change your account password</summary>
            <form onSubmit={savePassword} className="mt-4 grid max-w-sm gap-3">
              <label className="text-sm font-bold">New password
                <input name="password" type="password" autoComplete="new-password" minLength={8} className={field} required />
              </label>
              <button disabled={saving} className="primary-button min-h-11 disabled:opacity-60" type="submit">Save password</button>
            </form>
            {passwordNote && <p role="status" className="mt-3 text-sm">{passwordNote}</p>}
          </details>
        )}
      </div>
    </section>
  )
}

export function Account() {
  const session = useAuthSession()
  if (session === undefined) return <p role="status" className="page-width py-12 text-muted">Checking your sign-in…</p>
  if (!session?.user.email || session.user.is_anonymous) return <Navigate to="/login" replace />
  return <Dashboard key={session.user.id} session={session} />
}
