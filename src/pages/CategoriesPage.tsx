import { SEO } from '../components/SEO'
import { ServiceCard } from '../components/ServiceCard'
import { categories } from '../data/categories'

export default function CategoriesPage() {
  return <div className="page-shell"><SEO title="Service categories | WorkShake" description="Explore home repair, plumbing, electrical, moving, tech repair, tutoring and more." path="/categories" /><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-olive">Browse services</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">Everyday problems need practical people.</h1><p className="mt-4 text-lg leading-8 text-forest/80">Pick the closest category. You can always describe the details in your own words when you post.</p></div><h2 className="mt-9 text-2xl font-black tracking-[-.03em] text-ink">All service categories</h2><div className="sibling-fade mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{categories.map((category) => <ServiceCard key={category.slug} category={category} />)}</div></div>
}
