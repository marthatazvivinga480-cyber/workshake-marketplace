import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  MapPin,
  MessageSquareText,
  Star,
  X,
} from 'lucide-react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type ProviderApplication = {
  categorySlug?: string
  status?: string
}

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

type ProviderBooking = {
  id: string
  jobId?: string
  title?: string
  customerId?: string
  customerName?: string
  providerId?: string
  providerName?: string
  quote?: number
  date?: string
  time?: string
  location?: string
  note?: string
  status?: string
  createdAt?: Timestamp | null
}

type ProviderReview = {
  id: string
  rating: number
}

type BookingStatus =
  | 'Confirmed'
  | 'Declined'
  | 'In progress'
  | 'Completed'

function formatLocation(
  value?: string,
) {
  if (!value) {
    return 'Location in job details'
  }

  return value
    .replace(/\s+,/g, ',')
    .replace(/,\s*/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(
      /\bharare\b/gi,
      'Harare',
    )
    .replace(
      /\bbelvedere\b/gi,
      'Belvedere',
    )
    .trim()
}

function formatDate(
  value?: string,
) {
  if (!value) {
    return 'Date to confirm'
  }

  const [
    year,
    month,
    day,
  ] = value
    .split('-')
    .map(Number)

  if (
    !year ||
    !month ||
    !day
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'en-ZW',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  )
}

function formatTime(
  value?: string,
) {
  if (!value) {
    return 'Time to confirm'
  }

  const [
    hours,
    minutes,
  ] = value
    .split(':')
    .map(Number)

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value
  }

  const date =
    new Date()

  date.setHours(
    hours,
    minutes,
    0,
    0,
  )

  return new Intl.DateTimeFormat(
    'en-ZW',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
}

function isAllowedTransition(
  currentStatus:
    | string
    | undefined,
  nextStatus: BookingStatus,
) {
  if (
    currentStatus ===
    'Pending'
  ) {
    return (
      nextStatus ===
        'Confirmed' ||
      nextStatus ===
        'Declined'
    )
  }

  if (
    currentStatus ===
    'Confirmed'
  ) {
    return (
      nextStatus ===
      'In progress'
    )
  }

  if (
    currentStatus ===
    'In progress'
  ) {
    return (
      nextStatus ===
      'Completed'
    )
  }

  return false
}

export default function ProviderDashboardPage() {
  const { user } =
    useAuth()

  const [
    jobs,
    setJobs,
  ] =
    useState<
      FirestoreJob[]
    >([])

  const [
    bookings,
    setBookings,
  ] =
    useState<
      ProviderBooking[]
    >([])

  const [
    reviews,
    setReviews,
  ] =
    useState<
      ProviderReview[]
    >([])

  const [
    providerCategory,
    setProviderCategory,
  ] =
    useState<
      string | null
    >(null)

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    updatingBookingId,
    setUpdatingBookingId,
  ] =
    useState<
      string | null
    >(null)

  const [
    error,
    setError,
  ] =
    useState('')

  const [
    message,
    setMessage,
  ] =
    useState('')

  useEffect(() => {
    async function loadDashboard() {
      if (
        !db ||
        !user
      ) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const applicationRef =
          doc(
            db,
            'providerApplications',
            user.uid,
          )

        const applicationSnapshot =
          await getDoc(
            applicationRef,
          )

        let categorySlug:
          | string
          | null = null

        if (
          applicationSnapshot.exists()
        ) {
          const applicationData =
            applicationSnapshot.data() as ProviderApplication

          if (
            typeof applicationData.categorySlug ===
            'string'
          ) {
            categorySlug =
              applicationData.categorySlug

            setProviderCategory(
              categorySlug,
            )
          }
        }

        const [
          jobsSnapshot,
          bookingsSnapshot,
          reviewsSnapshot,
        ] =
          await Promise.all([
            getDocs(
              collection(
                db,
                'jobs',
              ),
            ),

            getDocs(
              query(
                collection(
                  db,
                  'bookings',
                ),
                where(
                  'providerId',
                  '==',
                  user.uid,
                ),
              ),
            ),

            getDocs(
              query(
                collection(
                  db,
                  'reviews',
                ),
                where(
                  'providerId',
                  '==',
                  user.uid,
                ),
              ),
            ),
          ])

        const liveJobs:
          FirestoreJob[] =
          jobsSnapshot.docs
            .map(
              (
                jobDocument,
              ) => {
                const data =
                  jobDocument.data()

                return {
                  id:
                    jobDocument.id,

                  title:
                    typeof data.title ===
                    'string'
                      ? data.title
                      : 'Untitled job',

                  category:
                    typeof data.category ===
                    'string'
                      ? data.category
                      : 'General',

                  categorySlug:
                    typeof data.categorySlug ===
                    'string'
                      ? data.categorySlug
                      : 'other',

                  location:
                    typeof data.location ===
                    'string'
                      ? formatLocation(
                          data.location,
                        )
                      : '',

                  description:
                    typeof data.description ===
                    'string'
                      ? data.description
                      : '',

                  timing:
                    typeof data.timing ===
                    'string'
                      ? data.timing
                      : 'Flexible',

                  budgetMin:
                    typeof data.budgetMin ===
                    'number'
                      ? data.budgetMin
                      : 0,

                  budgetMax:
                    typeof data.budgetMax ===
                    'number'
                      ? data.budgetMax
                      : 0,

                  status:
                    typeof data.status ===
                    'string'
                      ? data.status
                      : 'Open',

                  createdBy:
                    typeof data.createdBy ===
                    'string'
                      ? data.createdBy
                      : '',

                  createdAt:
                    data.createdAt &&
                    typeof data.createdAt
                      .toDate ===
                      'function'
                      ? (data.createdAt as Timestamp)
                      : null,
                }
              },
            )
            .filter(
              (job) =>
                job.status ===
                'Open',
            )
            .filter(
              (job) =>
                job.createdBy !==
                user.uid,
            )
            .sort(
              (a, b) =>
                (b.createdAt
                  ?.toMillis?.() ??
                  0) -
                (a.createdAt
                  ?.toMillis?.() ??
                  0),
            )

        const providerBookings:
          ProviderBooking[] =
          bookingsSnapshot.docs
            .map(
              (
                bookingDocument,
              ) => {
                const data =
                  bookingDocument.data()

                return {
                  id:
                    bookingDocument.id,

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

                  customerId:
                    typeof data.customerId ===
                    'string'
                      ? data.customerId
                      : undefined,

                  customerName:
                    typeof data.customerName ===
                    'string'
                      ? data.customerName
                      : 'Customer',

                  providerId:
                    typeof data.providerId ===
                    'string'
                      ? data.providerId
                      : undefined,

                  providerName:
                    typeof data.providerName ===
                    'string'
                      ? data.providerName
                      : undefined,

                  quote:
                    typeof data.quote ===
                    'number'
                      ? data.quote
                      : undefined,

                  date:
                    typeof data.date ===
                    'string'
                      ? data.date
                      : '',

                  time:
                    typeof data.time ===
                    'string'
                      ? data.time
                      : '',

                  location:
                    typeof data.location ===
                    'string'
                      ? formatLocation(
                          data.location,
                        )
                      : '',

                  note:
                    typeof data.note ===
                    'string'
                      ? data.note
                      : '',

                  status:
                    typeof data.status ===
                    'string'
                      ? data.status
                      : 'Confirmed',

                  createdAt:
                    data.createdAt &&
                    typeof data.createdAt
                      .toDate ===
                      'function'
                      ? (data.createdAt as Timestamp)
                      : null,
                }
              },
            )
            .sort(
              (a, b) =>
                (b.createdAt
                  ?.toMillis?.() ??
                  0) -
                (a.createdAt
                  ?.toMillis?.() ??
                  0),
            )

        const providerReviews:
          ProviderReview[] =
          reviewsSnapshot.docs
            .map(
              (
                reviewDocument,
              ) => {
                const data =
                  reviewDocument.data()

                return {
                  id:
                    reviewDocument.id,

                  rating:
                    typeof data.rating ===
                    'number'
                      ? data.rating
                      : 0,
                }
              },
            )
            .filter(
              (review) =>
                review.rating >=
                  1 &&
                review.rating <=
                  5,
            )

        const providerBookedJobIds =
          new Set(
            providerBookings
              .map(
                (booking) =>
                  booking.jobId,
              )
              .filter(
                (
                  jobId,
                ): jobId is string =>
                  Boolean(
                    jobId,
                  ),
              ),
          )

        const availableJobs =
          liveJobs.filter(
            (job) =>
              !providerBookedJobIds.has(
                job.id,
              ),
          )

        setJobs(
          availableJobs,
        )

        setBookings(
          providerBookings,
        )

        setReviews(
          providerReviews,
        )
      } catch (err) {
        console.error(
          'Could not load provider dashboard:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load provider dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [user])

  const relevantJobs =
    useMemo(() => {
      if (
        !providerCategory
      ) {
        return jobs
      }

      const matchingJobs =
        jobs.filter(
          (job) =>
            job.categorySlug ===
            providerCategory,
        )

      const otherJobs =
        jobs.filter(
          (job) =>
            job.categorySlug !==
            providerCategory,
        )

      return [
        ...matchingJobs,
        ...otherJobs,
      ]
    }, [
      jobs,
      providerCategory,
    ])

  const pendingBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.status ===
            'Pending',
        ),
      [bookings],
    )

  const activeBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.status ===
              'Confirmed' ||
            booking.status ===
              'In progress',
        ),
      [bookings],
    )

  const completedBookings =
    useMemo(
      () =>
        bookings.filter(
          (booking) =>
            booking.status ===
            'Completed',
        ),
      [bookings],
    )

  const averageRating =
    useMemo(() => {
      if (
        !reviews.length
      ) {
        return null
      }

      const total =
        reviews.reduce(
          (
            sum,
            review,
          ) =>
            sum +
            review.rating,
          0,
        )

      return (
        total /
        reviews.length
      )
    }, [reviews])

  const thisMonthEarnings =
    useMemo(() => {
      const now =
        new Date()

      return bookings.reduce(
        (
          total,
          booking,
        ) => {
          if (
            booking.status !==
              'Completed' ||
            typeof booking.quote !==
              'number'
          ) {
            return total
          }

          const created =
            booking.createdAt
              ?.toDate?.()

          if (!created) {
            return total
          }

          const sameMonth =
            created.getMonth() ===
              now.getMonth() &&
            created.getFullYear() ===
              now.getFullYear()

          if (!sameMonth) {
            return total
          }

          return (
            total +
            booking.quote
          )
        },
        0,
      )
    }, [bookings])

  async function updateBookingStatus(
    booking: ProviderBooking,
    nextStatus: BookingStatus,
  ) {
    if (
      !db ||
      !user
    ) {
      return
    }

    if (
      booking.providerId !==
      user.uid
    ) {
      setError(
        'You cannot update this booking.',
      )
      return
    }

    if (
      !isAllowedTransition(
        booking.status,
        nextStatus,
      )
    ) {
      setError(
        'This booking cannot be moved to that status.',
      )
      return
    }

    setUpdatingBookingId(
      booking.id,
    )

    setError('')
    setMessage('')

    try {
      await updateDoc(
        doc(
          db,
          'bookings',
          booking.id,
        ),
        {
          status:
            nextStatus,

          updatedAt:
            serverTimestamp(),
        },
      )

      setBookings(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              booking.id
                ? {
                    ...item,
                    status:
                      nextStatus,
                  }
                : item,
          ),
      )

      if (
        nextStatus ===
        'Confirmed'
      ) {
        setMessage(
          'Booking accepted. It is now confirmed.',
        )
      } else if (
        nextStatus ===
        'Declined'
      ) {
        setMessage(
          'Booking request declined.',
        )
      } else if (
        nextStatus ===
        'In progress'
      ) {
        setMessage(
          'The booking is now marked as in progress.',
        )
      } else {
        setMessage(
          'The booking has been marked as completed.',
        )
      }
    } catch (err) {
      console.error(
        'Could not update booking status:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Could not update booking status.',
      )
    } finally {
      setUpdatingBookingId(
        null,
      )
    }
  }

  const ratingValue =
    averageRating === null
      ? '—'
      : averageRating.toFixed(
          1,
        )

  const ratingLabel =
    reviews.length === 0
      ? 'Rating'
      : reviews.length === 1
        ? '1 review'
        : `${reviews.length} reviews`

  return (
    <div className="page-shell">
      <SEO
        title="Provider dashboard | WorkShake"
        description="Manage leads, bookings, profile performance and customer work."
        path="/provider-dashboard"
        noindex
      />

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
            Provider dashboard
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">
            Ready for the next
            job
            {user?.displayName
              ? `, ${
                  user.displayName.split(
                    ' ',
                  )[0]
                }`
              : ''}
            ?
          </h1>

          <p className="mt-2 text-forest/70">
            Manage booking
            requests, confirmed
            work, customer
            conversations and new
            local opportunities.
          </p>
        </div>

        <Link
          to="/profile"
          className="btn-secondary inline-flex h-10 items-center justify-center px-5 text-center leading-none"
        >
          Edit profile
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[2rem] bg-sage/55 p-5">
          <BriefcaseBusiness className="h-5 w-5" />

          <p className="mt-4 text-3xl font-black">
            {
              activeBookings.length
            }
          </p>

          <p className="text-sm text-forest/70">
            Active jobs
          </p>
        </div>

        <div className="rounded-[2rem] bg-sage/55 p-5">
          <CircleDollarSign className="h-5 w-5" />

          <p className="mt-4 text-3xl font-black">
            $
            {thisMonthEarnings}
          </p>

          <p className="text-sm text-forest/70">
            This month
          </p>
        </div>

        <div className="rounded-[2rem] bg-sage/55 p-5">
          <Star className="h-5 w-5" />

          <p className="mt-4 text-3xl font-black">
            {ratingValue}
          </p>

          <p className="text-sm text-forest/70">
            {ratingLabel}
          </p>
        </div>

        <div className="rounded-[2rem] bg-sage/55 p-5">
          <Check className="h-5 w-5" />

          <p className="mt-4 text-3xl font-black">
            {
              completedBookings.length
            }
          </p>

          <p className="text-sm text-forest/70">
            Completed jobs
          </p>
        </div>
      </div>

      {message && (
        <div
          className="mt-6 rounded-2xl bg-sage p-4 text-sm font-bold text-ink"
          role="status"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            {message}
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-6 rounded-2xl bg-sun p-4 text-sm font-bold text-ink"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              Booking requests
            </h2>

            <p className="mt-1 text-sm text-forest/65">
              New direct booking
              requests from customers
              appear here for you to
              accept or decline.
            </p>
          </div>

          {!loading &&
            pendingBookings.length >
              0 && (
              <span className="status-pill">
                {
                  pendingBookings.length
                }{' '}
                pending
              </span>
            )}
        </div>

        {loading ? (
          <div className="mt-5 max-w-3xl">
            <div className="skeleton h-64 rounded-[2rem]" />
          </div>
        ) : pendingBookings.length >
          0 ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {pendingBookings.map(
              (booking) => {
                const updating =
                  updatingBookingId ===
                  booking.id

                return (
                  <article
                    key={
                      booking.id
                    }
                    className="rounded-[2rem] border border-forest/10 bg-mist p-5 shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[.16em] text-olive">
                          New booking
                          request
                        </p>

                        <h3 className="mt-2 text-xl font-black tracking-[-.02em] text-ink">
                          {booking.title ||
                            'WorkShake booking'}
                        </h3>

                        <p className="mt-1 text-sm text-forest/65">
                          from{' '}
                          <span className="font-bold text-ink">
                            {booking.customerName ||
                              'Customer'}
                          </span>
                        </p>
                      </div>

                      <span className="status-pill inline-flex min-h-8 items-center justify-center px-3 leading-none">
                        Pending
                      </span>
                    </div>

                    {booking.note && (
                      <div className="mt-4 rounded-2xl bg-sage/25 p-4">
                        <p className="text-xs font-black uppercase tracking-[.12em] text-forest/55">
                          Customer
                          details
                        </p>

                        <p className="mt-2 text-sm leading-6 text-forest/80">
                          {
                            booking.note
                          }
                        </p>
                      </div>
                    )}

                    <div className="mt-5 space-y-3 rounded-2xl bg-sage/30 p-4 text-sm">
                      <div className="grid grid-cols-[22px_80px_1fr] items-center gap-2 text-forest/80">
                        <CalendarDays className="h-4 w-4 text-forest/55" />

                        <span className="font-bold text-forest/65">
                          Date
                        </span>

                        <span>
                          {formatDate(
                            booking.date,
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-[22px_80px_1fr] items-center gap-2 text-forest/80">
                        <Clock3 className="h-4 w-4 text-forest/55" />

                        <span className="font-bold text-forest/65">
                          Time
                        </span>

                        <span>
                          {formatTime(
                            booking.time,
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-[22px_80px_1fr] items-center gap-2 text-forest/80">
                        <MapPin className="h-4 w-4 text-forest/55" />

                        <span className="font-bold text-forest/65">
                          Location
                        </span>

                        <span>
                          {formatLocation(
                            booking.location,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 border-t border-forest/10 pt-4">
                      <button
                        type="button"
                        disabled={
                          updating
                        }
                        onClick={() =>
                          void updateBookingStatus(
                            booking,
                            'Confirmed',
                          )
                        }
                        className="btn-primary inline-flex h-10 items-center justify-center gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check className="h-4 w-4" />

                        {updating
                          ? 'Updating…'
                          : 'Accept booking'}
                      </button>

                      <button
                        type="button"
                        disabled={
                          updating
                        }
                        onClick={() =>
                          void updateBookingStatus(
                            booking,
                            'Declined',
                          )
                        }
                        className="btn-secondary inline-flex h-10 items-center justify-center gap-2 px-4 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </button>
                    </div>
                  </article>
                )
              },
            )}
          </div>
        ) : (
          <div className="mt-5 max-w-3xl rounded-[2rem] border border-dashed border-forest/25 p-6">
            <p className="font-black">
              No pending requests.
            </p>

            <p className="mt-1 text-sm text-forest/70">
              New direct booking
              requests will appear
              here.
            </p>
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              Your active bookings
            </h2>

            <p className="mt-1 text-sm text-forest/65">
              Confirmed customer
              work and services in
              progress appear here.
            </p>
          </div>

          <Link
            to="/bookings"
            className="text-sm font-black text-forest"
          >
            View all bookings
          </Link>
        </div>

        {loading ? (
          <div className="mt-5 max-w-3xl">
            <div className="skeleton h-64 rounded-[2rem]" />
          </div>
        ) : activeBookings.length ? (
          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {activeBookings.map(
              (booking) => {
                const updating =
                  updatingBookingId ===
                  booking.id

                const conversationUrl =
                  booking.customerId
                    ? `/messages?bookingId=${encodeURIComponent(
                        booking.id,
                      )}&with=${encodeURIComponent(
                        booking.customerId,
                      )}`
                    : '/messages'

                return (
                  <article
                    key={
                      booking.id
                    }
                    className="rounded-[2rem] border border-forest/10 bg-mist p-5 shadow-soft"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[.16em] text-olive">
                          Customer
                          booking
                        </p>

                        <h3 className="mt-2 text-xl font-black tracking-[-.02em] text-ink">
                          {booking.title ||
                            'WorkShake booking'}
                        </h3>

                        <p className="mt-1 text-sm text-forest/65">
                          with{' '}
                          <span className="font-bold text-ink">
                            {booking.customerName ||
                              'Customer'}
                          </span>
                        </p>
                      </div>

                      <span className="status-pill inline-flex min-h-8 items-center justify-center px-3 leading-none">
                        {
                          booking.status
                        }
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl bg-sage/30 p-4">
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-[22px_80px_1fr] items-center gap-2 text-forest/80">
                          <CalendarDays className="h-4 w-4 text-forest/55" />

                          <span className="font-bold text-forest/65">
                            Date
                          </span>

                          <span>
                            {formatDate(
                              booking.date,
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-[22px_80px_1fr] items-center gap-2 text-forest/80">
                          <Clock3 className="h-4 w-4 text-forest/55" />

                          <span className="font-bold text-forest/65">
                            Time
                          </span>

                          <span>
                            {formatTime(
                              booking.time,
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-[22px_80px_1fr] items-center gap-2 text-forest/80">
                          <MapPin className="h-4 w-4 text-forest/55" />

                          <span className="font-bold text-forest/65">
                            Location
                          </span>

                          <span>
                            {formatLocation(
                              booking.location,
                            )}
                          </span>
                        </div>
                      </div>

                      {typeof booking.quote ===
                        'number' && (
                        <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-3">
                          <span className="text-sm font-bold text-forest/65">
                            Agreed quote
                          </span>

                          <span className="text-lg font-black text-ink">
                            $
                            {
                              booking.quote
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-forest/10 pt-4">
                      <Link
                        to={
                          conversationUrl
                        }
                        className="btn-secondary inline-flex h-10 items-center justify-center gap-2 px-4 text-center leading-none"
                      >
                        <MessageSquareText className="h-4 w-4" />
                        Open conversation
                      </Link>

                      <div className="flex flex-wrap gap-2">
                        {booking.status ===
                          'Confirmed' && (
                          <button
                            type="button"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              void updateBookingStatus(
                                booking,
                                'In progress',
                              )
                            }
                            className="btn-primary inline-flex h-10 items-center justify-center px-4 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updating
                              ? 'Updating…'
                              : 'Start job'}
                          </button>
                        )}

                        {booking.status ===
                          'In progress' && (
                          <button
                            type="button"
                            disabled={
                              updating
                            }
                            onClick={() =>
                              void updateBookingStatus(
                                booking,
                                'Completed',
                              )
                            }
                            className="btn-primary inline-flex h-10 items-center justify-center px-4 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {updating
                              ? 'Updating…'
                              : 'Mark completed'}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                )
              },
            )}
          </div>
        ) : (
          <div className="mt-5 max-w-3xl rounded-[2rem] border border-dashed border-forest/25 p-6">
            <p className="font-black">
              No active bookings.
            </p>

            <p className="mt-1 text-sm text-forest/70">
              Accepted customer
              bookings will appear
              here.
            </p>
          </div>
        )}
      </section>

      <section className="mt-12">
        <div>
          <h2 className="text-2xl font-black">
            Completed jobs
          </h2>

          <p className="mt-1 text-sm text-forest/65">
            Finished work stays
            here as part of your
            service history.
          </p>
        </div>

        {!loading &&
          completedBookings.length >
            0 && (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {completedBookings.map(
                (booking) => {
                  const conversationUrl =
                    booking.customerId
                      ? `/messages?bookingId=${encodeURIComponent(
                          booking.id,
                        )}&with=${encodeURIComponent(
                          booking.customerId,
                        )}`
                      : '/messages'

                  return (
                    <article
                      key={
                        booking.id
                      }
                      className="rounded-[2rem] border border-forest/10 bg-mist p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[.16em] text-olive">
                            Completed service
                          </p>

                          <h3 className="mt-2 text-xl font-black text-ink">
                            {booking.title ||
                              'WorkShake booking'}
                          </h3>

                          <p className="mt-1 text-sm text-forest/65">
                            with{' '}
                            <span className="font-bold text-ink">
                              {booking.customerName ||
                                'Customer'}
                            </span>
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1.5 text-xs font-black text-ink">
                          <Check className="h-3.5 w-3.5" />
                          Completed
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 border-t border-forest/10 pt-4 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-forest/50">
                            Date
                          </p>

                          <p className="mt-1 font-bold text-ink">
                            {formatDate(
                              booking.date,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-forest/50">
                            Customer
                          </p>

                          <p className="mt-1 font-bold text-ink">
                            {booking.customerName ||
                              'Customer'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-forest/50">
                            Quote
                          </p>

                          <p className="mt-1 font-bold text-ink">
                            {typeof booking.quote ===
                            'number'
                              ? `$${booking.quote}`
                              : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end border-t border-forest/10 pt-4">
                        <Link
                          to={
                            conversationUrl
                          }
                          className="btn-secondary inline-flex h-9 items-center justify-center gap-2 px-4"
                        >
                          <MessageSquareText className="h-4 w-4" />
                          View conversation
                        </Link>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          )}

        {!loading &&
          completedBookings.length ===
            0 && (
            <div className="mt-5 max-w-3xl rounded-[2rem] border border-dashed border-forest/20 p-5">
              <p className="text-sm font-bold text-forest/70">
                Completed jobs will
                appear here after
                you finish them.
              </p>
            </div>
          )}
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl font-black">
              Open jobs you may like
            </h2>

            {providerCategory && (
              <p className="mt-1 text-sm text-forest/65">
                Jobs matching your
                service category
                are shown first.
              </p>
            )}
          </div>

          <Link
            to="/find-help"
            className="text-sm font-black text-forest"
          >
            View all
          </Link>
        </div>

        {loading && (
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="skeleton h-64 rounded-[2rem]"
                />
              ),
            )}
          </div>
        )}

        {!loading &&
          relevantJobs.length >
            0 && (
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {relevantJobs
                .slice(0, 3)
                .map(
                  (job) => (
                    <JobCard
                      key={
                        job.id
                      }
                      job={
                        job
                      }
                    />
                  ),
                )}
            </div>
          )}

        {!loading &&
          relevantJobs.length ===
            0 && (
            <div className="mt-5 rounded-[2rem] border border-dashed border-forest/25 p-6">
              <p className="font-black">
                No open jobs yet.
              </p>

              <p className="mt-1 text-sm text-forest/70">
                New customer
                requests will
                appear here when
                they are posted.
              </p>
            </div>
          )}
      </section>
    </div>
  )
}