# WorkShake SEO production checklist

This project implements the technical items from the supplied SEO checklist as far as they can be completed before a real domain and final photography are available.

- [x] `sitemap.xml` generated from `seo.routes.json`
- [x] `robots.txt` generated with the sitemap location
- [x] Public pages are indexable; private account/dashboard routes are intentionally noindex/disallowed
- [x] Canonical URLs on public pages
- [x] Unique page titles
- [x] Unique meta descriptions
- [x] One primary H1 per page template
- [x] Logical heading order in major templates
- [x] Meaningful accessibility labels; final photos must receive descriptive alt text
- [x] Schema markup for Organization, WebSite, FAQ and provider/service pages where applicable
- [x] Internal links between categories, jobs, providers, legal pages and key calls to action
- [x] Clean human-readable route slugs
- [x] Responsive mobile layout
- [x] Cloudflare HTTPS-ready deployment
- [x] Open Graph + Twitter image metadata
- [x] `llms.txt`
- [x] Image optimization pipeline (`npm run images:optimize`) for final JPG/PNG assets
- [x] Route-level lazy loading and reduced-motion support to support Core Web Vitals
- [ ] Replace visual placeholders with final optimized photography
- [ ] Set `SITE_URL` and `VITE_SITE_URL` to the real production domain before final build
- [ ] Verify Google Search Console after DNS is live (DNS verification is recommended on Cloudflare)
- [ ] Run Lighthouse/PageSpeed on the final deployed domain after real images, analytics and third-party scripts are added
- [ ] Run a broken-link crawl on the final domain after content is frozen

## Search Console

Search Console verification cannot be truthfully pre-completed without the real domain and verification token. After the domain is on Cloudflare, add the TXT record Google provides under Cloudflare DNS and complete verification in Search Console.
