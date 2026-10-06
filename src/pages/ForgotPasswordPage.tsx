import { sendPasswordResetEmail } from 'firebase/auth'
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { auth } from '../lib/firebase'

export default function ForgotPasswordPage() {
  const { configured } = useAuth(); const [message, setMessage] = useState(''); const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setMessage(''); if (!configured || !auth) { setError('Firebase is not configured yet.'); return } const email = String(new FormData(event.currentTarget).get('email')); try { await sendPasswordResetEmail(auth, email); setMessage('If that address has an account, Firebase has sent password reset instructions.') } catch (e) { setError(e instanceof Error ? e.message.replace('Firebase: ', '') : 'Could not send reset email.') } }
  return <div className="page-shell"><SEO title="Reset password | WorkShake" description="Reset your WorkShake account password securely." path="/forgot-password"  noindex/><div className="mx-auto max-w-md rounded-[2rem] border border-forest/10 bg-mist p-7 shadow-soft"><h1 className="text-3xl font-black tracking-[-.04em]">Reset your password.</h1><p className="mt-3 text-sm leading-6 text-forest/75">Enter the email used for your WorkShake account.</p><form onSubmit={submit} className="mt-6 grid gap-4"><label className="form-field"><span className="form-label">Email</span><input required type="email" name="email" className="form-input" /></label>{error && <p role="alert" className="rounded-xl bg-sun p-3 text-sm font-bold">{error}</p>}{message && <p role="status" className="rounded-xl bg-sage p-3 text-sm font-bold">{message}</p>}<button className="btn-primary">Send reset email</button></form><Link className="mt-5 inline-block text-sm font-black text-ink" to="/sign-in">← Back to sign in</Link></div></div>
}
