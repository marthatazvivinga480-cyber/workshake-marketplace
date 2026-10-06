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
const clientDir = path.join(root, 'dist', 'client')
const basePath = path.join(clientDir, 'index.html')
if (!fs.existsSync(basePath)) {
  console.warn('No dist/client/index.html found; skipping SEO prerender copies.')
  process.exit(0)
}
const base = fs.readFileSync(basePath, 'utf8')
const esc = (value) => value.replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))

function setTag(html, pattern, replacement) { return pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `${replacement}\n</head>`) }

for (const route of routes) {
  const canonical = `${siteUrl}${route.path === '/' ? '/' : route.path}`
  const robots = route.index === false ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'
  let html = base
  html = setTag(html, /<title>.*?<\/title>/s, `<title>${esc(route.title)}</title>`)
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${esc(route.description)}" />`)
  html = setTag(html, /<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}" />`)
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`)
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(route.title)}" />`)
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(route.description)}" />`)
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${canonical}" />`)
  html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${siteUrl}/og-image.png" />`)
  html = setTag(html, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${esc(route.title)}" />`)
  html = setTag(html, /<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${esc(route.description)}" />`)
  html = setTag(html, /<meta name="twitter:image"[^>]*>/, `<meta name="twitter:image" content="${siteUrl}/og-image.png" />`)

  if (route.path === '/') fs.writeFileSync(basePath, html)
  else {
    const dir = path.join(clientDir, route.path.replace(/^\//, ''))
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'index.html'), html)
  }
}
console.log(`Prerendered ${routes.length} route shells with page-specific metadata.`)
