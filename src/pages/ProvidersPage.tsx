import {
  collection,
  getDocs,
} from 'firebase/firestore'
import { Search } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ProviderCard } from '../components/ProviderCard'
import { SEO } from '../components/SEO'
import { categories } from '../data/categories'
import { db } from '../lib/firebase'
import type { Provider } from '../types'

type ProviderReview = {
  providerId: string
  rating: number
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) {
    return 'WS'
  }

  return parts
    .slice(0, 2)
    .map(
      (part) =>
        part[0]?.toUpperCase() ?? '',
    )
    .join('')
}

function categoryNameFromSlug(
  slug: string,
) {
  return (
    categories.find(
      (category) =>
        category.slug === slug,
    )?.name ?? 'General'
  )
}

export default function ProvidersPage() {
  const [q, setQ] = useState('')

  const [providers, setProviders] =
    useState<Provider[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadProviders() {
      if (!db) {
        setError(
          'Firebase is not configured.',
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [
          providersSnapshot,
          reviewsSnapshot,
          bookingsSnapshot,
        ] = await Promise.all([
          getDocs(
            collection(db, 'providers'),
          ),

          getDocs(
            collection(db, 'reviews'),
          ),

          getDocs(
            collection(db, 'bookings'),
          ),
        ])

        const reviewData: ProviderReview[] =
          reviewsSnapshot.docs
            .map((document) => {
              const data = document.data()

              return {
                providerId:
                  typeof data.providerId === 'string'
                    ? data.providerId
                    : '',

                rating:
                  typeof data.rating === 'number'
                    ? data.rating
                    : 0,
              }
            })
            .filter(
              (review) =>
                Boolean(review.providerId) &&
                review.rating >= 1 &&
                review.rating <= 5,
            )

        const liveProviders: Provider[] =
          providersSnapshot.docs.map(
            (providerDocument) => {
              const data =
                providerDocument.data()

              const providerId =
                providerDocument.id

              const name =
                typeof data.name === 'string' &&
                data.name.trim()
                  ? data.name.trim()
                  : 'WorkShake provider'

              const categorySlug =
                typeof data.categorySlug === 'string'
                  ? data.categorySlug
                  : ''

              const category =
                typeof data.category === 'string' &&
                data.category.trim()
                  ? data.category
                  : categoryNameFromSlug(
                      categorySlug,
                    )

              const providerReviews =
                reviewData.filter(
                  (review) =>
                    review.providerId ===
                    providerId,
                )

              const averageRating =
                providerReviews.length > 0
                  ? providerReviews.reduce(
                      (total, review) =>
                        total +
                        review.rating,
                      0,
                    ) /
                    providerReviews.length
                  : 0

              const completedJobs =
                bookingsSnapshot.docs.filter(
                  (bookingDocument) => {
                    const booking =
                      bookingDocument.data()

                    return (
                      booking.providerId ===
                        providerId &&
                      booking.status ===
                        'Completed'
                    )
                  },
                ).length

              return {
                id: providerId,

                userId:
                  typeof data.userId === 'string'
                    ? data.userId
                    : providerId,

                name,

                initials:
                  typeof data.initials === 'string' &&
                  data.initials.trim()
                    ? data.initials.trim()
                    : getInitials(name),

                category,

                categorySlug,

                location:
                  typeof data.location === 'string'
                    ? data.location
                    : '',

                experience:
                  typeof data.experience === 'string'
                    ? data.experience
                    : undefined,

                bio:
                  typeof data.bio === 'string' &&
                  data.bio.trim()
                    ? data.bio
                    : 'Local service provider on WorkShake.',

                verified: true,

                rating: Number(
                  averageRating.toFixed(1),
                ),

                reviews:
                  providerReviews.length,

                jobs: completedJobs,

                skills:
                  Array.isArray(data.skills)
                    ? data.skills.filter(
                        (
                          skill,
                        ): skill is string =>
                          typeof skill ===
                          'string',
                      )
                    : undefined,

                responseTime:
                  typeof data.responseTime ===
                  'string'
                    ? data.responseTime
                    : undefined,

                startingPrice:
                  typeof data.startingPrice ===
                  'number'
                    ? data.startingPrice
                    : undefined,
              }
            },
          )

        setProviders(liveProviders)
      } catch (err) {
        console.error(
          'Could not load providers:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load providers.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadProviders()
  }, [])

  const filtered = useMemo(() => {
    const search =
      q.trim().toLowerCase()

    if (!search) {
      return providers
    }

    return providers.filter(
      (provider) => {
        const searchableText = [
          provider.name,
          provider.category,
          provider.location,
          provider.experience ?? '',
          provider.bio,
          ...(provider.skills ?? []),
        ]
          .join(' ')
          .toLowerCase()

        return searchableText.includes(
          search,
        )
      },
    )
  }, [
    providers,
    q,
  ])

  return (
    <div className="page-shell">
      <SEO
        title="Trusted service providers | WorkShake"
        description="Compare approved local providers by service, experience, completed work and customer reviews."
        path="/providers"
      />

      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
          Provider directory
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">
          Skills, experience and reviews
          before you book.
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-forest/75">
          Browse local providers and compare
          their service area, experience,
          completed work and customer feedback.
        </p>
      </div>

      <label className="relative mt-8 block max-w-xl">
        <span className="sr-only">
          Search providers
        </span>

        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/60" />

        <input
          value={q}
          onChange={(event) =>
            setQ(event.target.value)
          }
          className="form-input pl-11"
          placeholder="Search provider, service or location"
        />
      </label>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-[-.03em] text-ink">
            Available providers
          </h2>

          {!loading &&
            !error && (
              <p className="mt-1 text-sm font-bold text-forest/60">
                {filtered.length}{' '}
                {filtered.length === 1
                  ? 'provider'
                  : 'providers'}
              </p>
            )}
        </div>

        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="text-sm font-black text-forest"
          >
            Clear search
          </button>
        )}
      </div>

      {loading && (
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

      {!loading && error && (
        <div
          className="mt-5 rounded-2xl bg-sun p-4 text-sm font-bold text-ink"
          role="alert"
        >
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        filtered.length > 0 && (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(
              (provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                />
              ),
            )}
          </div>
        )}

      {!loading &&
        !error &&
        filtered.length === 0 && (
          <div className="mt-5 rounded-[2rem] border border-dashed border-forest/20 p-6">
            <p className="font-black text-ink">
              {q
                ? 'No providers match your search.'
                : 'No provider profiles are available yet.'}
            </p>

            <p className="mt-1 max-w-xl text-sm leading-6 text-forest/65">
              {q
                ? 'Try another provider name, service, location or clear your search.'
                : 'Approved providers will appear here after their public profile has been created.'}
            </p>
          </div>
        )}
    </div>
  )
}