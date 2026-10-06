# WorkShake

WorkShake is a local-help marketplace for people who need practical problems solved and local service providers looking for genuine work.

## Stack

- React + TypeScript + Vite
- Tailwind CSS 4
- React Router
- Firebase Authentication + Firestore
- Node.js / Express API running on Cloudflare Workers
- Cloudflare Vite plugin + Wrangler

Cloudflare's current Workers runtime supports Node.js compatibility for modern compatibility dates, and the project uses the Workers `httpServerHandler` adapter so the Express API can run at the edge.

## Brand palette

`#577958` · `#819347` · `#D0D6AA` · `#D5D493` · `#F2E08C` · `#E6E9F0`

## Included routes

Public experience:

- `/`
- `/find-help`
- `/categories`
- `/category/:slug`
- `/post-problem`
- `/providers`
- `/provider/:id`
- `/job/:id`
- `/become-a-provider`
- `/reviews`
- `/about`
- `/contact`
- `/faq`
- `/terms`
- `/privacy`

Account experience:

- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/dashboard`
- `/provider-dashboard`
- `/messages`
- `/bookings`
- `/profile`

A custom 404 route is also included.

## 1. Install

```bash
npm install
```

## 2. Configure Firebase

Create a Firebase project and enable:

1. Authentication → Email/Password
2. Firestore Database
3. A Firebase Web App

Copy the environment template:

```bash
cp .env.example .env
```

Fill in the `VITE_FIREBASE_*` values from Firebase Console → Project settings → Your apps.

Deploy the provided Firestore security rules after selecting your Firebase project:

```bash
npx firebase-tools login
npx firebase-tools use --add
npm run firebase:rules
```

## 3. Set the production URL

In `.env`, change both:

```env
SITE_URL=https://your-domain.com
VITE_SITE_URL=https://your-domain.com
```

These values are used for canonicals, Open Graph URLs, sitemap.xml and route-level prerendered metadata.

## 4. Local development

```bash
npm run dev
```

The Cloudflare Vite plugin runs the React app and Worker API in a Workers-compatible development environment.

API checks:

- `/api/health`
- `/api/categories`
- `/api/search-suggestions?q=plumb`

## 5. Build

```bash
npm run build
```

The build process:

1. generates `robots.txt`, `sitemap.xml` and `llms.txt`
2. builds the React SPA + Cloudflare Worker
3. creates crawlable route HTML shells with unique title, description, canonical and social metadata

## 6. Deploy to Cloudflare

Authenticate Wrangler:

```bash
npx wrangler login
```

Deploy:

```bash
npm run deploy
```

The included `wrangler.jsonc` uses a current compatibility date and deploys both the React static assets and Express Worker API as one Cloudflare Workers application.

After deployment, add your custom domain in Cloudflare and rebuild with the final `SITE_URL` values.

## 7. Add final photography

The UI intentionally uses branded placeholders. Put final JPG/PNG images in:

```text
public/images/source/
```

Then run:

```bash
npm run images:optimize
```

WebP and AVIF variants will be written to `public/images/optimized/`.

Replace the placeholder components with `<picture>` elements using the optimized assets and meaningful alt text.

## SEO / discoverability

See `SEO-CHECKLIST.md`.

Implemented items include route metadata, canonicals, sitemap, robots, semantic headings, schema markup, internal links, clean routes, mobile layout, Open Graph, an OG image, an image-compression workflow, `llms.txt`, lazy-loaded page bundles and reduced-motion support.

Google Search Console requires the final domain. Verify it after deployment using the DNS TXT record supplied by Google.

## Before a commercial launch

The codebase is deployment-ready, but marketplace businesses also require operational decisions that cannot be safely invented in code. Before accepting real customers:

- replace placeholder contact email/domain values
- finalize provider verification policy
- add your payment/escrow provider if payments will happen inside WorkShake
- define dispute, cancellation and refund policies
- have Terms and Privacy text reviewed for the jurisdictions where you operate
- configure abuse/spam protection for public forms (Cloudflare Turnstile is a suitable option)
- add monitoring/analytics only after choosing your privacy approach

No payment provider was added because none was specified.
