import { httpServerHandler } from 'cloudflare:node'
import express from 'express'

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

const categories = [
  ['home-repairs', 'Home repairs', 'Fix what is broken around the house.'],
  ['plumbing', 'Plumbing', 'Leaks, pipes, taps and installations.'],
  ['electrical', 'Electrical', 'Safe electrical repairs and installs.'],
  ['vehicle-help', 'Vehicle help', 'Roadside and workshop support.'],
  ['tech-repair', 'Tech repair', 'Phones, laptops, Wi-Fi and devices.'],
  ['cleaning', 'Cleaning', 'Home and office cleaning.'],
  ['moving', 'Moving help', 'Moving, lifting and deliveries.'],
  ['garden', 'Garden & outdoors', 'Keep outdoor spaces in shape.'],
  ['tutoring', 'Tutoring', 'Personal learning support.'],
  ['beauty-wellness', 'Beauty & wellness', 'Convenient personal services.'],
  ['events', 'Events', 'Extra hands for special moments.'],
  ['other', 'Something else', 'Describe the problem and find help.'],
].map(([slug, name, short]) => ({ slug, name, short }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'workshake-api', runtime: 'Cloudflare Workers + Express' })
})

app.get('/api/categories', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=300')
  res.json({ categories })
})

app.get('/api/search-suggestions', (req, res) => {
  const q = String(req.query.q ?? '').trim().toLowerCase().slice(0, 80)
  if (!q) return res.json({ suggestions: [] })
  const terms = ['plumber', 'electrician', 'handyman', 'phone repair', 'laptop repair', 'moving help', 'cleaner', 'gardener', 'tutor', 'event help']
  res.json({ suggestions: terms.filter((term) => term.includes(q)).slice(0, 6) })
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }))

app.listen(3000)
export default httpServerHandler({ port: 3000 })
