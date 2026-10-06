import { useEffect } from 'react'

type SeoProps = {
  title: string
  description: string
  path?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
  noindex?: boolean
}

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://workshake.example.com').replace(/\/$/, '')

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(selector)
  if (!node) {
    node = document.createElement('meta')
    node.setAttribute(attribute, key)
    document.head.appendChild(node)
  }
  node.content = content
}

export function SEO({ title, description, path = '/', type = 'website', jsonLd, noindex = false }: SeoProps) {
  useEffect(() => {
    const canonicalUrl = `${siteUrl}${path === '/' ? '/' : path}`
    document.title = title

    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large')
    setMeta('meta[property="og:type"]', 'property', 'og:type', type)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl)
    setMeta('meta[property="og:image"]', 'property', 'og:image', `${siteUrl}/og-image.png`)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', `${siteUrl}/og-image.png`)

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    const oldScript = document.getElementById('workshake-jsonld')
    oldScript?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.id = 'workshake-jsonld'
      script.type = 'application/ld+json'
      script.text = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [description, jsonLd, noindex, path, title, type])

  return null
}
