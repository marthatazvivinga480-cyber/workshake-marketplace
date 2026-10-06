import { Menu, X, UserRound, LogOut, BriefcaseBusiness } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Logo } from './Logo'

const navItems = [
  ['Find help', '/find-help'],
  ['Categories', '/categories'],
  ['Providers', '/providers'],
  ['How it works', '/about'],
] as const

export function Header() {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-forest/10 bg-mist/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
          {navItems.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost"><UserRound className="h-4 w-4" /> Dashboard</Link>
              <button className="btn-ghost" onClick={() => void signOut()}><LogOut className="h-4 w-4" /> Sign out</button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="btn-ghost">Sign in</Link>
              <Link to="/post-problem" className="btn-primary"><BriefcaseBusiness className="h-4 w-4" /> Post a problem</Link>
            </>
          )}
        </div>
        <button
          className="grid h-11 w-11 place-items-center rounded-xl border border-forest/15 text-ink lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-forest/10 bg-mist px-4 pb-5 pt-4 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">
            {navItems.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold text-ink hover:bg-sage">{label}</Link>)}
            <Link to="/post-problem" onClick={() => setOpen(false)} className="btn-primary mt-2">Post a problem</Link>
            {user ? (
              <button className="btn-secondary mt-1" onClick={() => { void signOut(); setOpen(false) }}>Sign out</button>
            ) : (
              <Link to="/sign-in" onClick={() => setOpen(false)} className="btn-secondary mt-1">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
