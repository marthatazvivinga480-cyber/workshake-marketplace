import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore'
import {
  BriefcaseBusiness,
  CalendarCheck2,
  Check,
  MessageSquareText,
  Plus,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type UserJob = {
  id: string
  title?: string
  status?: string
  category?: string
  location?: string
}

type JobResponse = {
  id: string
  jobId: string
  jobTitle?: string
  customerId: string
  providerId: string
  providerName?: string
  quote?: number
  message?: string
  status?: string
  createdAt?: Timestamp | null
}

type CustomerBooking = {
  id: string
  jobId?: string
  title: string
  providerId?: string
  providerName: string
  status: string
  date?: string
  time?: string
  location?: string
  createdAt?: Timestamp | null
}

export default function CustomerDashboardPage() {
  const { user } = useAuth()

  const [jobs, setJobs] = useState<UserJob[]>([])
  const [responses, setResponses] =
    useState<JobResponse[]>([])
  const [bookings, setBookings] =
    useState<CustomerBooking[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [
    processingResponseId,
    setProcessingResponseId,
  ] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      if (!db || !user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const jobsQuery = query(
          collection(db, 'jobs'),
          where(
            'createdBy',
            '==',
            user.uid,
          ),
        )

        const responsesQuery = query(
          collection(
            db,
            'jobResponses',
          ),
          where(
            'customerId',
            '==',
            user.uid,
          ),
        )

        const bookingsQuery = query(
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

        const [
          jobsSnapshot,
          responsesSnapshot,
          bookingsSnapshot,
        ] = await Promise.all([
          getDocs(jobsQuery),
          getDocs(responsesQuery),
          getDocs(bookingsQuery),
        ])

        const customerJobs: UserJob[] =
          jobsSnapshot.docs.map(
            (document) => {
              const data =
                document.data()

              return {
                id: document.id,

                title:
                  typeof data.title ===
                  'string'
                    ? data.title
                    : 'Untitled job',

                status:
                  typeof data.status ===
                  'string'
                    ? data.status
                    : 'Open',

                category:
                  typeof data.category ===
                  'string'
                    ? data.category
                    : 'General',

                location:
                  typeof data.location ===
                  'string'
                    ? data.location
                    : '',
              }
            },
          )

        const customerResponses:
          JobResponse[] =
          responsesSnapshot.docs.map(
            (document) => {
              const data =
                document.data()

              return {
                id: document.id,

                jobId:
                  typeof data.jobId ===
                  'string'
                    ? data.jobId
                    : '',

                jobTitle:
                  typeof data.jobTitle ===
                  'string'
                    ? data.jobTitle
                    : undefined,

                customerId:
                  typeof data.customerId ===
                  'string'
                    ? data.customerId
                    : '',

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

                quote:
                  typeof data.quote ===
                  'number'
                    ? data.quote
                    : undefined,

                message:
                  typeof data.message ===
                  'string'
                    ? data.message
                    : '',

                status:
                  typeof data.status ===
                  'string'
                    ? data.status
                    : 'sent',

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

        const customerBookings:
          CustomerBooking[] =
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
                    : 'WorkShake provider',

                status:
                  typeof data.status ===
                  'string'
                    ? data.status
                    : 'Pending',

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

                createdAt:
                  data.createdAt &&
                  typeof data.createdAt
                    .toDate ===
                    'function'
                    ? (data.createdAt as Timestamp)
                    : null,
              }
            })
            .sort(
              (a, b) =>
                (b.createdAt
                  ?.toMillis?.() ??
                  0) -
                (a.createdAt
                  ?.toMillis?.() ??
                  0),
            )

        setJobs(customerJobs)
        setResponses(
          customerResponses,
        )
        setBookings(
          customerBookings,
        )
      } catch (err) {
        console.error(
          'Could not load customer dashboard:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load your dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [user])

  const responsesByJob =
    useMemo(() => {
      const grouped =
        new Map<
          string,
          JobResponse[]
        >()

      for (
        const response
        of responses
      ) {
        if (!response.jobId) {
          continue
        }

        const current =
          grouped.get(
            response.jobId,
          ) ?? []

        current.push(response)

        grouped.set(
          response.jobId,
          current,
        )
      }

      return grouped
    }, [responses])

  async function acceptResponse(
    response: JobResponse,
    job: UserJob,
  ) {
    if (!db || !user) return

    if (
      response.customerId !==
      user.uid
    ) {
      setError(
        'You cannot accept this response.',
      )
      return
    }

    if (
      job.status === 'Booked'
    ) {
      setError(
        'This job already has a confirmed provider.',
      )
      return
    }

    setProcessingResponseId(
      response.id,
    )

    setError('')
    setMessage('')

    try {
      const batch =
        writeBatch(db)

      const bookingRef = doc(
        collection(
          db,
          'bookings',
        ),
      )

      const responseRef = doc(
        db,
        'jobResponses',
        response.id,
      )

      const jobRef = doc(
        db,
        'jobs',
        job.id,
      )

      batch.set(
        bookingRef,
        {
          jobId: job.id,
          responseId:
            response.id,

          title:
            job.title ||
            response.jobTitle ||
            'WorkShake booking',

          customerId:
            user.uid,

          customerName:
            user.displayName ||
            'WorkShake customer',

          providerId:
            response.providerId,

          providerName:
            response.providerName ||
            'WorkShake provider',

          quote:
            response.quote ??
            0,

          location:
            job.location || '',

          status:
            'Confirmed',

          date: '',
          time: '',

          createdAt:
            serverTimestamp(),
        },
      )

      batch.update(
        responseRef,
        {
          status:
            'accepted',

          updatedAt:
            serverTimestamp(),
        },
      )

      batch.update(
        jobRef,
        {
          status: 'Booked',

          acceptedProviderId:
            response.providerId,

          acceptedResponseId:
            response.id,

          updatedAt:
            serverTimestamp(),
        },
      )

      await batch.commit()

      setResponses(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              response.id
                ? {
                    ...item,
                    status:
                      'accepted',
                  }
                : item,
          ),
      )

      setJobs(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              job.id
                ? {
                    ...item,
                    status:
                      'Booked',
                  }
                : item,
          ),
      )

      setBookings(
        (current) => [
          {
            id:
              bookingRef.id,

            jobId:
              job.id,

            title:
              job.title ||
              response.jobTitle ||
              'WorkShake booking',

            providerId:
              response.providerId,

            providerName:
              response.providerName ||
              'WorkShake provider',

            status:
              'Confirmed',

            date: '',
            time: '',

            location:
              job.location || '',

            createdAt: null,
          },

          ...current,
        ],
      )

      setMessage(
        `${
          response.providerName ||
          'The provider'
        } has been accepted. Your booking has been created.`,
      )
    } catch (err) {
      console.error(
        'Could not accept provider:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Could not accept this provider.',
      )
    } finally {
      setProcessingResponseId(
        null,
      )
    }
  }

  async function declineResponse(
    response: JobResponse,
  ) {
    if (!db || !user) return

    if (
      response.customerId !==
      user.uid
    ) {
      setError(
        'You cannot decline this response.',
      )
      return
    }

    setProcessingResponseId(
      response.id,
    )

    setError('')
    setMessage('')

    try {
      const batch =
        writeBatch(db)

      batch.update(
        doc(
          db,
          'jobResponses',
          response.id,
        ),
        {
          status:
            'declined',

          updatedAt:
            serverTimestamp(),
        },
      )

      await batch.commit()

      setResponses(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              response.id
                ? {
                    ...item,
                    status:
                      'declined',
                  }
                : item,
          ),
      )

      setMessage(
        'The provider response was declined.',
      )
    } catch (err) {
      console.error(
        'Could not decline response:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Could not decline this response.',
      )
    } finally {
      setProcessingResponseId(
        null,
      )
    }
  }

  return (
    <div className="page-shell">
      <SEO
        title="Customer dashboard | WorkShake"
        description="Track your jobs, provider responses and bookings from your WorkShake dashboard."
        path="/dashboard"
        noindex
      />

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
            Customer dashboard
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">
            Hi{' '}
            {user?.displayName
              ?.split(' ')[0] ||
              'there'}
            .
          </h1>

          <p className="mt-2 text-forest/70">
            Here is what is
            happening with your
            WorkShake activity.
          </p>
        </div>

        <Link
          to="/post-problem"
          className="btn-primary inline-flex min-h-10 items-center justify-center gap-2 text-center leading-none"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>
            Post a problem
          </span>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          [
            BriefcaseBusiness,
            jobs.length,
            'My jobs',
          ],

          [
            CalendarCheck2,
            bookings.length,
            'Bookings',
          ],

          [
            MessageSquareText,
            responses.length,
            'Responses',
          ],
        ].map(
          (
            [
              Icon,
              value,
              label,
            ],
          ) => {
            const C =
              Icon as typeof BriefcaseBusiness

            return (
              <div
                key={String(
                  label,
                )}
                className="rounded-[2rem] bg-sage/55 p-5"
              >
                <C className="h-5 w-5" />

                <p className="mt-4 text-3xl font-black">
                  {String(
                    value,
                  )}
                </p>

                <p className="text-sm text-forest/70">
                  {String(
                    label,
                  )}
                </p>
              </div>
            )
          },
        )}
      </div>

      {message && (
        <p
          className="mt-6 rounded-xl bg-sage p-4 text-sm font-bold text-ink"
          role="status"
        >
          {message}
        </p>
      )}

      {loading && (
        <div className="mt-10">
          <div className="skeleton h-40 rounded-[2rem]" />
        </div>
      )}

      {!loading &&
        error && (
          <div
            className="mt-10 rounded-2xl bg-sun p-4 text-sm font-bold text-ink"
            role="alert"
          >
            {error}
          </div>
        )}

      {!loading &&
        !error && (
          <section className="mt-10">
            <div className="flex items-center justify-between gap-5">
              <h2 className="text-2xl font-black">
                Recent activity
              </h2>

              <Link
                to="/bookings"
                className="text-sm font-black text-forest"
              >
                View bookings
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {bookings.map(
                (booking) => {
                  const messageUrl =
                    booking.providerId
                      ? `/messages?bookingId=${encodeURIComponent(
                          booking.id,
                        )}&with=${encodeURIComponent(
                          booking.providerId,
                        )}`
                      : '/messages'

                  return (
                    <div
                      key={`booking-${booking.id}`}
                      className="rounded-2xl border border-forest/10 bg-mist p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[.14em] text-olive">
                            Booking
                          </p>

                          <p className="mt-1 font-black">
                            {
                              booking.title
                            }
                          </p>

                          <p className="mt-1 text-sm text-forest/65">
                            Provider:{' '}
                            {
                              booking.providerName
                            }
                          </p>

                          {booking.location && (
                            <p className="mt-1 text-xs text-forest/55">
                              {
                                booking.location
                              }
                            </p>
                          )}
                        </div>

                        <span className="status-pill inline-flex items-center justify-center leading-none">
                          {
                            booking.status
                          }
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3 border-t border-forest/10 pt-4">
                        <Link
                          to="/bookings"
                          className="btn-secondary inline-flex h-9 items-center justify-center px-4 text-center leading-none"
                        >
                          View booking
                        </Link>

                        <Link
                          to={
                            messageUrl
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-forest/15 px-4 text-sm font-black text-ink transition hover:border-forest/30"
                        >
                          <MessageSquareText className="h-4 w-4" />

                          Message
                          provider
                        </Link>
                      </div>
                    </div>
                  )
                },
              )}

              {jobs.length ? (
                jobs.map(
                  (job) => {
                    const jobResponses =
                      responsesByJob.get(
                        job.id,
                      ) ?? []

                    return (
                      <div
                        key={`job-${job.id}`}
                        className="rounded-2xl border border-forest/10 bg-mist p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-black uppercase tracking-[.14em] text-olive">
                              Posted job
                            </p>

                            <Link
                              to={`/job/${job.id}`}
                              className="mt-1 block font-black hover:underline"
                            >
                              {job.title ||
                                'Untitled job'}
                            </Link>

                            <p className="mt-1 text-xs text-forest/65">
                              {job.category ||
                                'General'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {jobResponses.length >
                              0 && (
                              <span className="inline-flex items-center justify-center rounded-full bg-sage px-3 py-1 text-xs font-black leading-none text-ink">
                                {
                                  jobResponses.length
                                }{' '}
                                {jobResponses.length ===
                                1
                                  ? 'response'
                                  : 'responses'}
                              </span>
                            )}

                            <span className="status-pill inline-flex items-center justify-center leading-none">
                              {job.status ||
                                'Open'}
                            </span>
                          </div>
                        </div>

                        {jobResponses.length >
                          0 && (
                          <div className="mt-4 space-y-3 border-t border-forest/10 pt-4">
                            {jobResponses.map(
                              (
                                response,
                              ) => {
                                const accepted =
                                  response.status ===
                                  'accepted'

                                const declined =
                                  response.status ===
                                  'declined'

                                const processing =
                                  processingResponseId ===
                                  response.id

                                return (
                                  <div
                                    key={
                                      response.id
                                    }
                                    className="rounded-2xl bg-sage/35 p-4"
                                  >
                                    <div className="flex flex-wrap items-start justify-between gap-5">
                                      <div>
                                        <p className="font-black">
                                          {response.providerName ||
                                            'WorkShake provider'}
                                        </p>

                                        <p className="mt-1 text-xs text-forest/65">
                                          {accepted
                                            ? 'Accepted provider'
                                            : declined
                                              ? 'Response declined'
                                              : 'Provider response'}
                                        </p>
                                      </div>

                                      {typeof response.quote ===
                                        'number' && (
                                        <div className="text-right">
                                          <p className="text-[11px] font-bold uppercase tracking-[.12em] text-forest/50">
                                            Quote
                                          </p>

                                          <span className="mt-1 inline-flex min-h-8 items-center justify-center rounded-full bg-mist px-3 text-sm font-black leading-none text-ink">
                                            $
                                            {
                                              response.quote
                                            }
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {response.message && (
                                      <p className="mt-3 max-w-4xl text-sm leading-6 text-forest/80">
                                        {
                                          response.message
                                        }
                                      </p>
                                    )}

                                    {!accepted &&
                                      !declined &&
                                      job.status !==
                                        'Booked' && (
                                        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-forest/10 pt-3">
                                          <button
                                            type="button"
                                            className="btn-primary inline-flex min-h-10 items-center justify-center px-5 text-center leading-none"
                                            disabled={
                                              processing
                                            }
                                            onClick={() =>
                                              void acceptResponse(
                                                response,
                                                job,
                                              )
                                            }
                                          >
                                            {processing
                                              ? 'Processing…'
                                              : 'Accept provider'}
                                          </button>

                                          <button
                                            type="button"
                                            className="btn-secondary inline-flex min-h-10 items-center justify-center px-5 text-center leading-none"
                                            disabled={
                                              processing
                                            }
                                            onClick={() =>
                                              void declineResponse(
                                                response,
                                              )
                                            }
                                          >
                                            Decline
                                          </button>
                                        </div>
                                      )}

                                    {accepted && (
                                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-forest/10 pt-3">
                                        <div className="inline-flex min-h-9 items-center gap-2 rounded-full bg-sage px-4 text-sm font-black leading-none text-ink">
                                          <Check className="h-4 w-4 shrink-0" />
                                          Provider
                                          accepted
                                        </div>

                                        <Link
                                          to="/bookings"
                                          className="btn-secondary inline-flex h-9 items-center justify-center px-4 text-center leading-none"
                                        >
                                          View
                                          booking
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                )
                              },
                            )}
                          </div>
                        )}
                      </div>
                    )
                  },
                )
              ) : bookings.length ===
                0 ? (
                <div className="rounded-[2rem] border border-dashed border-forest/25 p-6">
                  <p className="font-black">
                    No activity
                    yet.
                  </p>

                  <p className="mt-1 text-sm text-forest/70">
                    Your jobs and
                    bookings will
                    appear here.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        )}
    </div>
  )
}