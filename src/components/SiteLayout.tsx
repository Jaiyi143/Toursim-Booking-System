import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'

import { useAuthSession } from '../lib/useAuthSession'

const photoCredits = [
  ['Bacuit Bay', 'Vyacheslav Argenberg', 'Tropical_lagoon_in_Bacuit_Bay,_El_Nido,_Palawan,_Philippines.jpg', 'by/4.0', 'CC BY 4.0'],
  ['Big Lagoon', 'nennnn', 'El_Nido_Palawan_Big_Lagoon.jpg', 'by/2.0', 'CC BY 2.0'],
  ['Chocolate Hills', 'rogel tura', 'Bohol%27s_Chocolate_Hills.jpg', '', 'CC0 1.0'],
  ['Siargao coconut groves', 'Michael Angelo Luna', 'Coconut_Trees_View_Deck_in_Siargao.jpg', 'by-sa/4.0', 'CC BY-SA 4.0'],
] as const

export function SiteLayout() {
  const location = useLocation()
  const session = useAuthSession()
  const signedIn = session?.user.email && !session.user.is_anonymous
  const previousPath = useRef(location.pathname)
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    if (previousPath.current === location.pathname) return

    previousPath.current = location.pathname
    window.scrollTo(0, 0)
    main.current?.focus({ preventScroll: true })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <header id="top" className="bg-ink text-white">
        <div className="page-width flex min-h-[74px] items-center justify-between gap-2 sm:gap-4">
          <Link className="flex min-h-11 items-center gap-2 rounded-sm sm:gap-2.5" to="/" aria-label="Nerea Travel Adventure home">
            <span className="block size-12 shrink-0 overflow-hidden rounded-full bg-ink sm:size-16">
              <img
                src={import.meta.env.BASE_URL + 'images/nerea-travel-logo.svg'}
                alt=""
                width={510}
                height={510}
                className="size-full"
              />
            </span>
            <span className="flex flex-col">
              <span className="text-[1.1rem] leading-none font-extrabold tracking-[0.13em] italic">NEREA</span>
              <span className="mt-1 text-[0.575rem] leading-none font-bold tracking-[0.11em] whitespace-nowrap text-sky-100/80 sm:text-[0.625rem] sm:tracking-[0.13em]">TRAVEL ADVENTURE</span>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-3">
            <NavLink to="/tours" className="hidden min-h-11 items-center gap-2 rounded-full border border-white/25 sm:inline-flex px-3 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-white/10 sm:px-5 sm:text-sm">
              Explore trips <span aria-hidden="true">↗</span>
            </NavLink>
            <NavLink to={signedIn ? '/account' : '/login'} className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-3 text-xs font-semibold whitespace-nowrap hover:bg-white/10 sm:px-5 sm:text-sm">
              {signedIn ? 'Account' : 'Sign in'}
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" ref={main} tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-ink py-8 text-white">
        <div className="page-width flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
          <p className="pt-3 text-sm font-bold tracking-wide">Nerea Travel Adventure</p>
          <details className="max-w-full text-sm text-sky-100">
            <summary className="flex min-h-11 w-fit cursor-pointer items-center rounded-sm underline underline-offset-4">Photo credits</summary>
            <ul className="space-y-2 pb-2">
              {photoCredits.map(([title, author, filename, licensePath, license]) => (
                <li key={filename}>
                  <a className="underline underline-offset-4" href={'https://commons.wikimedia.org/wiki/File:' + filename}>{title}</a>
                  {' by ' + author + ' · '}
                  <a className="underline underline-offset-4" href={'https://creativecommons.org/' + (licensePath ? 'licenses/' + licensePath : 'publicdomain/zero/1.0') + '/'}>{license}</a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </footer>
    </div>
  )
}
