import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import {
  ArrowLeft,
  CalendarDays,
  MessageSquareText,
  Send,
  UserRound,
} from 'lucide-react'
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { SEO } from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebase'

type MessageRow = {
  id: string
  senderId: string
  senderName: string
  recipientId: string
  participantIds: string[]
  bookingId?: string
  body: string
  createdAt?: {
    seconds?: number
  }
}

type BookingSummary = {
  id: string
  title?: string
  status?: string
  date?: string
  time?: string
  customerId?: string
  customerName?: string
  providerId?: string
  providerName?: string
}

function formatMessageTime(seconds?: number) {
  if (!seconds) return ''

  return new Intl.DateTimeFormat('en-ZW', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(seconds * 1000))
}

function formatBookingDate(value?: string) {
  if (!value) return ''

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat('en-ZW', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatBookingTime(value?: string) {
  if (!value) return ''

  const [hours, minutes] = value.split(':').map(Number)

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return value
  }

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return new Intl.DateTimeFormat('en-ZW', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export default function MessagesPage() {
  const { user, configured } = useAuth()
  const [params] = useSearchParams()

  const bookingId = params.get('bookingId') || ''
  const requestedContactId = params.get('with') || ''

  const [messages, setMessages] = useState<MessageRow[]>([])
  const [booking, setBooking] =
    useState<BookingSummary | null>(null)

  const [loadingBooking, setLoadingBooking] =
    useState(false)

  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function loadBooking() {
      if (!db || !user || !bookingId) {
        setBooking(null)
        return
      }

      setLoadingBooking(true)
      setError('')

      try {
        const snapshot = await getDoc(
          doc(db, 'bookings', bookingId),
        )

        if (!snapshot.exists()) {
          setError('This booking could not be found.')
          setBooking(null)
          return
        }

        const data = snapshot.data()

        const customerId =
          typeof data.customerId === 'string'
            ? data.customerId
            : undefined

        const providerId =
          typeof data.providerId === 'string'
            ? data.providerId
            : undefined

        if (
          customerId !== user.uid &&
          providerId !== user.uid
        ) {
          setError(
            'You do not have access to this booking conversation.',
          )
          setBooking(null)
          return
        }

        setBooking({
          id: snapshot.id,

          title:
            typeof data.title === 'string'
              ? data.title
              : 'WorkShake booking',

          status:
            typeof data.status === 'string'
              ? data.status
              : 'Confirmed',

          date:
            typeof data.date === 'string'
              ? data.date
              : '',

          time:
            typeof data.time === 'string'
              ? data.time
              : '',

          customerId,

          customerName:
            typeof data.customerName === 'string'
              ? data.customerName
              : 'Customer',

          providerId,

          providerName:
            typeof data.providerName === 'string'
              ? data.providerName
              : 'Provider',
        })
      } catch (err) {
        console.error(
          'Could not load booking conversation:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load this conversation.',
        )
      } finally {
        setLoadingBooking(false)
      }
    }

    void loadBooking()
  }, [bookingId, user])

  useEffect(() => {
    if (!db || !user) return

    const messagesQuery = query(
      collection(db, 'messages'),
      where(
        'participantIds',
        'array-contains',
        user.uid,
      ),
    )

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const rows: MessageRow[] =
          snapshot.docs.map((document) => {
            const data = document.data()

            return {
              id: document.id,

              senderId:
                typeof data.senderId === 'string'
                  ? data.senderId
                  : '',

              senderName:
                typeof data.senderName === 'string'
                  ? data.senderName
                  : 'WorkShake user',

              recipientId:
                typeof data.recipientId === 'string'
                  ? data.recipientId
                  : '',

              participantIds:
                Array.isArray(data.participantIds)
                  ? data.participantIds.filter(
                      (value): value is string =>
                        typeof value === 'string',
                    )
                  : [],

              bookingId:
                typeof data.bookingId === 'string'
                  ? data.bookingId
                  : undefined,

              body:
                typeof data.body === 'string'
                  ? data.body
                  : '',

              createdAt:
                data.createdAt &&
                typeof data.createdAt.seconds === 'number'
                  ? data.createdAt
                  : undefined,
            }
          })

        rows.sort(
          (a, b) =>
            (a.createdAt?.seconds ?? 0) -
            (b.createdAt?.seconds ?? 0),
        )

        setMessages(rows)
      },
      (err) => {
        console.error(
          'Could not load messages:',
          err,
        )

        setError(err.message)
      },
    )
  }, [user])

  const contactId = useMemo(() => {
    if (requestedContactId) {
      return requestedContactId
    }

    if (!booking || !user) {
      return ''
    }

    if (booking.customerId === user.uid) {
      return booking.providerId || ''
    }

    return booking.customerId || ''
  }, [
    booking,
    requestedContactId,
    user,
  ])

  const contactName = useMemo(() => {
    if (!booking || !user) {
      return 'WorkShake member'
    }

    if (booking.customerId === user.uid) {
      return booking.providerName || 'Provider'
    }

    return booking.customerName || 'Customer'
  }, [booking, user])

  const conversationMessages = useMemo(() => {
    if (!user || !contactId) {
      return []
    }

    return messages.filter((message) => {
      const correctParticipants =
        message.participantIds.includes(user.uid) &&
        message.participantIds.includes(contactId)

      if (!correctParticipants) {
        return false
      }

      if (bookingId) {
        return message.bookingId === bookingId
      }

      return true
    })
  }, [
    bookingId,
    contactId,
    messages,
    user,
  ])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [conversationMessages.length])

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    if (!db || !user) {
      setError(
        'Sign in with Firebase configured before sending messages.',
      )
      return
    }

    if (!contactId) {
      setError(
        'Choose a booking conversation before sending a message.',
      )
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)

    const body = String(
      formData.get('body') ?? '',
    ).trim()

    if (!body) return

    if (body.length > 2000) {
      setError(
        'Messages cannot be longer than 2000 characters.',
      )
      return
    }

    setSending(true)

    try {
      await addDoc(
        collection(db, 'messages'),
        {
          senderId: user.uid,

          senderName:
            user.displayName ||
            'WorkShake user',

          recipientId: contactId,

          participantIds: [
            user.uid,
            contactId,
          ],

          bookingId:
            bookingId || null,

          bookingTitle:
            booking?.title ||
            'WorkShake booking',

          body,

          createdAt:
            serverTimestamp(),
        },
      )

      form.reset()
    } catch (err) {
      console.error(
        'Could not send message:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Could not send your message.',
      )
    } finally {
      setSending(false)
    }
  }

  const scheduleLabel =
    booking?.date && booking?.time
      ? `${formatBookingDate(
          booking.date,
        )} · ${formatBookingTime(
          booking.time,
        )}`
      : ''

  return (
    <div className="page-shell">
      <SEO
        title="Messages | WorkShake"
        description="Keep job conversations organized in one place."
        path="/messages"
        noindex
      />

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
            Inbox
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-.05em] sm:text-5xl">
            Job conversations.
          </h1>

          <p className="mt-3 text-forest/70">
            Keep service questions, updates and booking details
            together in one place.
          </p>
        </div>

        {user && (
          <Link
            to="/bookings"
            className="btn-secondary inline-flex h-10 items-center justify-center gap-2 px-5 text-center leading-none"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to bookings
          </Link>
        )}
      </div>

      {!configured || !user ? (
        <div className="mt-8">
          <EmptyState
            title="Sign in to use messages"
            copy="Firebase Authentication connects messages to the correct WorkShake account."
            action="Sign in"
            to="/sign-in"
          />
        </div>
      ) : !bookingId ? (
        <div className="mt-8 max-w-3xl">
          <EmptyState
            title="Choose a booking conversation"
            copy="Open one of your bookings and select Message to start or continue a conversation."
            action="View bookings"
            to="/bookings"
          />
        </div>
      ) : loadingBooking ? (
        <div className="mt-8 max-w-5xl">
          <div className="skeleton h-[30rem] rounded-[2rem]" />
        </div>
      ) : booking ? (
        <div className="mt-8 max-w-5xl">
          <section className="overflow-hidden rounded-[2rem] border border-forest/10 bg-mist shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest/10 bg-sage/30 px-5 py-3.5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist">
                  <UserRound className="h-4 w-4 text-forest/70" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-black text-ink">
                    {contactName}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-forest/60">
                    {booking.title ||
                      'WorkShake booking'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {scheduleLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-xs font-bold text-forest/70">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {scheduleLabel}
                  </span>
                )}

                <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-black text-forest">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  {booking.status || 'Confirmed'}
                </span>
              </div>
            </div>

            <div className="flex min-h-[24rem] flex-col">
              <div
                className="flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6"
                aria-live="polite"
              >
                {conversationMessages.length ? (
                  conversationMessages.map(
                    (message) => {
                      const mine =
                        message.senderId ===
                        user.uid

                      return (
                        <div
                          key={message.id}
                          className={
                            mine
                              ? 'ml-auto max-w-[72%]'
                              : 'mr-auto max-w-[72%]'
                          }
                        >
                          <div
                            className={
                              mine
                                ? 'rounded-2xl rounded-br-md bg-forest px-4 py-3 text-sm leading-6 text-mist'
                                : 'rounded-2xl rounded-bl-md bg-sage px-4 py-3 text-sm leading-6 text-ink'
                            }
                          >
                            {!mine && (
                              <p className="mb-1 text-xs font-black opacity-65">
                                {message.senderName}
                              </p>
                            )}

                            <p className="break-words">
                              {message.body}
                            </p>
                          </div>

                          <p
                            className={
                              mine
                                ? 'mt-1 px-1 text-right text-[10px] text-forest/45'
                                : 'mt-1 px-1 text-[10px] text-forest/45'
                            }
                          >
                            {formatMessageTime(
                              message.createdAt
                                ?.seconds,
                            )}
                          </p>
                        </div>
                      )
                    },
                  )
                ) : (
                  <div className="flex min-h-[15rem] items-center justify-center">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sage">
                        <MessageSquareText className="h-4 w-4 text-forest/70" />
                      </div>

                      <p className="mt-3 font-black text-ink">
                        Start the conversation
                      </p>

                      <p className="mt-1 text-sm leading-6 text-forest/60">
                        Send a message to{' '}
                        {contactName} about this
                        booking.
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                className="border-t border-forest/10 bg-mist px-5 py-3.5 sm:px-6"
                onSubmit={submit}
              >
                <div className="flex items-center gap-2">
                  <input
                    name="body"
                    aria-label="Message"
                    className="form-input min-w-0 flex-1"
                    placeholder={`Message ${contactName}`}
                    maxLength={2000}
                    autoComplete="off"
                  />

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-primary inline-flex h-10 shrink-0 items-center justify-center gap-2 px-5 text-center leading-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />

                    <span className="hidden sm:inline">
                      {sending
                        ? 'Sending…'
                        : 'Send'}
                    </span>
                  </button>
                </div>

                {error && (
                  <p
                    className="mt-3 text-sm font-bold text-ink"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </form>
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-8 max-w-3xl">
          <EmptyState
            title="Conversation unavailable"
            copy="This booking conversation could not be loaded."
            action="Back to bookings"
            to="/bookings"
          />
        </div>
      )}
    </div>
  )
}