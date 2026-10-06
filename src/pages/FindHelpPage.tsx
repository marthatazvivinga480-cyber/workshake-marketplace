import { Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { ProviderCard } from '../components/ProviderCard'
import { SEO } from '../components/SEO'
import { categories } from '../data/categories'
import { jobs } from '../data/jobs'
import { providers } from '../data/providers'

export default function FindHelpPage() {
  const [params, setParams] = useSearchParams()
  const [mode, setMode] = useState<'jobs' | 'providers'>('jobs')
  const query = params.get('q') ?? ''
  const category = params.get('category') ?? 'all'

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const q = query.toLowerCase()
    return (!q || `${job.title} ${job.category} ${job.description}`.toLowerCase().includes(q)) && (category === 'all' || categories.find((c) => c.name === job.category)?.slug === category)
  }), [query, category])

  const filteredProviders = useMemo(() => providers.filter((provider) => {
    const q = query.toLowerCase()
    return (!q || `${provider.name} ${provider.category} ${provider.skills.join(' ')}`.toLowerCase().includes(q)) && (category === 'all' || categories.find((c) => c.name === provider.category)?.slug === category)
  }), [query, category])

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next)
  }

  return (
    <div className="page-shell">
      <SEO title="Find local help | WorkShake" description="Browse open jobs, local services and trusted providers ready to help." path="/find-help" />
      <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-olive">Search WorkShake</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">Find the right help without the runaround.</h1><p className="mt-4 text-lg leading-8 text-forest/80">Search jobs if you offer a service, or switch to providers if you need someone for a task.</p></div>

      <div className="mt-8 grid gap-3 rounded-[2rem] border border-forest/10 bg-sage/35 p-3 lg:grid-cols-[1fr_15rem_auto]">
        <label className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/60" /><input className="form-input pl-11" value={query} onChange={(e) => update('q', e.target.value)} placeholder="Search services, skills or jobs" /></label>
        <label className="relative"><span className="sr-only">Filter category</span><select className="form-select" value={category} onChange={(e) => update('category', e.target.value)}><option value="all">All categories</option>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></label>
        <div className="flex gap-2"><button className={mode === 'jobs' ? 'btn-primary flex-1' : 'btn-secondary flex-1'} onClick={() => setMode('jobs')}><SlidersHorizontal className="h-4 w-4" /> Jobs</button><button className={mode === 'providers' ? 'btn-primary flex-1' : 'btn-secondary flex-1'} onClick={() => setMode('providers')}>Providers</button></div>
      </div>

      <h2 className="mt-8 text-2xl font-black tracking-[-.03em] text-ink">Search results</h2><div className="mt-3 flex items-center justify-between"><p className="text-sm font-bold text-forest/70">{mode === 'jobs' ? filteredJobs.length : filteredProviders.length} result{(mode === 'jobs' ? filteredJobs.length : filteredProviders.length) === 1 ? '' : 's'}</p><button className="text-sm font-black text-ink" onClick={() => setParams({})}>Clear filters</button></div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {mode === 'jobs' ? filteredJobs.map((job) => <JobCard key={job.id} job={job} />) : filteredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
      </div>
    </div>
  )
}
