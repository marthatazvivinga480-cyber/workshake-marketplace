import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { auth, db } from '../lib/firebase'

export default function SignUpPage() {
  const { configured } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    if (!configured || !auth) { setError('Firebase is not configured yet. Add your Firebase Web App values to .env.'); return }
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password')); const confirm = String(data.get('confirm'))
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const credential = await createUserWithEmailAndPassword(auth, String(data.get('email')), password)
      const name = String(data.get('name')).trim(); const role = String(data.get('role'))
      await updateProfile(credential.user, { displayName: name })
      if (db) await setDoc(doc(db, 'users', credential.user.uid), { name, email: credential.user.email, role, createdAt: serverTimestamp() }, { merge: true })
      navigate(role === 'provider' ? '/become-a-provider' : '/dashboard', { replace: true })
    } catch (e) { setError(e instanceof Error ? e.message.replace('Firebase: ', '') : 'Could not create account.') }
    finally { setLoading(false) }
  }

  return <div className="page-shell"><SEO title="Create an account | WorkShake" description="Create your WorkShake account to request help or offer local services." path="/sign-up"  noindex/><div className="mx-auto max-w-lg rounded-[2.2rem] border border-forest/10 bg-mist p-6 shadow-soft sm:p-8"><Logo /><h1 className="mt-8 text-3xl font-black tracking-[-.04em]">Create your WorkShake account.</h1><form className="mt-7 grid gap-4" onSubmit={submit}><label className="form-field"><span className="form-label">Full name</span><input required minLength={2} autoComplete="name" name="name" className="form-input" /></label><label className="form-field"><span className="form-label">Email</span><input required autoComplete="email" type="email" name="email" className="form-input" /></label><label className="form-field"><span className="form-label">I mainly want to</span><select className="form-select" name="role"><option value="customer">Find help</option><option value="provider">Offer services</option></select></label><div className="grid gap-4 sm:grid-cols-2"><label className="form-field"><span className="form-label">Password</span><input required minLength={8} autoComplete="new-password" type="password" name="password" className="form-input" /></label><label className="form-field"><span className="form-label">Confirm password</span><input required minLength={8} autoComplete="new-password" type="password" name="confirm" className="form-input" /></label></div>{error && <p role="alert" className="rounded-xl bg-sun p-3 text-sm font-bold">{error}</p>}<button disabled={loading} className="btn-primary mt-2">{loading ? 'Creating account…' : 'Create account'}</button></form><p className="mt-5 text-xs leading-5 text-forest/65">By creating an account you agree to the <Link className="font-bold" to="/terms">Terms</Link> and <Link className="font-bold" to="/privacy">Privacy Policy</Link>.</p><p className="mt-5 text-center text-sm text-forest/75">Already registered? <Link className="font-black text-ink" to="/sign-in">Sign in</Link></p></div></div>
}
