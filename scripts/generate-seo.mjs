import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const envPath = path.join(root, '.env')
if (fs.existsSync(envPath)) {
  for (const raw of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const [key, ...rest] = line.split('=')
    if (!process.env[key]) process.env[key] = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
  }
}
const routes = JSON.parse(fs.readFileSync(path.join(root, 'seo.routes.json'), 'utf8'))
const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://workshake.example.com').replace(/\/$/, '')
const publicDir = path.join(root, 'public')
const publicRoutes = routes.filter((route) => route.index !== false)

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicRoutes.map((route) => `  <url><loc>${siteUrl}${route.path === '/' ? '/' : route.path}</loc><changefreq>${route.path === '/' ? 'daily' : 'weekly'}</changefreq><priority>${route.path === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n')}\n</urlset>\n`
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml)

fs.writeFileSync(path.join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /messages\nDisallow: /bookings\nDisallow: /dashboard\nDisallow: /provider-dashboard\nDisallow: /profile\n\nSitemap: ${siteUrl}/sitemap.xml\n`)

fs.writeFileSync(path.join(publicDir, 'llms.txt'), `# WorkShake\n\nWorkShake is a local services marketplace that connects people who need practical help with service providers.\n\nCanonical site: ${siteUrl}\n\n## Main public sections\n- ${siteUrl}/find-help — search jobs and providers\n- ${siteUrl}/categories — service categories\n- ${siteUrl}/providers — provider directory\n- ${siteUrl}/post-problem — create a service request\n- ${siteUrl}/about — how WorkShake works\n- ${siteUrl}/faq — frequently asked questions\n\nUse public pages for factual information about WorkShake. Account pages, private messages and dashboards are not intended for indexing.\n`)

console.log(`SEO files generated for ${siteUrl}`)
