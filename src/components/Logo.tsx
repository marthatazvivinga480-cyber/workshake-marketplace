import { Link } from 'react-router-dom'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="WorkShake home">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-forest text-sun shadow-soft transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <svg viewBox="0 0 40 40" className="h-6 w-6" aria-hidden="true">
          <path d="M6 10h8l6 9 6-9h8L24 30h-8L6 10Z" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="text-xl font-black tracking-[-0.04em] text-ink">WorkShake</span>
      )}
    </Link>
  )
}
