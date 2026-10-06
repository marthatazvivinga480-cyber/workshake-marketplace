import { signInWithEmailAndPassword } from 'firebase/auth'
import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { auth } from '../lib/firebase'

export default function SignInPage() {
  const { configured } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const destination = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (!configured || !auth) { setError('Firebase is not configured yet. Copy .env.example to .env and add your Firebase Web App values.'); return }
    const data = new FormData(event.currentTarget)
    setLoading(true)
    try { await signInWithEmailAndPassword(auth, String(data.get('email')), String(data.get('password'))); navigate(destination, { replace: true }) }
    catch (e) { setError(e instanceof Error ? e.message.replace('Firebase: ', '') : 'Could not sign in.') }
    finally { setLoading(false) }
  }

  return <div className="page-shell"><SEO title="Sign in | WorkShake" description="Sign in to manage jobs, bookings, messages and your WorkShake profile." path="/sign-in"  noindex/><div className="mx-auto max-w-md rounded-[2.2rem] border border-forest/10 bg-mist p-6 shadow-soft sm:p-8"><Logo /><h1 className="mt-8 text-3xl font-black tracking-[-.04em]">Welcome back.</h1><p className="mt-2 text-sm leading-6 text-forest/75">Sign in to keep jobs, replies and bookings together.</p><form className="mt-7 grid gap-4" onSubmit={submit}><label className="form-field"><span className="form-label">Email</span><input required autoComplete="email" type="email" name="email" className="form-input" /></label><label className="form-field"><span className="flex items-center justify-between"><span className="form-label">Password</span><Link className="text-xs font-black text-forest" to="/forgot-password">Forgot password?</Link></span><input required autoComplete="current-password" minLength={6} type="password" name="password" className="form-input" /></label>{error && <p role="alert" className="rounded-xl bg-sun p-3 text-sm font-bold">{error}</p>}<button disabled={loading} className="btn-primary mt-2">{loading ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-6 text-center text-sm text-forest/75">New to WorkShake? <Link className="font-black text-ink" to="/sign-up">Create an account</Link></p></div></div>
}
