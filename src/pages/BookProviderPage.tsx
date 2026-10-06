import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import {
  FormEvent,
  useEffect,
  useState,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type BookingProvider = {
  id: string
  name: string
  category: string
  location: string
}

export default function BookProviderPage() {
  const { providerId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [provider, setProvider] =
    useState<BookingProvider | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [saving, setSaving] =
    useState(false)

  useEffect(() => {
    async function loadProvider() {
      if (!db || !providerId) {
        setError(
          'Provider information is unavailable.',
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const providerSnapshot =
          await getDoc(
            doc(
              db,
              'providers',
              providerId,
            ),
          )

        if (!providerSnapshot.exists()) {
          setProvider(null)
          return
        }

        const data =
          providerSnapshot.data()

        const name =
          typeof data.name === 'string' &&
          data.name.trim()
            ? data.name.trim()
            : 'WorkShake provider'

        setProvider({
          id: providerSnapshot.id,

          name,

          category:
            typeof data.category === 'string'
              ? data.category
              : 'Service provider',

          location:
            typeof data.location === 'string'
              ? data.location
              : '',
        })
      } catch (err) {
        console.error(
          'Could not load provider:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load provider.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadProvider()
  }, [providerId])

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (!db) {
      setError(
        'Firebase is not configured.',
      )
      return
    }

    if (!user) {
      setError(
        'Sign in before requesting a booking.',
      )
      return
    }

    if (!provider) {
      setError(
        'This provider is unavailable.',
      )
      return
    }

    if (user.uid === provider.id) {
      setError(
        'You cannot request a booking with your own provider profile.',
      )
      return
    }

    const form =
      event.currentTarget

    const data =
      new FormData(form)

    const title =
      String(
        data.get('title'),
      ).trim()

    const date =
      String(
        data.get('date'),
      ).trim()

    const time =
      String(
        data.get('time'),
      ).trim()

    const location =
      String(
        data.get('location'),
      ).trim()

    const note =
      String(
        data.get('note'),
      ).trim()

    setSaving(true)

    try {
      await addDoc(
        collection(
          db,
          'bookings',
        ),
        {
          customerId:
            user.uid,

          customerName:
            user.displayName ??
            user.email ??
            'Customer',

          providerId:
            provider.id,

          providerName:
            provider.name,

          title,

          date,

          time,

          location,

          note,

          status:
            'Pending',

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        },
      )

      navigate(
        '/bookings',
        {
          replace: true,
        },
      )
    } catch (err) {
      console.error(
        'Could not create booking:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Could not create the booking.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-2xl">
          <div className="skeleton h-5 w-36 rounded-full" />

          <div className="skeleton mt-4 h-12 w-2/3 rounded-2xl" />

          <div className="skeleton mt-4 h-16 rounded-2xl" />

          <div className="skeleton mt-8 h-[32rem] rounded-[2rem]" />
        </div>
      </div>
    )
  }

  if (
    !provider &&
    !error
  ) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-black">
            Provider not found
          </h1>

          <p className="mt-3 text-forest/70">
            This provider profile may no
            longer be available.
          </p>

          <Link
            to="/providers"
            className="btn-primary mt-5 inline-flex"
          >
            Back to providers
          </Link>
        </div>
      </div>
    )
  }

  if (
    error &&
    !provider
  ) {
    return (
      <div className="page-shell">
        <div className="mx-auto max-w-2xl">
          <div
            className="rounded-2xl bg-sun p-4 text-sm font-bold text-ink"
            role="alert"
          >
            {error}
          </div>

          <Link
            to="/providers"
            className="btn-secondary mt-5 inline-flex"
          >
            Back to providers
          </Link>
        </div>
      </div>
    )
  }

  if (!provider) {
    return null
  }

  return (
    <div className="page-shell">
      <SEO
        title={`Book ${provider.name} | WorkShake`}
        description={`Request a booking with ${provider.name} on WorkShake.`}
        path={`/book/${provider.id}`}
        noindex
      />

      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
          Booking request
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-[-.05em]">
          Book {provider.name}.
        </h1>

        <p className="mt-3 leading-7 text-forest/75">
          Send your preferred date,
          time and job details. The
          booking will stay pending
          until {provider.name} accepts
          or declines it.
        </p>

        <div className="mt-5 rounded-2xl bg-sage/40 p-4">
          <p className="font-black text-ink">
            {provider.category}
          </p>

          {provider.location && (
            <p className="mt-1 text-sm text-forest/70">
              Service area:{' '}
              {provider.location}
            </p>
          )}
        </div>

        {!user && (
          <div className="mt-6 rounded-2xl bg-sun p-4 text-sm text-ink">
            <p className="font-bold">
              You need to sign in before
              requesting a booking.
            </p>

            <Link
              to="/sign-in"
              className="mt-3 inline-flex font-black underline"
            >
              Sign in
            </Link>
          </div>
        )}

        <form
          onSubmit={submit}
          className="mt-8 grid gap-5 rounded-[2rem] border border-forest/10 bg-mist p-6 shadow-soft"
        >
          <label className="form-field">
            <span className="form-label">
              What do you need?
            </span>

            <input
              required
              minLength={5}
              maxLength={90}
              name="title"
              className="form-input"
              placeholder="e.g. Replace leaking kitchen tap"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="form-field">
              <span className="form-label">
                Preferred date
              </span>

              <input
                required
                type="date"
                name="date"
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span className="form-label">
                Preferred time
              </span>

              <input
                required
                type="time"
                name="time"
                className="form-input"
              />
            </label>
          </div>

          <label className="form-field">
            <span className="form-label">
              Location
            </span>

            <input
              required
              name="location"
              className="form-input"
              placeholder="Area / suburb"
            />
          </label>

          <label className="form-field">
            <span className="form-label">
              Extra detail
            </span>

            <textarea
              required
              minLength={20}
              maxLength={1000}
              name="note"
              className="form-textarea"
              placeholder="Describe the problem, access details, parts involved or anything else the provider should know."
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

          <button
            type="submit"
            disabled={
              saving ||
              !user
            }
            className="btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? 'Sending…'
              : 'Request booking'}
          </button>
        </form>
      </div>
    </div>
  )
}