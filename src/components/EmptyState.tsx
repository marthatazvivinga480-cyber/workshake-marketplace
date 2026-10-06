import { CircleDashed } from 'lucide-react'
import { Link } from 'react-router-dom'

export function EmptyState({ title, copy, action, to }: { title: string; copy: string; action?: string; to?: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-forest/30 bg-mist p-8 text-center">
      <CircleDashed className="mx-auto h-9 w-9 text-olive" />
      <h3 className="mt-4 text-xl font-black text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-forest/80">{copy}</p>
      {action && to && <Link to={to} className="btn-primary mt-5 inline-flex">{action}</Link>}
    </div>
  )
}
