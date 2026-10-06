import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { categories } from '../data/categories'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

export default function PostProblemPage() {
  const { user, configured } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preset = params.get('category') ?? ''

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    setError('')
    setMessage('')

    if (!configured || !db) {
      setError(
        'Add your Firebase configuration in .env before submitting live jobs.',
      )
      return
    }

    if (!user) {
      navigate('/sign-in', {
        state: { from: '/post-problem' },
      })
      return
    }

    const title = String(data.get('title') ?? '').trim()
    const location = String(data.get('location') ?? '').trim()
    const description = String(data.get('description') ?? '').trim()
    const timing = String(data.get('timing') ?? 'Flexible')

    const budgetMinRaw = String(data.get('budgetMin') ?? '').trim()
    const budgetMaxRaw = String(data.get('budgetMax') ?? '').trim()

    const budgetMin = budgetMinRaw ? Number(budgetMinRaw) : 0
    const budgetMax = budgetMaxRaw ? Number(budgetMaxRaw) : 0

    const categorySlug = String(data.get('category') ?? '')
    const category = categories.find((item) => item.slug === categorySlug)

    if (!category) {
      setError('Please select a valid category.')
      return
    }

    if (budgetMin < 0 || budgetMax < 0) {
      setError('Budget values cannot be negative.')
      return
    }

    if (budgetMin > 0 && budgetMax > 0 && budgetMin > budgetMax) {
      setError('The minimum budget cannot be greater than the maximum budget.')
      return
    }

    setSaving(true)

    try {
      await addDoc(collection(db, 'jobs'), {
        title,
        category: category.name,
        categorySlug: category.slug,
        location,
        description,
        timing,
        budgetMin,
        budgetMax,
        status: 'Open',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })

      form.reset()

      setMessage(
        'Your problem is live. Suitable providers can now respond.',
      )
    } catch (error) {
      console.error('Failed to create job:', error)

      setError(
        error instanceof Error
          ? error.message
          : 'Could not post the job. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-shell">
      <SEO
        title="Post a problem | WorkShake"
        description="Describe what you need, set your budget and receive responses from suitable local providers."
        path="/post-problem"
      />

      <div className="grid gap-10 lg:grid-cols-[1.1fr_.7fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
            Create a request
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">
            Tell people exactly what needs doing.
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-forest/80">
            Clear jobs get clearer replies. You can discuss final pricing with
            the provider before confirming.
          </p>

          <form className="mt-8 grid gap-5" onSubmit={submit}>
            <label className="form-field">
              <span className="form-label">Job title</span>

              <input
                required
                minLength={5}
                maxLength={90}
                className="form-input"
                name="title"
                placeholder="e.g. Kitchen tap is leaking"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="form-field">
                <span className="form-label">Category</span>

                <select
                  required
                  defaultValue={preset}
                  className="form-select"
                  name="category"
                >
                  <option value="" disabled>
                    Select a category
                  </option>

                  {categories.map((category) => (
                    <option value={category.slug} key={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span className="form-label">General location</span>

                <input
                  required
                  className="form-input"
                  name="location"
                  placeholder="Area, suburb or town"
                />
              </label>
            </div>

            <label className="form-field">
              <span className="form-label">Describe the problem</span>

              <textarea
                required
                minLength={20}
                maxLength={1200}
                className="form-textarea"
                name="description"
                placeholder="What is happening, what have you tried and what should the provider know?"
              />

              <span className="form-help">
                Avoid sharing private contact details in the public description.
              </span>
            </label>

            <div className="grid gap-5 sm:grid-cols-3">
              <label className="form-field">
                <span className="form-label">Timing</span>

                <select name="timing" className="form-select">
                  <option>Today</option>
                  <option>This week</option>
                  <option>Flexible</option>
                </select>
              </label>

              <label className="form-field">
                <span className="form-label">Budget from (USD)</span>

                <input
                  className="form-input"
                  min="0"
                  step="1"
                  type="number"
                  name="budgetMin"
                  placeholder="20"
                />
              </label>

              <label className="form-field">
                <span className="form-label">Budget to (USD)</span>

                <input
                  className="form-input"
                  min="0"
                  step="1"
                  type="number"
                  name="budgetMax"
                  placeholder="40"
                />
              </label>
            </div>

            {error && (
              <p
                className="rounded-xl bg-sun p-3 text-sm font-bold text-ink"
                role="alert"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                className="rounded-xl bg-sage p-3 text-sm font-bold text-ink"
                role="status"
              >
                {message}
              </p>
            )}

            <button
              disabled={saving}
              className="btn-primary w-fit disabled:opacity-50"
              type="submit"
            >
              {saving ? 'Posting…' : 'Post problem'}
            </button>
          </form>
        </div>

        <aside className="h-fit rounded-[2rem] bg-sun p-7 lg:sticky lg:top-28">
          <h2 className="text-xl font-black">What happens next?</h2>

          <ol className="mt-5 space-y-5 text-sm leading-6 text-forest/85">
            {[
              ['1', 'Your request appears in the relevant category.'],
              ['2', 'Providers can review the details and respond.'],
              ['3', 'You compare profiles, chat and choose who to book.'],
              ['4', 'After the work, leave a review for the next customer.'],
            ].map(([number, text]) => (
              <li className="flex gap-3" key={number}>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-forest text-xs font-black text-mist">
                  {number}
                </span>

                {text}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  )
}