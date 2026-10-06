import { BadgeCheck, Clock3, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Provider } from '../types'

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <article className="card-lift rounded-[2rem] border border-forest/10 bg-mist p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sage text-lg font-black text-ink">{provider.initials}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black tracking-[-0.03em] text-ink">{provider.name}</h3>
            {provider.verified && <BadgeCheck className="h-4 w-4 text-forest" aria-label="Verified provider" />}
          </div>
          <p className="mt-1 text-sm text-forest/75">{provider.category} · {provider.location}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-4 text-sm text-forest/80">
        <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-sun text-forest" />{provider.rating} ({provider.reviews})</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{provider.responseTime}</span>
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-forest/85">{provider.bio}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div><span className="text-xs text-forest/60">From </span><span className="font-black text-ink">${provider.startingPrice}</span></div>
        <Link className="link-underline text-sm font-extrabold text-ink" to={`/provider/${provider.id}`}>View profile</Link>
      </div>
    </article>
  )
}
