# StreamForge Overlay Empire

Production-ready Next.js ecommerce platform for selling downloadable OBS overlay JSON products with customer accounts, admin controls, Stripe Checkout, secure download delivery, and automated overlay generation.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Stripe Checkout
- Cookie-based auth with admin and customer roles

## Installation

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, and your Stripe keys.
3. Install dependencies:

```bash
npm install
```

## Environment variables

```env
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
AUTH_SECRET=
ADMIN_EMAIL=
```

## Run locally

1. Generate Prisma client and create the database schema:

```bash
npm run prisma:generate
npx prisma migrate dev --name init
```

2. Seed demo data:

```bash
npm run db:seed
```

3. Start the app:

```bash
npm run dev
```

## Seed credentials

- Admin: `ADMIN_EMAIL` from `.env` with password `admin12345`
- Customer: `customer@example.com` with password `customer12345`

## Generate overlays

Use the admin generator UI at `/admin/generator`, or run the CLI:

```bash
npm run generate:overlays -- "Call of Duty" "Webcam Overlay" 10
```

Generated OBS JSON files are written to `storage/overlays/generated/`.
Generated preview images are written to `public/generated-previews/`.

## Stripe configuration

1. Create a webhook in Stripe pointing to `/api/webhook/stripe`.
2. Subscribe to `checkout.session.completed`.
3. Put the webhook signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Put your secret and publishable keys in the matching env vars.

## Admin dashboard

- Register or seed the admin user matching `ADMIN_EMAIL`.
- Sign in at `/login`.
- Admin pages:
  - `/admin`
  - `/admin/products`
  - `/admin/generate-overlays`
  - `/admin/orders`
  - `/admin/analytics`

## Key storefront routes

- `/`
- `/marketplace`
- `/games/call-of-duty`
- `/games/arc-raiders`
- `/games/dying-light-the-beast`
- `/games/subnautica-2`
- `/games/fallout`
- `/games/escape-from-tarkov`
- `/games/rainbow-six-siege`
- `/product/[slug]`
- `/cart`
- `/checkout`
- `/downloads`
- `/account`

## Deployment

1. Provision PostgreSQL.
2. Set environment variables on your host.
3. Run Prisma migrations in the deployment environment.
4. Deploy the Next.js app.
5. Ensure the runtime can persist or mount `storage/overlays/generated/`, or adapt the download layer to object storage for serverless production.

## Notes

- Only original game-inspired visuals are generated. No official game logos, screenshots, or copyrighted artwork are included.
- Secure downloads verify purchase ownership before streaming files.
- Stripe webhook validation is enforced before order fulfillment.
