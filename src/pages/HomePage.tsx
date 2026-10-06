import { ArrowRight, BadgeCheck, CheckCircle2, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { JobCard } from '../components/JobCard'
import { PlaceholderArt } from '../components/PlaceholderArt'
import { ProviderCard } from '../components/ProviderCard'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { SEO } from '../components/SEO'
import { ServiceCard } from '../components/ServiceCard'
import { categories } from '../data/categories'
import { jobs } from '../data/jobs'
import { providers } from '../data/providers'
import { testimonials } from '../data/testimonials'
import { organizationSchema, websiteSchema } from '../lib/seo'

export default function HomePage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    navigate(`/find-help${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`)
  }

  return (
    <>
      <SEO title="WorkShake — Find trusted local help" description="Post a problem, compare trusted local providers and book the right help with WorkShake." path="/" jsonLd={[organizationSchema, websiteSchema]} />

      <section className="relative overflow-hidden">
        <div className="page-shell grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <Reveal>
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-forest/15 bg-sage/55 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-forest">
                <Sparkles className="h-3.5 w-3.5" /> Local problems. Local people. Sorted.
              </div>
              <h1 className="max-w-4xl text-balance text-5xl font-black leading-[.98] tracking-[-0.065em] text-ink sm:text-6xl lg:text-7xl">
                When something needs doing, <span className="hero-word">shake on it.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-forest/85">Describe the problem, compare nearby providers and choose the person who fits the job. No endless group chats. No guessing who to call.</p>

              <form onSubmit={submit} className="mt-7 flex max-w-2xl flex-col gap-2 rounded-[1.35rem] border border-forest/15 bg-mist p-2 shadow-soft sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">What do you need help with?</span>
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-forest/60" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} className="h-12 w-full rounded-2xl bg-transparent pl-12 pr-4 text-base font-semibold text-ink outline-none placeholder:text-forest/45" placeholder="What do you need help with?" />
                </label>
                <button className="btn-primary min-h-12 px-6" type="submit">Find help <ArrowRight className="h-4 w-4" /></button>
              </form>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-forest/75">
                <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-4 w-4" /> Provider profiles</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Reviews & ratings</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Clear job details</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative">
              <PlaceholderArt label="Replace with WorkShake hero photo" className="min-h-[32rem]" />
              <div className="absolute -bottom-5 left-4 right-4 rounded-[1.6rem] border border-forest/10 bg-mist/90 p-4 shadow-soft backdrop-blur-xl sm:left-8 sm:right-auto sm:w-72">
                <p className="text-xs font-black uppercase tracking-[.16em] text-olive">Open request</p>
                <p className="mt-1 font-black text-ink">“Need an electrician today”</p>
                <div className="mt-3 flex items-center justify-between text-xs text-forest/75"><span>3 providers replied</span><span className="status-pill">12 min</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="page-shell pt-4">
        <Reveal><SectionHeading eyebrow="Start here" title="What kind of help do you need?" copy="Choose a category or describe the job in your own words." /></Reveal>
        <div className="sibling-fade mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category, i) => <Reveal key={category.slug} delay={i * 45}><ServiceCard category={category} /></Reveal>)}
        </div>
        <div className="mt-6"><Link className="btn-secondary" to="/categories">See all categories <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="page-shell">
        <div className="rounded-[2.5rem] bg-forest px-6 py-10 text-mist shadow-soft sm:px-10 lg:px-12">
          <SectionHeading eyebrow="How it works" title="From problem to booked in three clear steps." copy="WorkShake keeps the process simple enough for urgent jobs and structured enough for bigger work." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ['01', 'Post the problem', 'Add the task, location, timing and an optional budget so providers know what you actually need.'],
              ['02', 'Compare replies', 'Look at profiles, skills, ratings and responses before deciding who to contact or book.'],
              ['03', 'Book and review', 'Keep job details together, complete the work and leave a review that helps the next customer.'],
            ].map(([number, title, copy]) => (
              <div key={number} className="rounded-[1.8rem] border border-mist/15 bg-mist/10 p-6">
                <span className="text-sm font-black text-sun">{number}</span>
                <h3 className="mt-8 text-xl font-black text-mist">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-mist/75">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Local providers" title="People ready to solve the problem." copy="Profiles make it easier to compare experience, response time and customer feedback." />
          <Link className="btn-secondary" to="/providers">Browse providers</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{providers.slice(0, 3).map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>
      </section>

      <section className="page-shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Open jobs" title="Recent requests in the community." copy="Providers can browse clear opportunities instead of hunting through scattered posts." />
          <Link className="btn-secondary" to="/find-help">See all jobs</Link>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">{jobs.slice(0, 3).map((job) => <JobCard key={job.id} job={job} />)}</div>
      </section>

      <section className="page-shell">
        <SectionHeading eyebrow="What people say" title="Useful because it gets out of the way." align="center" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="card-lift rounded-[2rem] border border-forest/10 bg-sage/45 p-6">
              <p className="text-lg font-bold leading-8 text-ink">“{item.quote}”</p>
              <footer className="mt-6 text-sm text-forest/70"><strong className="text-ink">{item.name}</strong> · {item.role}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div className="grid items-center gap-8 rounded-[2.5rem] bg-sun p-7 sm:p-10 lg:grid-cols-[1fr_auto]">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-forest">Ready when you are</p><h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-ink sm:text-4xl">Tell WorkShake what needs fixing.</h2><p className="mt-3 max-w-2xl text-forest/80">A clear request takes a few minutes and gives providers the information they need to respond properly.</p></div>
          <Link className="btn-primary" to="/post-problem">Post a problem <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  )
}
