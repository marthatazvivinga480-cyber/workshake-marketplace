import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { FormEvent, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { providers } from '../data/providers'
import { db } from '../lib/firebase'

export default function BookProviderPage() {
  const { providerId } = useParams()
  const provider = providers.find((item) => item.id === providerId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!db || !user || !provider) { setError('Firebase and a signed-in account are required to create a booking.'); return }
    const data = new FormData(event.currentTarget)
    setSaving(true)
    try {
      await addDoc(collection(db, 'bookings'), {
        customerId: user.uid,
        providerId: provider.id,
        providerName: provider.name,
        title: String(data.get('title')).trim(),
        date: String(data.get('date')),
        time: String(data.get('time')),
        location: String(data.get('location')).trim(),
        note: String(data.get('note')).trim(),
        status: 'Pending',
        createdAt: serverTimestamp(),
      })
      navigate('/bookings', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the booking.')
    } finally { setSaving(false) }
  }

  if (!provider) return <div className="page-shell"><h1 className="text-4xl font-black">Provider not found</h1></div>

  return <div className="page-shell"><SEO title={`Book ${provider.name} | WorkShake`} description={`Request a booking with ${provider.name} on WorkShake.`} path={`/book/${provider.id}`}  noindex/><div className="mx-auto max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-olive">Booking request</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em]">Book {provider.name}.</h1><p className="mt-3 text-forest/75">Send the requested date, time and job summary. The booking remains pending until the provider confirms.</p><form onSubmit={submit} className="mt-8 grid gap-5 rounded-[2rem] border border-forest/10 bg-mist p-6 shadow-soft"><label className="form-field"><span className="form-label">What do you need?</span><input required minLength={5} maxLength={90} name="title" className="form-input" placeholder="e.g. Replace leaking kitchen tap" /></label><div className="grid gap-5 sm:grid-cols-2"><label className="form-field"><span className="form-label">Preferred date</span><input required type="date" name="date" className="form-input" /></label><label className="form-field"><span className="form-label">Preferred time</span><input required type="time" name="time" className="form-input" /></label></div><label className="form-field"><span className="form-label">Location</span><input required name="location" className="form-input" placeholder="Area / suburb" /></label><label className="form-field"><span className="form-label">Extra detail</span><textarea required minLength={20} maxLength={1000} name="note" className="form-textarea" /></label>{error && <p role="alert" className="rounded-xl bg-sun p-3 text-sm font-bold">{error}</p>}<button disabled={saving} className="btn-primary w-fit">{saving ? 'Sending…' : 'Request booking'}</button></form></div></div>
}
