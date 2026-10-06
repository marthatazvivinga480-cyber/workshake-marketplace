import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { ProviderCard } from '../components/ProviderCard'
import { SEO } from '../components/SEO'
import { categories } from '../data/categories'
import { jobs } from '../data/jobs'
import { providers } from '../data/providers'

export default function CategoryPage() {
  const { slug } = useParams()
  const category = categories.find((item) => item.slug === slug)
  if (!category) return <div className="page-shell"><h1 className="text-4xl font-black">Category not found</h1><Link to="/categories" className="btn-primary mt-5">Browse categories</Link></div>
  const matchingProviders = providers.filter((p) => p.category === category.name)
  const matchingJobs = jobs.filter((j) => j.category === category.name)
  return <div className="page-shell"><SEO title={`${category.name} services | WorkShake`} description={category.description} path={`/category/${category.slug}`} /><div className="grid gap-10 lg:grid-cols-[1fr_.75fr]"><div><p className="text-xs font-black uppercase tracking-[.2em] text-olive">{category.name}</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">Get {category.name.toLowerCase()} help that fits the job.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-forest/80">{category.description}</p><div className="mt-7 flex flex-wrap gap-2">{category.popularTasks.map((task) => <span className="status-pill" key={task}><CheckCircle2 className="mr-1 h-3.5 w-3.5" />{task}</span>)}</div><div className="mt-8 flex flex-wrap gap-3"><Link to={`/post-problem?category=${category.slug}`} className="btn-primary">Post a {category.name.toLowerCase()} job <ArrowRight className="h-4 w-4" /></Link><Link to={`/find-help?category=${category.slug}`} className="btn-secondary">Search WorkShake</Link></div></div><div className="rounded-[2.2rem] bg-sun p-7"><p className="text-xs font-black uppercase tracking-[.18em] text-forest">Good request checklist</p><ul className="mt-5 space-y-3 text-sm leading-6 text-ink">{['Explain what is wrong or what needs doing.', 'Share the general location and ideal timing.', 'Mention any parts, tools or access details.', 'Add a realistic budget if you already have one.'].map((x) => <li className="flex gap-2" key={x}><CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />{x}</li>)}</ul></div></div><section className="mt-16"><h2 className="text-2xl font-black tracking-[-.03em] text-ink">Providers in this category</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{matchingProviders.length ? matchingProviders.map((p) => <ProviderCard key={p.id} provider={p} />) : <p className="text-forest/70">More providers will appear here as they join.</p>}</div></section><section className="mt-16"><h2 className="text-2xl font-black tracking-[-.03em] text-ink">Recent requests</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{matchingJobs.length ? matchingJobs.map((j) => <JobCard key={j.id} job={j} />) : <p className="text-forest/70">No sample jobs in this category yet.</p>}</div></section></div>
}
