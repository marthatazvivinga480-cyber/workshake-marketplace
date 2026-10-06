import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  MessageSquareText,
  Receipt,
  UserRound,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type Booking = {
  id: string
  jobId?: string
  title?: string
  providerName?: string
  customerName?: string
  customerId?: string
  providerId?: string
  quote?: number
  date?: string
  time?: string
  location?: string
  status?: string
  createdAt?: Timestamp | null
}

type ScheduleDraft = {
  date: string
  time: string
}

function formatLocation(value?: string) {
  if (!value) {
    return 'Location in job details'
  }

  return value
    .replace(/\s+,/g, ',')
    .replace(/,\s*/g, ', ')
    .replace(/\bharare\b/gi, 'Harare')
    .replace(/\bbelvedere\b/gi, 'Belvedere')
}

function formatDate(value?: string) {
  if (!value) {
    return 'Date to confirm'
  }

  const [year, month, day] = value
    .split('-')
    .map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat('en-ZW', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  )
}

function formatTime(value?: string) {
  if (!value) {
    return 'Time to confirm'
  }

  const [hours, minutes] = value
    .split(':')
    .map(Number)

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value
  }

  const date = new Date()

  date.setHours(
    hours,
    minutes,
    0,
    0,
  )

  return new Intl.DateTimeFormat('en-ZW', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getTodayForDateInput() {
  const today = new Date()

  const year =
    today.getFullYear()

  const month = String(
    today.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    today.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getScheduleMessage(status?: string) {
  if (status === 'Completed') {
    return 'This service is complete. The final schedule is kept for your booking history.'
  }

  if (status === 'In progress') {
    return 'This service is already in progress, so the schedule can no longer be changed.'
  }

  if (status === 'Declined') {
    return 'This booking was declined, so the schedule can no longer be changed.'
  }

  if (status === 'Cancelled') {
    return 'This booking was cancelled, so the schedule can no longer be changed.'
  }

  return 'The confirmed schedule is shared with both the customer and provider.'
}

function getBookingStatusOrder(
  status?: string,
) {
  switch (status) {
    case 'Pending':
      return 0

    case 'Confirmed':
      return 1

    case 'In progress':
      return 2

    case 'Completed':
      return 3

    case 'Declined':
      return 4

    case 'Cancelled':
      return 5

    default:
      return 6
  }
}

export default function BookingsPage() {
  const {
    user,
    configured,
  } = useAuth()

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([])

  const [
    drafts,
    setDrafts,
  ] = useState<
    Record<string, ScheduleDraft>
  >({})

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    savingBookingId,
    setSavingBookingId,
  ] =
    useState<string | null>(
      null,
    )

  const [
    error,
    setError,
  ] = useState('')

  const [
    message,
    setMessage,
  ] = useState('')

  useEffect(() => {
    async function loadBookings() {
      if (!db || !user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const customerQuery =
          query(
            collection(
              db,
              'bookings',
            ),
            where(
              'customerId',
              '==',
              user.uid,
            ),
          )

        const providerQuery =
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
          )

        const [
          customerSnapshot,
          providerSnapshot,
        ] = await Promise.all([
          getDocs(
            customerQuery,
          ),

          getDocs(
            providerQuery,
          ),
        ])

        const bookingMap =
          new Map<
            string,
            Booking
          >()

        for (
          const document
          of [
            ...customerSnapshot.docs,
            ...providerSnapshot.docs,
          ]
        ) {
          const data =
            document.data()

          bookingMap.set(
            document.id,
            {
              id:
                document.id,

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

              providerName:
                typeof data.providerName ===
                'string'
                  ? data.providerName
                  : undefined,

              customerName:
                typeof data.customerName ===
                'string'
                  ? data.customerName
                  : undefined,

              customerId:
                typeof data.customerId ===
                'string'
                  ? data.customerId
                  : undefined,

              providerId:
                typeof data.providerId ===
                'string'
                  ? data.providerId
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
                  ? data.location
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
            },
          )
        }

        const loadedBookings =
          [
            ...bookingMap.values(),
          ].sort((a, b) => {
            const statusDifference =
              getBookingStatusOrder(
                a.status,
              ) -
              getBookingStatusOrder(
                b.status,
              )

            if (
              statusDifference !== 0
            ) {
              return statusDifference
            }

            return (
              (b.createdAt
                ?.toMillis?.() ??
                0) -
              (a.createdAt
                ?.toMillis?.() ??
                0)
            )
          })

        setBookings(
          loadedBookings,
        )

        const nextDrafts:
          Record<
            string,
            ScheduleDraft
          > = {}

        for (
          const booking
          of loadedBookings
        ) {
          nextDrafts[
            booking.id
          ] = {
            date:
              booking.date ||
              '',

            time:
              booking.time ||
              '',
          }
        }

        setDrafts(
          nextDrafts,
        )
      } catch (err) {
        console.error(
          'Could not load bookings:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load your bookings.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadBookings()
  }, [user])

  function updateDraft(
    bookingId: string,
    field:
      keyof ScheduleDraft,
    value: string,
  ) {
    setDrafts(
      (current) => ({
        ...current,

        [bookingId]: {
          date:
            current[
              bookingId
            ]?.date || '',

          time:
            current[
              bookingId
            ]?.time || '',

          [field]:
            value,
        },
      }),
    )
  }

  async function saveSchedule(
    booking: Booking,
  ) {
    if (!db || !user) {
      return
    }

    if (
      booking.customerId !==
      user.uid
    ) {
      setError(
        'Only the customer can update this booking schedule.',
      )
      return
    }

    if (
      booking.status !==
        'Pending' &&
      booking.status !==
        'Confirmed'
    ) {
      setError(
        'This booking schedule can no longer be changed.',
      )
      return
    }

    const draft =
      drafts[
        booking.id
      ]

    if (
      !draft?.date ||
      !draft?.time
    ) {
      setError(
        'Choose both a service date and time before confirming.',
      )
      return
    }

    setSavingBookingId(
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
          date:
            draft.date,

          time:
            draft.time,

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

                    date:
                      draft.date,

                    time:
                      draft.time,
                  }
                : item,
          ),
      )

      setMessage(
        'The service date and time have been saved.',
      )
    } catch (err) {
      console.error(
        'Could not save booking schedule:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Could not save the schedule.',
      )
    } finally {
      setSavingBookingId(
        null,
      )
    }
  }

  return (
    <div className="page-shell">
      <SEO
        title="My bookings | WorkShake"
        description="Manage upcoming, active and completed WorkShake bookings."
        path="/bookings"
        noindex
      />

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
            WorkShake bookings
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-.05em] sm:text-5xl">
            My bookings.
          </h1>

          <p className="mt-3 text-forest/70">
            Keep track of booking
            requests, active work and
            completed services.
          </p>
        </div>

        {user && (
          <Link
            to="/dashboard"
            className="btn-secondary inline-flex h-10 items-center justify-center px-5 text-center leading-none"
          >
            Back to dashboard
          </Link>
        )}
      </div>

      {message && (
        <div
          className="mt-6 max-w-3xl rounded-2xl bg-sage p-4 text-sm font-bold text-ink"
          role="status"
        >
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>
              {message}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div
          className="mt-6 max-w-3xl rounded-2xl bg-sun p-4 text-sm font-bold text-ink"
          role="alert"
        >
          {error}
        </div>
      )}

      {!configured ||
      !user ? (
        <div className="mt-8">
          <EmptyState
            title="Sign in to see bookings"
            copy="Bookings are linked securely to your Firebase account."
            action="Sign in"
            to="/sign-in"
          />
        </div>
      ) : loading ? (
        <div className="mt-8 max-w-3xl">
          <div className="skeleton h-72 rounded-[2rem]" />
        </div>
      ) : bookings.length ? (
        <div
          className={
            bookings.length ===
            1
              ? 'mt-8 max-w-3xl'
              : 'mt-8 grid gap-5 lg:grid-cols-2'
          }
        >
          {bookings.map(
            (booking) => {
              const viewingAsCustomer =
                booking.customerId ===
                user.uid

              const otherPerson =
                viewingAsCustomer
                  ? booking.providerName ||
                    'Provider'
                  : booking.customerName ||
                    'Customer'

              const otherPersonId =
                viewingAsCustomer
                  ? booking.providerId
                  : booking.customerId

              const draft =
                drafts[
                  booking.id
                ] || {
                  date: '',
                  time: '',
                }

              const hasSchedule =
                Boolean(
                  booking.date,
                ) &&
                Boolean(
                  booking.time,
                )

              const saving =
                savingBookingId ===
                booking.id

              const messageUrl =
                otherPersonId
                  ? `/messages?bookingId=${encodeURIComponent(
                      booking.id,
                    )}&with=${encodeURIComponent(
                      otherPersonId,
                    )}`
                  : '/messages'

              const canEditSchedule =
                viewingAsCustomer &&
                (
                  booking.status ===
                    'Pending' ||
                  booking.status ===
                    'Confirmed'
                )

              return (
                <article
                  key={
                    booking.id
                  }
                  className="rounded-[2rem] border border-forest/10 bg-mist p-6 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[.16em] text-olive">
                        {viewingAsCustomer
                          ? 'Your booking'
                          : 'Customer booking'}
                      </p>

                      <h2 className="mt-2 text-2xl font-black tracking-[-.03em] text-ink">
                        {booking.title ||
                          'WorkShake booking'}
                      </h2>
                    </div>

                    <span className="status-pill inline-flex min-h-8 shrink-0 items-center justify-center px-3 leading-none">
                      {booking.status ||
                        'Confirmed'}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-sage/35 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist">
                        <UserRound className="h-4 w-4 text-forest/75" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs text-forest/60">
                          {viewingAsCustomer
                            ? 'Provider'
                            : 'Customer'}
                        </p>

                        <p className="mt-0.5 truncate font-black text-ink">
                          {otherPerson}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={
                        messageUrl
                      }
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-forest/15 bg-mist px-4 text-sm font-black leading-none text-ink transition hover:border-forest/30"
                    >
                      <MessageSquareText className="h-4 w-4" />

                      <span>
                        Message
                      </span>
                    </Link>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="grid grid-cols-[24px_90px_1fr] items-center gap-2 text-forest/80">
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

                    <div className="grid grid-cols-[24px_90px_1fr] items-center gap-2 text-forest/80">
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

                    <div className="grid grid-cols-[24px_90px_1fr] items-center gap-2 text-forest/80">
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
                    <div className="mt-5 flex items-center justify-between border-t border-forest/10 pt-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-forest/65">
                        <Receipt className="h-4 w-4" />

                        Agreed quote
                      </div>

                      <p className="text-xl font-black text-ink">
                        $
                        {
                          booking.quote
                        }
                      </p>
                    </div>
                  )}

                  <div className="mt-4 border-t border-forest/10 pt-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-ink">
                          {canEditSchedule
                            ? hasSchedule
                              ? 'Service schedule'
                              : 'Arrange service'
                            : 'Service schedule'}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-forest/55">
                          {canEditSchedule
                            ? hasSchedule
                              ? 'Change the requested date or time if the appointment needs to be updated.'
                              : 'Choose a date and time for this service.'
                            : getScheduleMessage(
                                booking.status,
                              )}
                        </p>
                      </div>

                      {hasSchedule && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1.5 text-xs font-black text-ink">
                          <Check className="h-3.5 w-3.5" />
                          Scheduled
                        </span>
                      )}
                    </div>

                    {canEditSchedule ? (
                      <>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-forest/65">
                              Service date
                            </span>

                            <input
                              type="date"
                              min={getTodayForDateInput()}
                              value={
                                draft.date
                              }
                              onChange={(
                                event,
                              ) =>
                                updateDraft(
                                  booking.id,
                                  'date',
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink outline-none transition focus:border-forest/40"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-1.5 block text-xs font-bold text-forest/65">
                              Service time
                            </span>

                            <input
                              type="time"
                              value={
                                draft.time
                              }
                              onChange={(
                                event,
                              ) =>
                                updateDraft(
                                  booking.id,
                                  'time',
                                  event
                                    .target
                                    .value,
                                )
                              }
                              className="h-10 w-full rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink outline-none transition focus:border-forest/40"
                            />
                          </label>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <p className="max-w-md text-[11px] leading-5 text-forest/45">
                            The schedule is
                            shared with both
                            the customer and
                            provider.
                          </p>

                          <button
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              void saveSchedule(
                                booking,
                              )
                            }
                            className="btn-primary inline-flex h-10 items-center justify-center px-5 text-center leading-none disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {saving
                              ? 'Saving…'
                              : hasSchedule
                                ? 'Update schedule'
                                : 'Confirm schedule'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-4 grid gap-3 rounded-2xl bg-sage/25 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold text-forest/55">
                            Service date
                          </p>

                          <p className="mt-1 font-bold text-ink">
                            {formatDate(
                              booking.date,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-forest/55">
                            Service time
                          </p>

                          <p className="mt-1 font-bold text-ink">
                            {formatTime(
                              booking.time,
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            },
          )}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No bookings yet"
            copy="When you confirm a provider for a job, the booking will appear here."
            action="Find help"
            to="/find-help"
          />
        </div>
      )}
    </div>
  )
}