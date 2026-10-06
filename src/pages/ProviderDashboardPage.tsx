import {
  BriefcaseBusiness,
  CircleDollarSign,
  Star,
  TrendingUp,
} from 'lucide-react'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  type Timestamp,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
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

export default function ProviderDashboardPage() {
  const { user } = useAuth()

  const [jobs, setJobs] = useState<FirestoreJob[]>([])
  const [providerCategory, setProviderCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      if (!db || !user) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        /*
         * Provider applications are stored using the authenticated
         * provider's UID as the document ID.
         *
         * Reading the exact document also matches our Firestore
         * security rule:
         *
         * providerApplications/{uid}
         */
        const applicationRef = doc(
          db,
          'providerApplications',
          user.uid,
        )

        const applicationSnapshot = await getDoc(applicationRef)

        let categorySlug: string | null = null

        if (applicationSnapshot.exists()) {
          const applicationData =
            applicationSnapshot.data() as ProviderApplication

          if (typeof applicationData.categorySlug === 'string') {
            categorySlug = applicationData.categorySlug
            setProviderCategory(categorySlug)
          }
        }

        /*
         * Load live jobs from Firestore.
         *
         * For now we filter and sort client-side. This keeps the
         * development setup simple and avoids requiring a compound
         * Firestore index for status + createdAt.
         */
        const jobsSnapshot = await getDocs(
          collection(db, 'jobs'),
        )

        const liveJobs: FirestoreJob[] = jobsSnapshot.docs
          .map((jobDocument) => {
            const data = jobDocument.data()

            return {
              id: jobDocument.id,

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
            }
          })
          .filter((job) => job.status === 'Open')
          .filter((job) => job.createdBy !== user.uid)
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() ?? 0
            const bTime = b.createdAt?.toMillis?.() ?? 0

            return bTime - aTime
          })

        setJobs(liveJobs)
      } catch (err) {
        console.error(
          'Could not load provider dashboard:',
          err,
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Could not load available jobs.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [user])

  /*
   * Providers should see matching-category jobs first.
   *
   * Melody selected Plumbing, so plumbing jobs will be
   * prioritised on her dashboard.
   */
  const relevantJobs = useMemo(() => {
    if (!providerCategory) {
      return jobs
    }

    const matchingJobs = jobs.filter(
      (job) => job.categorySlug === providerCategory,
    )

    const otherJobs = jobs.filter(
      (job) => job.categorySlug !== providerCategory,
    )

    return [...matchingJobs, ...otherJobs]
  }, [jobs, providerCategory])

  return (
    <div className="page-shell">
      <SEO
        title="Provider dashboard | WorkShake"
        description="Manage leads, bookings, profile performance and customer work."
        path="/provider-dashboard"
        noindex
      />

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-olive">
            Provider dashboard
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-[-.05em]">
            Ready for the next job
            {user?.displayName
              ? `, ${user.displayName.split(' ')[0]}`
              : ''}
            ?
          </h1>

          <p className="mt-2 text-forest/70">
            Review local opportunities and keep your provider
            profile current.
          </p>
        </div>

        <Link
          to="/profile"
          className="btn-secondary"
        >
          Edit profile
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [BriefcaseBusiness, '0', 'Active jobs'],
          [CircleDollarSign, '—', 'This month'],
          [Star, '—', 'Rating'],
          [TrendingUp, '—', 'Profile views'],
        ].map(([Icon, value, label]) => {
          const C = Icon as typeof BriefcaseBusiness

          return (
            <div
              key={String(label)}
              className="rounded-[2rem] bg-sage/55 p-5"
            >
              <C className="h-5 w-5" />

              <p className="mt-4 text-3xl font-black">
                {String(value)}
              </p>

              <p className="text-sm text-forest/70">
                {String(label)}
              </p>
            </div>
          )
        })}
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h2 className="text-2xl font-black">
              Open jobs you may like
            </h2>

            {providerCategory && (
              <p className="mt-1 text-sm text-forest/65">
                Jobs matching your service category are shown
                first.
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
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="skeleton h-64 rounded-[2rem]"
              />
            ))}
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
          relevantJobs.length > 0 && (
            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              {relevantJobs.slice(0, 3).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                />
              ))}
            </div>
          )}

        {!loading &&
          !error &&
          relevantJobs.length === 0 && (
            <div className="mt-5 rounded-[2rem] border border-dashed border-forest/25 p-6">
              <p className="font-black">
                No open jobs yet.
              </p>

              <p className="mt-1 text-sm text-forest/70">
                New customer requests will appear here when
                they are posted.
              </p>
            </div>
          )}
      </section>
    </div>
  )
}