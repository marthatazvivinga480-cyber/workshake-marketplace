import { Link } from 'react-router-dom'
import {
  Car,
  CircleHelp,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Laptop,
  Leaf,
  PartyPopper,
  Sparkles,
  Truck,
  Wrench,
  Zap,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import type { ServiceCategory } from '../types'

const icons: Record<string, LucideIcon> = {
  Car,
  CircleHelp,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Laptop,
  Leaf,
  PartyPopper,
  Sparkles,
  Truck,
  Wrench,
  Zap,
}

export function ServiceCard({ category }: { category: ServiceCategory }) {
  const Icon = icons[category.icon] ?? CircleHelp
  return (
    <Link to={`/category/${category.slug}`} className="service-card group">
      <span className="service-card__icon"><Icon className="h-6 w-6" /></span>
      <div className="relative z-10">
        <h3 className="text-xl font-extrabold tracking-[-0.03em] text-ink">{category.name}</h3>
        <p className="mt-2 text-sm leading-6 text-forest/85">{category.short}</p>
      </div>
      <ArrowUpRight className="relative z-10 mt-5 h-5 w-5 text-forest transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  )
}
