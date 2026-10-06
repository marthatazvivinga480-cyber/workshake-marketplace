import {
  BadgeCheck,
  BriefcaseBusiness,
  Star,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Provider } from '../types'

export function ProviderCard({
  provider,
}: {
  provider: Provider
}) {
  const ratingLabel =
    provider.reviews === 1
      ? '1 review'
      : `${provider.reviews} reviews`

  const jobsLabel =
    provider.jobs === 1
      ? '1 completed job'
      : `${provider.jobs} completed jobs`

  return (
    <article className="card-lift rounded-[2rem] border border-forest/10 bg-mist p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sage text-lg font-black text-ink">
          {provider.initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black tracking-[-0.03em] text-ink">
              {provider.name}
            </h3>

            {provider.verified && (
              <BadgeCheck
                className="h-4 w-4 text-forest"
                aria-label="Verified provider"
              />
            )}
          </div>

          <p className="mt-1 text-sm text-forest/75">
            {provider.category}
            {provider.location
              ? ` · ${provider.location}`
              : ''}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-forest/80">
        <span className="inline-flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-sun text-forest" />

          {provider.reviews > 0
            ? `${provider.rating.toFixed(1)} (${ratingLabel})`
            : 'No reviews yet'}
        </span>

        <span className="inline-flex items-center gap-1.5">
          <BriefcaseBusiness className="h-4 w-4" />
          {jobsLabel}
        </span>
      </div>

      {provider.experience && (
        <p className="mt-4 text-sm font-bold text-forest/75">
          {provider.experience} experience
        </p>
      )}

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-forest/85">
        {provider.bio}
      </p>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-forest/10 pt-4">
        <div>
          {typeof provider.startingPrice === 'number' ? (
            <>
              <span className="text-xs text-forest/60">
                From{' '}
              </span>

              <span className="font-black text-ink">
                ${provider.startingPrice}
              </span>
            </>
          ) : (
            <span className="text-xs font-bold text-forest/60">
              Pricing agreed per job
            </span>
          )}
        </div>

        <Link
          className="link-underline text-sm font-extrabold text-ink"
          to={`/provider/${provider.id}`}
        >
          View profile
        </Link>
      </div>
    </article>
  )
}