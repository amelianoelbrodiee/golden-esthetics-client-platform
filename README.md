# Golden Esthetics Client Platform

A production client website and lightweight business platform for licensed esthetician McKinnley Golden. The experience turns social visitors into informed Square booking clicks while giving the business a privacy-conscious recommendation flow, lead capture, analytics, and a private operating dashboard.

Built by Sparrow as client work. This repository is structured as a portfolio-ready case study without presenting Golden Esthetics as a personal side project.

## Live product

- Production: [golden-esthetics-client-platform.vercel.app](https://golden-esthetics-client-platform.vercel.app)
- Booking: [Golden Esthetics on Square](https://golden-esthetics-101699.square.site/)
- Instagram: [@goldenn.estheticss](https://www.instagram.com/goldenn.estheticss/)

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS
- Supabase Postgres, Auth, Row Level Security, and generated Data API
- Vercel production hosting
- Square booking handoff
- On-device, non-medical photo observations with a replaceable analysis-provider boundary

## Product features

- Premium mobile-first service and brand site
- Sparrow Skin Match with optional photo analysis and a no-photo skincare quiz
- Rule-based service, add-on, and Golden Routine recommendations
- Budget-aware appointment builder with configurable student pricing
- Contact leads, Golden List signups, and privacy-conscious event analytics
- Consent-gated Supabase Storage gallery with owner/admin uploads and publish controls
- Owner/admin dashboard with homepage editing, gallery management, funnel metrics, recommendations, leads, and access management
- Gold-glitter opening reveal with automatic sparkle-sound playback when the visitor’s browser permits autoplay
- SEO metadata, sitemap, robots rules, and a bespoke social card

## Access model

The dashboard at `/admin` is not publicly accessible.

- McKinnley is the `owner` and can approve administrator emails.
- Sparrow uses a separate `admin` account for site operations.
- An Auth account alone is insufficient. Supabase RLS also requires an active matching record in `admin_users`.
- The owner approves an email before that person activates their account.
- There is no service-role key in the application. Authenticated requests retain the user JWT so database policies remain in force.

Square remains the source of truth for appointment availability, client records, rescheduling, and payments. The website sends booking traffic to Square; the private dashboard manages website content rather than duplicating Square’s appointment system.

The initial owner email is seeded by `supabase/schema.sql`. The first-time activation form sends Supabase’s normal confirmation email before sign-in.

## Database security

Every public-schema table has RLS enabled. Anonymous users receive only the operations needed by the product:

- insert validated consultation, lead, newsletter, booking-click, and analytics records;
- read only active services, approved products, and consent-confirmed gallery items;
- no ability to read leads, consultations, subscribers, analytics, settings, or dashboard access records.

All dashboard tables require an approved owner/admin identity. Private authorization functions live outside the exposed schema. The production Supabase Security Advisor reports no findings.

## Environment variables

Copy `.env.example` to `.env.local` for local development.

- `NEXT_PUBLIC_SITE_URL`: canonical site origin.
- `NEXT_PUBLIC_SQUARE_BOOKING_URL`: Square booking origin.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project API origin.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: browser-safe publishable key protected by grants and RLS.
- `SKIN_ANALYSIS_PROVIDER`: `mock` for the privacy-conscious local implementation.
- `AI_API_KEY`: reserved for a future server-side provider; never expose it publicly.

`.env.production` contains only browser-safe public configuration. Secret and service-role keys must never be committed or prefixed with `NEXT_PUBLIC_`.

## Local development

```bash
npm install
npm run dev
```

Verification:

```bash
npm run lint
npm run test
npm run build
```

## Supabase

The committed `supabase/schema.sql` is the authoritative production schema. It includes tables, constraints, indexes, explicit Data API grants, RLS policies, the owner/admin allowlist, and the approved-account binding trigger.

For a fresh environment:

1. Create a dedicated Supabase project.
2. Apply `supabase/schema.sql` as a migration.
3. configure the public project URL and publishable key;
4. set the Auth site URL and redirect allowlist to the production `/admin` origin;
5. run the Supabase Security and Performance Advisors;
6. activate the owner, then have the owner approve the administrator email.

## Privacy and cosmetic guidance

Face photos are optional. The production Skin Match implementation processes an image on the visitor’s device and does not upload or store the photo. It does not identify people, infer protected traits, score attractiveness, diagnose skin conditions, or train a model. Only a user-approved, non-image consultation summary can be saved.

Recommendations provide cosmetic service guidance, not medical advice. Concerning symptoms are routed toward an appropriate licensed medical professional rather than a facial recommendation.

## Deployment

Vercel builds the standard Next.js application. Production configuration is separated from source secrets, and Git integration can create preview deployments for future branches and production deployments from `main`.

See `CONTENT_TODO.md` for policies, service details, location information, and content that still require McKinnley’s approval before a full commercial launch.

