export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WorkShake',
  url: (import.meta.env.VITE_SITE_URL || 'https://workshake.example.com').replace(/\/$/, ''),
  logo: `${(import.meta.env.VITE_SITE_URL || 'https://workshake.example.com').replace(/\/$/, '')}/favicon.svg`,
  description: 'A local help marketplace connecting people with trusted service providers.',
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'WorkShake',
  url: (import.meta.env.VITE_SITE_URL || 'https://workshake.example.com').replace(/\/$/, ''),
  potentialAction: {
    '@type': 'SearchAction',
    target: `${(import.meta.env.VITE_SITE_URL || 'https://workshake.example.com').replace(/\/$/, '')}/find-help?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}
