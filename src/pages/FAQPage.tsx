import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SEO } from '../components/SEO'

const items = [
  ['How does WorkShake work?', 'Customers post a clear job request. Providers can review opportunities or customers can browse provider profiles. The parties then discuss details, confirm the booking and leave reviews after completion.'],
  ['Does WorkShake employ the providers?', 'No. WorkShake is a marketplace that helps customers and independent providers find one another. Each provider is responsible for the services they offer and any licences or qualifications required for their work.'],
  ['How should I choose a provider?', 'Review the service category, profile details, experience, ratings and written responses. Confirm the full scope, timing and price before work starts.'],
  ['Can I change a job after posting it?', 'Yes. Your dashboard is designed to keep active requests together. In a production Firebase setup you can extend job editing using the included jobs collection and security rules.'],
  ['What should I avoid posting publicly?', 'Do not put passwords, PINs, full payment-card details or other sensitive information inside a public job description. Share only the location detail needed to evaluate the job.'],
  ['How do provider reviews work?', 'Reviews are linked to authenticated WorkShake accounts so feedback can build a useful history over time.'],
]

export default function FAQPage() {
  const [open,setOpen]=useState(0)
  const schema={ '@context':'https://schema.org','@type':'FAQPage',mainEntity:items.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}})) }
  return <div className="page-shell"><SEO title="Frequently asked questions | WorkShake" description="Answers about posting jobs, choosing providers, bookings, safety and accounts." path="/faq" jsonLd={schema}/><div className="mx-auto max-w-3xl"><p className="text-xs font-black uppercase tracking-[.2em] text-olive">FAQ</p><h1 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">The practical questions first.</h1><div className="mt-8 divide-y divide-forest/10 overflow-hidden rounded-[2rem] border border-forest/10 bg-mist shadow-soft">{items.map(([q,a],i)=><div key={q}><button className="flex w-full items-center justify-between gap-4 p-5 text-left font-black" aria-expanded={open===i} onClick={()=>setOpen(open===i?-1:i)}>{q}<ChevronDown className={`h-5 w-5 transition-transform ${open===i?'rotate-180':''}`}/></button>{open===i&&<p className="px-5 pb-5 text-sm leading-7 text-forest/80">{a}</p>}</div>)}</div></div></div>
}
