import { useEffect, useState } from 'react'
import type { AuthError, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export function useAuthSession() {
  const [session, setSession] = useState<Session | null | undefined>(supabase ? undefined : null)

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => subscription.unsubscribe()
  }, [])

  return session
}

export function authErrorMessage(error: AuthError, fallback: string) {
  if (error.status === 429) return 'Too many requests. Wait for the limit to reset before trying again.'
  if (error.code === 'email_address_not_authorized') return 'The email service can currently send only to authorized test addresses.'
  if (error.code === 'email_not_confirmed') return 'Confirm your email before signing in.'
  return fallback
}
