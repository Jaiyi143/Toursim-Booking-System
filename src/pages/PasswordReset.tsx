import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { supabase } from '../lib/supabase'
import { authErrorMessage, useAuthSession } from '../lib/useAuthSession'

const field = 'mt-2 block min-h-12 w-full rounded-lg border border-line bg-paper px-3 text-base'
const link = 'inline-flex min-h-11 items-center text-sm font-bold text-deep-blue underline underline-offset-4'

export function PasswordReset({ recovery = false }: { recovery?: boolean }) {
  const session = useAuthSession()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const callbackError = new URLSearchParams(location.hash.slice(1)).has('error')
  const canReset = !callbackError && session?.user.email && !session.user.is_anonymous

  async function requestEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || busy) return
    const email = String(new FormData(event.currentTarget).get('email')).trim()

    setBusy(true)
    setError('')
    try {
      const redirectTo = new URL(import.meta.env.BASE_URL + 'reset-password', window.location.origin).href
      const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (result.error) {
        setError(authErrorMessage(result.error, 'Could not request a reset link. Try again shortly.'))
      } else {
        setSent(true)
      }
    } catch {
      setError('Could not reach the sign-in service. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || !canReset || busy) return
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))

    setError('')
    if (password !== String(form.get('confirmPassword'))) {
      setError('The passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(authErrorMessage(updateError, 'Could not save that password. Try a different password or request a fresh link.'))
        return
      }

      setSaved(true)
      const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
      if (signOutError) setError('Your password was updated. Sign out from your account before signing in again.')
    } catch {
      setError('Could not reach the sign-in service. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="page-width py-10 sm:py-16">
      <div className="mx-auto max-w-lg rounded-3xl border border-line bg-white p-5 sm:p-8">
        <h1 className="font-display text-4xl tracking-tight">{recovery ? 'Choose a new password' : 'Forgot your password?'}</h1>
        {saved ? (
          <p role="status" className="mt-4 text-muted">Your password was updated. You can sign in with your new password.</p>
        ) : !supabase ? (
          <p role="status" className="mt-4 text-muted">Password reset is temporarily unavailable.</p>
        ) : !recovery ? (
          sent ? (
            <p role="status" className="mt-4 rounded-xl bg-mist p-4 text-sm">If an account uses that email, you’ll receive a reset link.</p>
          ) : (
            <form onSubmit={requestEmail} className="mt-5 grid gap-4">
              <p className="text-muted">Enter your account email and we’ll send you a reset link.</p>
              <label className="text-sm font-bold">Email address
                <input name="email" type="email" autoComplete="email" maxLength={254} className={field} required />
              </label>
              <button type="submit" disabled={busy} className="primary-button min-h-12 disabled:opacity-60">{busy ? 'Sending…' : 'Send reset link'}</button>
            </form>
          )
        ) : session === undefined && !callbackError ? (
          <p role="status" className="mt-4 text-muted">Checking your reset link…</p>
        ) : canReset ? (
          <form onSubmit={savePassword} className="mt-5 grid gap-4">
            <p className="break-words text-muted">Resetting the password for {session.user.email}.</p>
            <label className="text-sm font-bold">New password
              <input name="password" type="password" autoComplete="new-password" minLength={8} className={field} required />
            </label>
            <label className="text-sm font-bold">Confirm new password
              <input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} className={field} required />
            </label>
            <p className="text-sm text-muted">Use at least eight characters.</p>
            <button type="submit" disabled={busy} className="primary-button min-h-12 disabled:opacity-60">{busy ? 'Saving…' : 'Save new password'}</button>
          </form>
        ) : (
          <div className="mt-4">
            <p className="text-muted">This reset link is missing, expired, or already used.</p>
            <Link to="/forgot-password" className={link}>Request a new link</Link>
          </div>
        )}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-900">{error}</p>}
        <Link to="/login" className={link + ' mt-3'}>Back to sign in</Link>
      </div>
    </section>
  )
}
