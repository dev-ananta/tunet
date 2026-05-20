# TuNet

TuNet - Barrington District 220 tutoring service.

This version keeps the public TuNet Barrington content and adds production-shaped registration, free database storage, and safer payment flow:

- Supabase Auth for student/parent accounts.
- Supabase Postgres free tier for profiles, courses, and registrations.
- Stripe Checkout for payment so raw card data is never collected by TuNet pages.
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
```

Use Stripe Price IDs for the $50 single session and $120 three-credit bundle.
