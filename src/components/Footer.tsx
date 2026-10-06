import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const groups = [
  { title: 'Get help', links: [['Find help', '/find-help'], ['Categories', '/categories'], ['Post a problem', '/post-problem'], ['Providers', '/providers']] },
  { title: 'Work with us', links: [['Become a provider', '/become-a-provider'], ['Provider dashboard', '/provider-dashboard'], ['Reviews', '/reviews'], ['FAQ', '/faq']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Terms', '/terms'], ['Privacy', '/privacy']] },
] as const

export function Footer() {
  return (
    <footer className="mt-24 border-t border-forest/10 bg-sage/45">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-forest/80">A practical marketplace for everyday problems and the local people who know how to solve them.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-black text-ink">{group.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-forest/80">
                {group.links.map(([label, to]) => <li key={to}><Link className="link-underline" to={to}>{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-forest/10 px-4 py-5 text-center text-xs text-forest/65">© {new Date().getFullYear()} WorkShake. Built for useful local work.</div>
    </footer>
  )
}
