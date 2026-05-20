# TuNet

TuNet - Barrington District 220 tutoring service.

This version keeps the public TuNet Barrington content and adds production-shaped registration, free database storage, and safer payment flow:

- Supabase Auth for student/parent accounts.
- Supabase Postgres free tier for profiles, courses, and registrations.
- Stripe Checkout for payment so raw card data is never collected by TuNet pages.
- Rahi, an optional AI assistant for navigation and session price calculations.
- Vercel API routes and security headers.

## Configure

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Add the public Supabase values to `assets/scripts/config.js`.
3. Add these Vercel environment variables:

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PRICE_INITIAL_SESSION=
STRIPE_PRICE_THREE_CREDIT_BUNDLE=
PUBLIC_SITE_URL=https://tunetbarrington.com
RAHI_API_KEY=
RAHI_API_BASE_URL=https://api.openai.com/v1
RAHI_MODEL=gpt-4o-mini
```

Use Stripe Price IDs for the $50 single session and $120 three-credit bundle.

## Rahi AI Assistant

Rahi is server-only for secrets. Add the API key as a GitHub Secret named `RAHI_API_KEY`, not in browser JavaScript:

```sh
gh secret set RAHI_API_KEY
```

For OpenAI-compatible providers, also set `RAHI_API_BASE_URL` and `RAHI_MODEL` in your deployment environment. If `RAHI_API_KEY` is missing, `/api/rahi-assistant` reports unavailable and the Rahi widget does not appear.
