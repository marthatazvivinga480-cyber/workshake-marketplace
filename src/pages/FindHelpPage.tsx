import {
  collection,
  getDocs,
  type Timestamp,
} from 'firebase/firestore'
import {
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { ProviderCard } from '../components/ProviderCard'
import { SEO } from '../components/SEO'
import { categories } from '../data/categories'
import { db } from '../lib/firebase'
import type { Provider } from '../types'

type SearchMode = 'jobs' | 'providers'

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

type FirestoreReview = {
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

export default function FindHelpPage() {
  const [params, setParams] =
    useSearchParams()

  const [mode, setMode] =
    useState<SearchMode>('jobs')

  const [jobs, setJobs] =
    useState<FirestoreJob[]>([])

  const [providers, setProviders] =
    useState<Provider[]>([])

  const [loadingJobs, setLoadingJobs] =
    useState(true)

  const [
    loadingProviders,
    setLoadingProviders,
  ] = useState(true)

  const [jobsError, setJobsError] =
    useState('')

  const [
    providersError,
    setProvidersError,
  ] = useState('')

  const searchQuery =
    params.get('q') ?? ''

  const category =
    params.get('category') ?? 'all'

  useEffect(() => {
    async function loadJobs() {
      if (!db) {
        setJobsError(
          'Firebase is not configured.',
        )
        setLoadingJobs(false)
        return
      }

      setLoadingJobs(true)
      setJobsError('')

      try {
        const snapshot =
          await getDocs(
            collection(db, 'jobs'),
          )

        const liveJobs: FirestoreJob[] =
          snapshot.docs
            .map((document) => {
              const data = document.data()

              return {
                id: document.id,

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
                    ? data.location
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
                    .toDate === 'function'
                    ? (data.createdAt as Timestamp)
                    : null,
              }
            })
            .filter(
              (job) =>
                job.status === 'Open',
            )
            .sort((a, b) => {
              const aTime =
                a.createdAt?.toMillis?.() ??
                0

              const bTime =
                b.createdAt?.toMillis?.() ??
                0

              return bTime - aTime
            })

        setJobs(liveJobs)
      } catch (err) {
        console.error(
          'Could not load open jobs:',
          err,
        )

        setJobsError(
          err instanceof Error
            ? err.message
            : 'Could not load open jobs.',
        )
      } finally {
        setLoadingJobs(false)
      }
    }

    void loadJobs()
  }, [])

  useEffect(() => {
    async function loadProviders() {
      if (!db) {
        setProvidersError(
          'Firebase is not configured.',
        )
        setLoadingProviders(false)
        return
      }

      setLoadingProviders(true)
      setProvidersError('')

      try {
        const [
          providersSnapshot,
          reviewsSnapshot,
        ] = await Promise.all([
          getDocs(
            collection(db, 'providers'),
          ),

          getDocs(
            collection(db, 'reviews'),
          ),
        ])

        const reviewData: FirestoreReview[] =
          reviewsSnapshot.docs
            .map((document) => {
              const data =
                document.data()

              return {
                providerId:
                  typeof data.providerId ===
                  'string'
                    ? data.providerId
                    : '',

                rating:
                  typeof data.rating ===
                  'number'
                    ? data.rating
                    : 0,
              }
            })
            .filter(
              (review) =>
                Boolean(
                  review.providerId,
                ) &&
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
                typeof data.name ===
                  'string' &&
                data.name.trim()
                  ? data.name.trim()
                  : 'WorkShake provider'

              const categorySlug =
                typeof data.categorySlug ===
                'string'
                  ? data.categorySlug
                  : ''

              const category =
                typeof data.category ===
                  'string' &&
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
                      (
                        total,
                        review,
                      ) =>
                        total +
                        review.rating,
                      0,
                    ) /
                    providerReviews.length
                  : 0

              const completedJobs =
                typeof data.completedJobs ===
                'number'
                  ? data.completedJobs
                  : typeof data.jobs ===
                      'number'
                    ? data.jobs
                    : 0

              return {
                id: providerId,

                userId:
                  typeof data.userId ===
                  'string'
                    ? data.userId
                    : providerId,

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
                  typeof data.bio ===
                    'string' &&
                  data.bio.trim()
                    ? data.bio
                    : 'Local service provider on WorkShake.',

                verified:
                  typeof data.verified ===
                  'boolean'
                    ? data.verified
                    : false,

                rating: Number(
                  averageRating.toFixed(1),
                ),

                reviews:
                  providerReviews.length,

                jobs: completedJobs,

                skills:
                  Array.isArray(
                    data.skills,
                  )
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

        setProvidersError(
          err instanceof Error
            ? err.message
            : 'Could not load providers.',
        )
      } finally {
        setLoadingProviders(false)
      }
    }

    void loadProviders()
  }, [])

  const filteredJobs = useMemo(() => {
    const q =
      searchQuery
        .trim()
        .toLowerCase()

    return jobs.filter((job) => {
      const searchableText = [
        job.title,
        job.category,
        job.description,
        job.location,
        job.timing,
      ]
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !q ||
        searchableText.includes(q)

      const matchesCategory =
        category === 'all' ||
        job.categorySlug ===
          category

      return (
        matchesSearch &&
        matchesCategory
      )
    })
  }, [
    jobs,
    searchQuery,
    category,
  ])

  const filteredProviders =
    useMemo(() => {
      const q =
        searchQuery
          .trim()
          .toLowerCase()

      return providers.filter(
        (provider) => {
          const searchableText = [
            provider.name,
            provider.category,
            provider.location,
            provider.experience ?? '',
            provider.bio,
            ...(provider.skills ??
              []),
          ]
            .join(' ')
            .toLowerCase()

          const matchesSearch =
            !q ||
            searchableText.includes(q)

          const matchesCategory =
            category === 'all' ||
            provider.categorySlug ===
              category

          return (
            matchesSearch &&
            matchesCategory
          )
        },
      )
    }, [
      providers,
      searchQuery,
      category,
    ])

  function update(
    key: string,
    value: string,
  ) {
    const next =
      new URLSearchParams(params)

    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }

    setParams(next)
  }

  function clearFilters() {
    setParams({})
  }

  const resultCount =
    mode === 'jobs'
      ? filteredJobs.length
      : filteredProviders.length

  const loading =
    mode === 'jobs'
      ? loadingJobs
      : loadingProviders

  const error =
    mode === 'jobs'
      ? jobsError
      : providersError

  return (
    <div className="page-shell">
      <SEO
        title="Find local help | WorkShake"
        description="Browse open jobs, local services and trusted providers ready to help."
        path="/find-help"
      />

      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
          Search WorkShake
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">
          Find the right help without
          the runaround.
        </h1>

        <p className="mt-4 text-lg leading-8 text-forest/80">
          Search jobs if you offer a
          service, or switch to
          providers if you need someone
          for a task.
        </p>
      </div>

      <div className="mt-8 grid gap-3 rounded-[2rem] border border-forest/10 bg-sage/35 p-3 lg:grid-cols-[1fr_15rem_auto]">
        <label className="relative">
          <span className="sr-only">
            Search WorkShake
          </span>

          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/60" />

          <input
            className="form-input pl-11"
            value={searchQuery}
            onChange={(event) =>
              update(
                'q',
                event.target.value,
              )
            }
            placeholder={
              mode === 'jobs'
                ? 'Search jobs, services or locations'
                : 'Search providers, services or locations'
            }
          />
        </label>

        <label className="relative">
          <span className="sr-only">
            Filter category
          </span>

          <select
            className="form-select"
            value={category}
            onChange={(event) =>
              update(
                'category',
                event.target.value,
              )
            }
          >
            <option value="all">
              All categories
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item.slug}
                  value={item.slug}
                >
                  {item.name}
                </option>
              ),
            )}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            className={
              mode === 'jobs'
                ? 'btn-primary flex-1'
                : 'btn-secondary flex-1'
            }
            onClick={() =>
              setMode('jobs')
            }
          >
            <SlidersHorizontal className="h-4 w-4" />
            Jobs
          </button>

          <button
            type="button"
            className={
              mode === 'providers'
                ? 'btn-primary flex-1'
                : 'btn-secondary flex-1'
            }
            onClick={() =>
              setMode('providers')
            }
          >
            Providers
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-[-.03em] text-ink">
            {mode === 'jobs'
              ? 'Open jobs'
              : 'Local providers'}
          </h2>

          <p className="mt-1 text-sm font-bold text-forest/60">
            {mode === 'jobs'
              ? 'Live customer requests currently available on WorkShake.'
              : 'Browse approved local service providers on WorkShake.'}
          </p>
        </div>

        {(searchQuery ||
          category !== 'all') && (
          <button
            type="button"
            className="text-sm font-black text-forest"
            onClick={clearFilters}
          >
            Clear filters
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

      {!loading &&
        error && (
          <div
            className="mt-5 rounded-2xl bg-sun p-4 text-sm font-bold text-ink"
            role="alert"
          >
            {error}
          </div>
        )}

      {!loading &&
        !error && (
          <>
            <div className="mt-4">
              <p className="text-sm font-bold text-forest/65">
                {resultCount}{' '}
                {resultCount === 1
                  ? 'result'
                  : 'results'}
              </p>
            </div>

            {resultCount > 0 ? (
              <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {mode === 'jobs'
                  ? filteredJobs.map(
                      (job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                        />
                      ),
                    )
                  : filteredProviders.map(
                      (
                        provider,
                      ) => (
                        <ProviderCard
                          key={
                            provider.id
                          }
                          provider={
                            provider
                          }
                        />
                      ),
                    )}
              </div>
            ) : (
              <div className="mt-5 rounded-[2rem] border border-dashed border-forest/20 p-6">
                <p className="font-black text-ink">
                  {mode === 'jobs'
                    ? 'No open jobs match your search.'
                    : 'No providers match your search.'}
                </p>

                <p className="mt-1 text-sm leading-6 text-forest/65">
                  {mode === 'jobs'
                    ? 'Try another keyword or category, or clear your current filters.'
                    : 'Approved provider profiles will appear here once they have been published.'}
                </p>
              </div>
            )}
          </>
        )}
    </div>
  )
}