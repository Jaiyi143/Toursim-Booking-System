import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes, useParams } from 'react-router'
import { SiteLayout } from './components/SiteLayout'
import { HomePage } from './pages/HomePage'
import { Catalog, TripDetails, MissingTrip } from './pages/TourPages'
import { supabase } from './lib/supabase'
import { sampleTrips, type Trip } from './lib/trips'

const Checkout = lazy(() => import('./pages/Checkout').then(({ Checkout }) => ({ default: Checkout })))

const PasswordAuth = lazy(() => import('./pages/Account').then(({ PasswordAuth }) => ({ default: PasswordAuth })))
const Account = lazy(() => import('./pages/Account').then(({ Account }) => ({ default: Account })))

const PasswordReset = lazy(() => import('./pages/PasswordReset').then(({ PasswordReset }) => ({ default: PasswordReset })))

type CatalogState = {
  trips: readonly Trip[]
  status: 'loading' | 'ready' | 'offline'
}

function LoadingTrip() {
  return <p role="status" className="page-width py-12 text-muted">Loading trip…</p>
}

function TripRoute({ catalog, checkout }: { catalog: CatalogState; checkout?: boolean }) {
  const { slug } = useParams()
  const trip = catalog.trips.find((item) => item.slug === slug)

  if (catalog.status === 'loading' && (!trip || checkout)) return <LoadingTrip />
  if (!trip) return <MissingTrip />
  if (!checkout) return <TripDetails trip={trip} />

  return (
    <Suspense fallback={<LoadingTrip />}>
      <Checkout key={trip.slug} trip={trip} offline={catalog.status === 'offline'} />
    </Suspense>
  )
}

function App() {
  const [catalog, setCatalog] = useState<CatalogState>({
    trips: sampleTrips,
    status: supabase ? 'loading' : 'offline',
  })

  useEffect(() => {
    if (!supabase) return
    const controller = new AbortController()

    void supabase.from('tour_trips')
      .select('slug,destination,province,title,category,image,alt,duration,description,highlights')
      .order('position')
      .abortSignal(controller.signal)
      .then(({ data, error }) => {
        if (controller.signal.aborted) return
        setCatalog(error ? { trips: sampleTrips, status: 'offline' } : { trips: data, status: 'ready' })
      })

    return () => controller.abort()
  }, [])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage trips={catalog.trips} />} />
          <Route path="tours" element={<Catalog trips={catalog.trips} offline={catalog.status === 'offline'} />} />
          <Route path="tours/:slug" element={<TripRoute catalog={catalog} />} />
          <Route path="checkout/:slug" element={<TripRoute catalog={catalog} checkout />} />
          <Route path="login" element={<Suspense fallback={<LoadingTrip />}><PasswordAuth key="login" /></Suspense>} />
          <Route path="signup" element={<Suspense fallback={<LoadingTrip />}><PasswordAuth key="signup" signup /></Suspense>} />
          <Route path="forgot-password" element={<Suspense fallback={<LoadingTrip />}><PasswordReset key="request" /></Suspense>} />
          <Route path="reset-password" element={<Suspense fallback={<LoadingTrip />}><PasswordReset key="reset" recovery /></Suspense>} />
          <Route path="account" element={<Suspense fallback={<LoadingTrip />}><Account /></Suspense>} />
          <Route path="*" element={<MissingTrip />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
