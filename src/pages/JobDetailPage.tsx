import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { Clock3, MapPin, WalletCards } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type FirestoreJob = {
  id: string
  title: string
  category: string
  categorySlug: string
  location: string
  description: string
  timing: string
  budgetMin: number
  budgetMax: number
  status: string
  createdBy: string
  createdAt?: Timestamp | null
}

export default function JobDetailPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()

  const [job, setJob] = useState<FirestoreJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function loadJob() {
      if (!db || !id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const jobRef = doc(db, 'jobs', id)
        const snapshot = await getDoc(jobRef)

        if (!snapshot.exists()) {
          setJob(null)
          return
        }

        const data = snapshot.data()

        setJob({
          id: snapshot.id,
          title:
            typeof data.title === 'string'
              ? data.title
              : 'Untitled job',
          category:
            typeof data.category === 'string'
              ? data.category
              : 'General',
          categorySlug:
            typeof data.categorySlug === 'string'
              ? data.categorySlug
              : 'other',
          location:
            typeof data.location === 'string'
              ? data.location
              : '',
          description:
            typeof data.description === 'string'
              ? data.description
              : '',
          timing:
            typeof data.timing === 'string'
              ? data.timing
              : 'Flexible',
          budgetMin:
            typeof data.budgetMin === 'number'
              ? data.budgetMin
              : 0,
          budgetMax:
            typeof data.budgetMax === 'number'
              ? data.budgetMax
              : 0,
          status:
            typeof data.status === 'string'
              ? data.status
              : 'Open',
          createdBy:
            typeof data.createdBy === 'string'
              ? data.createdBy
              : '',
          createdAt:
            data.createdAt &&
            typeof data.createdAt.toDate === 'function'
              ? (data.createdAt as Timestamp)
              : null,
        })
      } catch (err) {
        console.error('Could not load job:', err)

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load this job.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadJob()
  }, [id])

  const budget = useMemo(() => {
    if (!job) return ''

    if (job.budgetMin > 0 && job.budgetMax > 0) {
      return `$${job.budgetMin}–$${job.budgetMax}`
    }

    if (job.budgetMin > 0) {
      return `From $${job.budgetMin}`
    }

    if (job.budgetMax > 0) {
      return `Up to $${job.budgetMax}`
    }

    return 'Budget not specified'
  }, [job])

  const posted = useMemo(() => {
    if (!job?.createdAt) {
      return 'Recently posted'
    }

    const createdAt = job.createdAt.toDate()
    const difference = Date.now() - createdAt.getTime()

    const minutes = Math.floor(difference / 60_000)
    const hours = Math.floor(difference / 3_600_000)
    const days = Math.floor(difference / 86_400_000)

    if (minutes < 1) {
      return 'Just now'
    }

    if (minutes < 60) {
      return `${minutes} min ago`
    }

    if (hours < 24) {
      return `${hours} hr${hours === 1 ? '' : 's'} ago`
    }

    return `${days} day${days === 1 ? '' : 's'} ago`
  }, [job])

  async function respond(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    setMessage('')
    setError('')

    if (!db || !user || !job) {
      setError(
        'Sign in with Firebase configured before responding to jobs.',
      )
      return
    }

    if (profile?.role !== 'provider') {
      setError('Only provider accounts can respond to jobs.')
      return
    }

    if (job.createdBy === user.uid) {
      setError('You cannot respond to your own job.')
      return
    }

    const quote = Number(data.get('quote') || 0)
    const responseMessage = String(
      data.get('message') ?? '',
    ).trim()

    if (quote < 0) {
      setError('Your quote cannot be negative.')
      return
    }

    if (responseMessage.length < 20) {
      setError('Please write a more detailed response.')
      return
    }

    setSending(true)

    try {
      await addDoc(collection(db, 'jobResponses'), {
        jobId: job.id,
        jobTitle: job.title,
        customerId: job.createdBy,
        providerId: user.uid,
        providerName:
          user.displayName ||
          profile?.name ||
          'WorkShake provider',
        quote,
        message: responseMessage,
        status: 'sent',
        createdAt: serverTimestamp(),
      })

      form.reset()

      setMessage(
        'Your response was sent to the customer.',
      )
    } catch (err) {
      console.error('Could not send job response:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Could not send your response.',
      )
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="skeleton h-96 rounded-[2rem]" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="page-shell">
        <h1 className="text-4xl font-black">
          Job not found
        </h1>

        <Link
          to="/find-help"
          className="btn-primary mt-5"
        >
          Browse jobs
        </Link>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <SEO
        title={`${job.title} | WorkShake`}
        description={job.description}
        path={`/job/${job.id}`}
        type="article"
      />

      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="status-pill">
            {job.category}
          </span>

          <span className="text-sm font-bold text-forest/65">
            {posted}
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">
          {job.title}
        </h1>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-sage/55 p-4">
            <MapPin className="h-5 w-5" />

            <p className="mt-3 text-sm font-black">
              {job.location}
            </p>
          </div>

          <div className="rounded-2xl bg-sage/55 p-4">
            <WalletCards className="h-5 w-5" />

            <p className="mt-3 text-sm font-black">
              {budget}
            </p>
          </div>

          <div className="rounded-2xl bg-sage/55 p-4">
            <Clock3 className="h-5 w-5" />

            <p className="mt-3 text-sm font-black">
              {job.timing}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-[2rem] border border-forest/10 bg-mist p-7 shadow-soft">
          <h2 className="text-xl font-black">
            What needs doing
          </h2>

          <p className="mt-3 text-base leading-7 text-forest/85">
            {job.description}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          {profile?.role === 'provider' &&
            job.createdBy !== user?.uid && (
              <a
                href="#respond"
                className="btn-primary"
              >
                Respond to this job
              </a>
            )}

          <Link
            to="/dashboard"
            className="btn-secondary"
          >
            Back to jobs
          </Link>
        </div>

        {profile?.role === 'provider' &&
          job.createdBy !== user?.uid && (
            <section
              id="respond"
              className="mt-12 rounded-[2rem] bg-sage/45 p-6"
            >
              <h2 className="text-2xl font-black">
                Send a response
              </h2>

              <p className="mt-2 text-sm leading-6 text-forest/75">
                Give the customer a useful first reply and a
                realistic starting quote.
              </p>

              <form
                onSubmit={respond}
                className="mt-5 grid gap-4"
              >
                <label className="form-field">
                  <span className="form-label">
                    Your quote (USD)
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    name="quote"
                    className="form-input"
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">
                    Message
                  </span>

                  <textarea
                    minLength={20}
                    maxLength={1000}
                    required
                    name="message"
                    className="form-textarea"
                    placeholder="Explain your availability, relevant experience and anything you need to clarify."
                  />
                </label>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-sun p-3 text-sm font-bold"
                  >
                    {error}
                  </p>
                )}

                {message && (
                  <p
                    role="status"
                    className="rounded-xl bg-mist p-3 text-sm font-bold"
                  >
                    {message}
                  </p>
                )}

                <button
                  disabled={sending}
                  className="btn-primary w-fit disabled:opacity-50"
                >
                  {sending
                    ? 'Sending…'
                    : 'Send response'}
                </button>
              </form>
            </section>
          )}
      </div>
    </div>
  )
}