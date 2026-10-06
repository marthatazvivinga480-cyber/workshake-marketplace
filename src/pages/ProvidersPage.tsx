import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { ProviderCard } from '../components/ProviderCard'
import { SEO } from '../components/SEO'
import { providers } from '../data/providers'

export default function ProvidersPage() {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => providers.filter((p) => `${p.name} ${p.category} ${p.skills.join(' ')}`.toLowerCase().includes(q.toLowerCase())), [q])
  return <div className="page-shell"><SEO title="Trusted service providers | WorkShake" description="Compare verified local providers by service, rating, experience and response time." path="/providers" /><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-olive">Provider directory</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">Skills, experience and reviews before you book.</h1></div><label className="relative mt-8 block max-w-xl"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/60" /><input value={q} onChange={(e) => setQ(e.target.value)} className="form-input pl-11" placeholder="Search provider or skill" /></label><h2 className="mt-8 text-2xl font-black tracking-[-.03em] text-ink">Available providers</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div></div>
}
