import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  type Timestamp,
} from 'firebase/firestore'
import {
  Check,
  ChevronDown,
  Star,
} from 'lucide-react'
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type CompletedBooking = {
  id: string
  jobId?: string
  title?: string
  providerId?: string
  providerName?: string
  status?: string
}

type Review = {
  id: string
  authorId: string
  authorName: string
  providerId: string
  providerName: string
  bookingId: string
  jobId?: string
  jobTitle?: string
  rating: number
  body: string
  createdAt?: Timestamp | null
}

type DropdownOption = {
  value: string
  label: ReactNode
}

type RoundedDropdownProps = {
  label: string
  name: string
  value: string
  placeholder: string
  options: DropdownOption[]
  onChange: (value: string) => void
}

function RoundedDropdown({
  label,
  name,
  value,
  placeholder,
  options,
  onChange,
}: RoundedDropdownProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const selectedOption = options.find(
    (option) => option.value === value,
  )

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick,
      )
    }
  }, [])

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ' ' ||
      event.key === 'ArrowDown'
    ) {
      event.preventDefault()
      setOpen(true)
    }

    if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <label className="form-field">
      <span className="form-label">
        {label}
      </span>

      <input
        type="hidden"
        name={name}
        value={value}
      />

      <div
        ref={wrapperRef}
        className="relative"
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() =>
            setOpen((current) => !current)
          }
          onKeyDown={handleKeyDown}
          className={`flex h-11 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm text-ink outline-none transition ${
            open
              ? 'border-olive ring-2 ring-olive/15'
              : 'border-forest/15 hover:border-forest/30'
          }`}
        >
          <span
            className={
              selectedOption
                ? 'truncate text-ink'
                : 'truncate text-forest/55'
            }
          >
            {selectedOption?.label ||
              placeholder}
          </span>

          <ChevronDown
            className={`ml-3 h-4 w-4 shrink-0 text-forest/55 transition-transform ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-forest/10 bg-white p-1.5 shadow-xl"
          >
            {options.map((option) => {
              const selected =
                option.value === value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    selected
                      ? 'bg-sage text-ink'
                      : 'text-forest hover:bg-sage/35'
                  }`}
                >
                  <span className="truncate">
                    {option.label}
                  </span>

                  {selected && (
                    <Check className="ml-3 h-4 w-4 shrink-0 text-forest" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </label>
  )
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map(
    (_, index) => (
      <Star
        key={index}
        className={
          index < rating
            ? 'h-4 w-4 fill-sun text-forest'
            : 'h-4 w-4 text-forest/25'
        }
      />
    ),
  )
}

function formatReviewDate(
  timestamp?: Timestamp | null,
) {
  if (!timestamp) return ''

  return new Intl.DateTimeFormat('en-ZW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(timestamp.toDate())
}

export default function ReviewsPage() {
  const { user, configured } = useAuth()

  const [bookings, setBookings] = useState<
    CompletedBooking[]
  >([])

  const [reviews, setReviews] = useState<
    Review[]
  >([])

  const [selectedBookingId, setSelectedBookingId] =
    useState('')

  const [selectedRating, setSelectedRating] =
    useState('5')

  const [loading, setLoading] =
    useState(true)

  const [submitting, setSubmitting] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadReviewsPage() {
      if (!db) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const reviewsSnapshot =
          await getDocs(
            collection(db, 'reviews'),
          )

        const loadedReviews: Review[] =
          reviewsSnapshot.docs
            .map((document) => {
              const data =
                document.data()

              return {
                id: document.id,

                authorId:
                  typeof data.authorId ===
                  'string'
                    ? data.authorId
                    : '',

                authorName:
                  typeof data.authorName ===
                  'string'
                    ? data.authorName
                    : 'WorkShake customer',

                providerId:
                  typeof data.providerId ===
                  'string'
                    ? data.providerId
                    : '',

                providerName:
                  typeof data.providerName ===
                  'string'
                    ? data.providerName
                    : 'WorkShake provider',

                bookingId:
                  typeof data.bookingId ===
                  'string'
                    ? data.bookingId
                    : '',

                jobId:
                  typeof data.jobId ===
                  'string'
                    ? data.jobId
                    : undefined,

                jobTitle:
                  typeof data.jobTitle ===
                  'string'
                    ? data.jobTitle
                    : undefined,

                rating:
                  typeof data.rating ===
                  'number'
                    ? data.rating
                    : 0,

                body:
                  typeof data.body ===
                  'string'
                    ? data.body
                    : '',

                createdAt:
                  data.createdAt &&
                  typeof data.createdAt
                    .toDate ===
                    'function'
                    ? (data.createdAt as Timestamp)
                    : null,
              }
            })
            .filter(
              (review) =>
                review.rating >= 1 &&
                review.rating <= 5 &&
                Boolean(review.body),
            )
            .sort(
              (a, b) =>
                (b.createdAt?.toMillis?.() ??
                  0) -
                (a.createdAt?.toMillis?.() ??
                  0),
            )

        setReviews(loadedReviews)

        if (!user) {
          setBookings([])
          return
        }

        const bookingsQuery = query(
          collection(db, 'bookings'),
          where(
            'customerId',
            '==',
            user.uid,
          ),
        )

        const bookingsSnapshot =
          await getDocs(bookingsQuery)

        const completedBookings: CompletedBooking[] =
          bookingsSnapshot.docs
            .map((document) => {
              const data =
                document.data()

              return {
                id: document.id,

                jobId:
                  typeof data.jobId ===
                  'string'
                    ? data.jobId
                    : undefined,

                title:
                  typeof data.title ===
                  'string'
                    ? data.title
                    : 'WorkShake booking',

                providerId:
                  typeof data.providerId ===
                  'string'
                    ? data.providerId
                    : undefined,

                providerName:
                  typeof data.providerName ===
                  'string'
                    ? data.providerName
                    : 'Provider',

                status:
                  typeof data.status ===
                  'string'
                    ? data.status
                    : 'Confirmed',
              }
            })
            .filter(
              (booking) =>
                booking.status ===
                  'Completed' &&
                Boolean(
                  booking.providerId,
                ),
            )

        setBookings(
          completedBookings,
        )
      } catch (err) {
        console.error(
          'Could not load reviews:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load reviews.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadReviewsPage()
  }, [user])

  const reviewableBookings =
    useMemo(() => {
      if (!user) return []

      return bookings.filter(
        (booking) =>
          !reviews.some(
            (review) =>
              review.authorId ===
                user.uid &&
              review.bookingId ===
                booking.id,
          ),
      )
    }, [
      bookings,
      reviews,
      user,
    ])

  const bookingOptions =
    useMemo(
      () =>
        reviewableBookings.map(
          (booking) => ({
            value: booking.id,
            label: `${booking.title} — ${booking.providerName}`,
          }),
        ),
      [reviewableBookings],
    )

  const ratingOptions: DropdownOption[] = [
    {
      value: '5',
      label: '5 — Excellent',
    },
    {
      value: '4',
      label: '4 — Good',
    },
    {
      value: '3',
      label: '3 — Okay',
    },
    {
      value: '2',
      label: '2 — Poor',
    },
    {
      value: '1',
      label: '1 — Very poor',
    },
  ]

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!db || !user) {
      setError(
        'Sign in before leaving a review.',
      )
      return
    }

    const form =
      event.currentTarget

    const data =
      new FormData(form)

    const bookingId = String(
      data.get('bookingId') ?? '',
    )

    const rating = Number(
      data.get('rating'),
    )

    const body = String(
      data.get('body') ?? '',
    ).trim()

    const booking =
      reviewableBookings.find(
        (item) =>
          item.id === bookingId,
      )

    if (!booking) {
      setError(
        'Choose a completed booking to review.',
      )
      return
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      setError(
        'Choose a rating between 1 and 5.',
      )
      return
    }

    if (body.length < 20) {
      setError(
        'Your review must be at least 20 characters.',
      )
      return
    }

    if (!booking.providerId) {
      setError(
        'This booking does not have a provider attached.',
      )
      return
    }

    setSubmitting(true)

    try {
      const reviewRef =
        await addDoc(
          collection(
            db,
            'reviews',
          ),
          {
            authorId: user.uid,

            authorName:
              user.displayName ||
              'WorkShake customer',

            providerId:
              booking.providerId,

            providerName:
              booking.providerName ||
              'WorkShake provider',

            bookingId:
              booking.id,

            jobId:
              booking.jobId || null,

            jobTitle:
              booking.title ||
              'WorkShake booking',

            rating,

            body,

            createdAt:
              serverTimestamp(),
          },
        )

      setReviews((current) => [
        {
          id: reviewRef.id,

          authorId: user.uid,

          authorName:
            user.displayName ||
            'WorkShake customer',

          providerId:
            booking.providerId ||
            '',

          providerName:
            booking.providerName ||
            'WorkShake provider',

          bookingId:
            booking.id,

          jobId:
            booking.jobId,

          jobTitle:
            booking.title,

          rating,

          body,

          createdAt: null,
        },
        ...current,
      ])

      form.reset()

      setSelectedBookingId('')
      setSelectedRating('5')

      setMessage(
        `Your review for ${
          booking.providerName ||
          'the provider'
        } has been submitted.`,
      )
    } catch (err) {
      console.error(
        'Could not submit review:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Could not submit your review.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-shell">
      <SEO
        title="Customer reviews | WorkShake"
        description="Read real WorkShake customer reviews and learn how ratings support trusted local work."
        path="/reviews"
      />

      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
          Reviews
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-[-.05em] sm:text-5xl">
          Trust grows one completed job at a time.
        </h1>

        <p className="mt-4 text-lg leading-8 text-forest/75">
          Reviews come from completed
          WorkShake bookings and help
          customers understand communication,
          reliability and service quality.
        </p>
      </div>

      {loading ? (
        <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="skeleton h-56 rounded-[2rem]"
              />
            ),
          )}
        </div>
      ) : reviews.length ? (
        <section className="mt-9">
          <div>
            <h2 className="text-2xl font-black">
              Recent reviews
            </h2>

            <p className="mt-1 text-sm text-forest/60">
              Feedback from completed
              WorkShake jobs.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map(
              (review) => (
                <article
                  key={review.id}
                  className="rounded-[2rem] border border-forest/10 bg-mist p-5 shadow-soft"
                >
                  <div className="flex gap-1">
                    {renderStars(
                      review.rating,
                    )}
                  </div>

                  <p className="mt-4 text-sm font-bold leading-6 text-ink">
                    “{review.body}”
                  </p>

                  <div className="mt-5 border-t border-forest/10 pt-4">
                    <p className="font-black text-ink">
                      {
                        review.authorName
                      }
                    </p>

                    <p className="mt-1 text-xs text-forest/60">
                      Review for{' '}
                      <span className="font-bold">
                        {
                          review.providerName
                        }
                      </span>
                    </p>

                    {review.jobTitle && (
                      <p className="mt-1 text-xs text-forest/50">
                        {
                          review.jobTitle
                        }
                      </p>
                    )}

                    {review.createdAt && (
                      <p className="mt-2 text-[11px] text-forest/40">
                        {formatReviewDate(
                          review.createdAt,
                        )}
                      </p>
                    )}
                  </div>
                </article>
              ),
            )}
          </div>
        </section>
      ) : (
        <div className="mt-9 max-w-3xl rounded-[2rem] border border-dashed border-forest/20 p-6">
          <p className="font-black">
            No reviews yet.
          </p>

          <p className="mt-1 text-sm text-forest/65">
            Reviews will appear here after
            customers complete jobs and leave
            feedback.
          </p>
        </div>
      )}

      <section className="mt-12 max-w-2xl">
        <form
          onSubmit={submit}
          className="rounded-[2rem] border border-forest/10 bg-mist p-6 shadow-soft"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-olive">
              Leave feedback
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Review a completed job
            </h2>

            <p className="mt-2 text-sm leading-6 text-forest/65">
              You can review a provider after
              the service has been marked
              completed.
            </p>
          </div>

          {!configured || !user ? (
            <div className="mt-5 rounded-2xl bg-sage/35 p-4">
              <p className="text-sm text-forest/70">
                Sign in to review a completed
                booking.
              </p>

              <Link
                to="/sign-in"
                className="mt-3 inline-flex text-sm font-black text-forest underline"
              >
                Sign in
              </Link>
            </div>
          ) : reviewableBookings.length ? (
            <div className="mt-5 grid gap-4">
              <RoundedDropdown
                label="Completed job"
                name="bookingId"
                value={
                  selectedBookingId
                }
                placeholder="Choose a completed booking"
                options={bookingOptions}
                onChange={
                  setSelectedBookingId
                }
              />

              <RoundedDropdown
                label="Rating"
                name="rating"
                value={
                  selectedRating
                }
                placeholder="Choose a rating"
                options={
                  ratingOptions
                }
                onChange={
                  setSelectedRating
                }
              />

              <label className="form-field">
                <span className="form-label">
                  Your review
                </span>

                <textarea
                  minLength={20}
                  maxLength={700}
                  required
                  className="form-textarea"
                  name="body"
                  placeholder="How was the communication, reliability and quality of the work?"
                />
              </label>

              {error && (
                <p
                  className="rounded-xl bg-sun p-3 text-sm font-bold"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {message && (
                <div
                  className="flex items-center gap-2 rounded-xl bg-sage p-3 text-sm font-bold"
                  role="status"
                >
                  <Check className="h-4 w-4 shrink-0" />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="btn-primary inline-flex h-10 w-fit items-center justify-center px-5 leading-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? 'Submitting…'
                  : 'Submit review'}
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-sage/30 p-4">
              <p className="font-bold text-ink">
                No completed jobs available
                to review.
              </p>

              <p className="mt-1 text-sm leading-6 text-forest/60">
                Once one of your bookings is
                completed, it will appear
                here.
              </p>
            </div>
          )}
        </form>
      </section>
    </div>
  )
}