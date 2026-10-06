import {
  BadgeCheck,
  BriefcaseBusiness,
  MapPin,
  Star,
} from 'lucide-react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'
import { PlaceholderArt } from '../components/PlaceholderArt'
import { SEO } from '../components/SEO'
import { categories } from '../data/categories'
import { db } from '../lib/firebase'
import type { Provider } from '../types'

type ProviderReview = {
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

export default function ProviderDetailPage() {
  const { id } = useParams()

  const [provider, setProvider] =
    useState<Provider | null>(null)

  const [reviews, setReviews] =
    useState<ProviderReview[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadProvider() {
      if (!db || !id) {
        setError(
          'Provider information is unavailable.',
        )
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const providerRef = doc(
          db,
          'providers',
          id,
        )

        const [
          providerSnapshot,
          reviewsSnapshot,
        ] = await Promise.all([
          getDoc(providerRef),

          getDocs(
            query(
              collection(db, 'reviews'),
              where(
                'providerId',
                '==',
                id,
              ),
            ),
          ),
        ])

        if (!providerSnapshot.exists()) {
          setProvider(null)
          setLoading(false)
          return
        }

        const data =
          providerSnapshot.data()

        const name =
          typeof data.name === 'string' &&
          data.name.trim()
            ? data.name.trim()
            : 'WorkShake provider'

        const categorySlug =
          typeof data.categorySlug ===
          'string'
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
          reviewsSnapshot.docs
            .map((reviewDocument) => {
              const reviewData =
                reviewDocument.data()

              return {
                rating:
                  typeof reviewData.rating ===
                  'number'
                    ? reviewData.rating
                    : 0,
              }
            })
            .filter(
              (review) =>
                review.rating >= 1 &&
                review.rating <= 5,
            )

        const averageRating =
          providerReviews.length > 0
            ? providerReviews.reduce(
                (total, review) =>
                  total + review.rating,
                0,
              ) /
              providerReviews.length
            : 0

        const liveProvider: Provider = {
          id: providerSnapshot.id,

          userId:
            typeof data.userId === 'string'
              ? data.userId
              : providerSnapshot.id,

          name,

          initials:
            typeof data.initials ===
              'string' &&
            data.initials.trim()
              ? data.initials.trim()
              : getInitials(name),

          category,

          categorySlug,

          location:
            typeof data.location ===
            'string'
              ? data.location
              : '',

          experience:
            typeof data.experience ===
            'string'
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

          jobs:
            typeof data.jobs === 'number'
              ? data.jobs
              : 0,

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

        setProvider(liveProvider)
        setReviews(providerReviews)
      } catch (err) {
        console.error(
          'Could not load provider profile:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load provider profile.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadProvider()
  }, [id])

  const ratingLabel = useMemo(() => {
    if (!reviews.length) {
      return 'No reviews yet'
    }

    if (reviews.length === 1) {
      return '1 review'
    }

    return `${reviews.length} reviews`
  }, [reviews])

  if (loading) {
    return (
      <div className="page-shell">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div className="skeleton min-h-[28rem] rounded-[2rem]" />

          <div>
            <div className="skeleton h-6 w-32 rounded-full" />
            <div className="skeleton mt-5 h-14 w-3/4 rounded-2xl" />
            <div className="skeleton mt-5 h-24 rounded-2xl" />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="skeleton h-32 rounded-2xl" />
              <div className="skeleton h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <div
          className="rounded-2xl bg-sun p-5 text-sm font-bold text-ink"
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
    )
  }

  if (!provider) {
    return (
      <div className="page-shell">
        <h1 className="text-4xl font-black">
          Provider not found
        </h1>

        <p className="mt-3 max-w-xl text-forest/70">
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
    )
  }

  const schema = {
    '@context':
      'https://schema.org',
    '@type':
      'ProfessionalService',
    name: provider.name,
    description: provider.bio,
    areaServed: provider.location,
    ...(provider.reviews > 0
      ? {
          aggregateRating: {
            '@type':
              'AggregateRating',
            ratingValue:
              provider.rating,
            reviewCount:
              provider.reviews,
          },
        }
      : {}),
  }

  return (
    <div className="page-shell">
      <SEO
        title={`${provider.name} — ${provider.category} | WorkShake`}
        description={provider.bio}
        path={`/provider/${provider.id}`}
        jsonLd={schema}
      />

      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <PlaceholderArt
          label="Provider profile photo"
          className="min-h-[28rem]"
        />

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="status-pill">
              {provider.category}
            </span>

            {provider.verified && (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-forest">
                <BadgeCheck className="h-4 w-4" />
                Verified
              </span>
            )}
          </div>

          <h1 className="mt-4 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">
            {provider.name}
          </h1>

          <p className="mt-4 text-lg leading-8 text-forest/80">
            {provider.bio}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-sage/55 p-4">
              <Star className="h-5 w-5 fill-sun" />

              <p className="mt-3 text-2xl font-black">
                {provider.reviews > 0
                  ? provider.rating.toFixed(1)
                  : '—'}
              </p>

              <p className="text-sm text-forest/70">
                {ratingLabel}
              </p>
            </div>

            <div className="rounded-2xl bg-sage/55 p-4">
              <BriefcaseBusiness className="h-5 w-5" />

              <p className="mt-3 text-2xl font-black">
                {provider.jobs}
              </p>

              <p className="text-sm text-forest/70">
                {provider.jobs === 1
                  ? 'job completed'
                  : 'jobs completed'}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold text-forest/75">
            {provider.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {provider.location}
              </span>
            )}

            {provider.experience && (
              <span>
                {provider.experience}{' '}
                experience
              </span>
            )}
          </div>

          {provider.skills &&
            provider.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {provider.skills.map(
                  (skill) => (
                    <span
                      className="status-pill"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ),
                )}
              </div>
            )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={`/book/${provider.id}`}
              className="btn-primary"
            >
              Request booking
            </Link>

            <Link
              to="/post-problem"
              className="btn-secondary"
            >
              Post a matching job
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-black">
          About pricing
        </h2>

        {typeof provider.startingPrice ===
        'number' ? (
          <p className="mt-3 max-w-2xl leading-7 text-forest/80">
            Jobs start around{' '}
            <strong>
              ${provider.startingPrice}
            </strong>
            . Final price depends on scope,
            parts, travel and timing. Confirm
            the full quote in WorkShake before
            the job begins.
          </p>
        ) : (
          <p className="mt-3 max-w-2xl leading-7 text-forest/80">
            Pricing is agreed per job. Describe
            the work clearly and confirm the
            full quote with the provider before
            the job begins.
          </p>
        )}
      </section>
    </div>
  )
}