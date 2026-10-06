import { Clock3, MapPin, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Job } from '../types'

type FirestoreJobCard = {
  id: string
  title: string
  category: string
  location: string
  description: string
  timing?: string
  budgetMin?: number
  budgetMax?: number
  createdAt?: {
    toDate?: () => Date
  } | null
}

type JobCardProps = {
  job: Job | FirestoreJobCard
}

function getBudget(job: Job | FirestoreJobCard) {
  if ('budget' in job && typeof job.budget === 'string') {
    return job.budget
  }

  const min =
    'budgetMin' in job && typeof job.budgetMin === 'number'
      ? job.budgetMin
      : 0

  const max =
    'budgetMax' in job && typeof job.budgetMax === 'number'
      ? job.budgetMax
      : 0

  if (min > 0 && max > 0) {
    return `$${min}–$${max}`
  }

  if (min > 0) {
    return `From $${min}`
  }

  if (max > 0) {
    return `Up to $${max}`
  }

  return 'Budget not specified'
}

function getUrgency(job: Job | FirestoreJobCard) {
  if ('urgency' in job && typeof job.urgency === 'string') {
    return job.urgency
  }

  if ('timing' in job && typeof job.timing === 'string') {
    return job.timing
  }

  return 'Flexible'
}

function getPostedTime(job: Job | FirestoreJobCard) {
  if ('posted' in job && typeof job.posted === 'string') {
    return job.posted
  }

  if (
    'createdAt' in job &&
    job.createdAt &&
    typeof job.createdAt.toDate === 'function'
  ) {
    const createdAt = job.createdAt.toDate()
    const difference = Date.now() - createdAt.getTime()

    const minutes = Math.floor(difference / 60_000)
    const hours = Math.floor(difference / 3_600_000)
    const days = Math.floor(difference / 86_400_000)

    if (minutes < 1) {
      return 'Just now'
    }

    if (minutes < 60) {
      return `${minutes} min ago`
    }

    if (hours < 24) {
      return `${hours} hr${hours === 1 ? '' : 's'} ago`
    }

    return `${days} day${days === 1 ? '' : 's'} ago`
  }

  return 'Recently posted'
}

export function JobCard({ job }: JobCardProps) {
  const budget = getBudget(job)
  const urgency = getUrgency(job)
  const posted = getPostedTime(job)

  return (
    <article className="card-lift rounded-[2rem] border border-forest/10 bg-mist p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <span className="rounded-full bg-sage px-3 py-1 text-xs font-extrabold text-ink">
          {job.category}
        </span>

        <span className="text-xs font-bold text-forest/65">
          {posted}
        </span>
      </div>

      <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-ink">
        {job.title}
      </h3>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-forest/85">
        {job.description}
      </p>

      <div className="mt-5 grid gap-2 text-sm text-forest/80 sm:grid-cols-3">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0" />
          {job.location}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <WalletCards className="h-4 w-4 shrink-0" />
          {budget}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-4 w-4 shrink-0" />
          {urgency}
        </span>
      </div>

      <Link
        to={`/job/${job.id}`}
        className="btn-secondary mt-5 w-full"
      >
        View job
      </Link>
    </article>
  )
}