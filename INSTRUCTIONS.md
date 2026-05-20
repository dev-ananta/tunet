# TuNet Hosting And Security Notes

## Deploying To Vercel

1. Push this repository to GitHub.
2. In Vercel, choose `Add New... -> Project` and import the GitHub repository.
3. Keep the framework preset as `Other`. Vercel will serve the static pages and the `/api/*` serverless functions.
4. Deploy. `index.html` routes visitors to `landing.html`.

## Connecting A Custom Domain

1. Open the project in Vercel.
2. Go to `Settings -> Domains`.
3. Add your domain, for example `tunet.com`.
4. Add the DNS records Vercel shows you at your domain registrar.
5. Wait for Vercel to verify the records and issue TLS certificates automatically.
6. If you want both apex and `www`, set one as the primary domain and redirect the other.

## Current Integration Notes

- Supabase Auth backs real student/parent accounts once `assets/scripts/config.js` is populated.
- Supabase Postgres stores profiles, courses, and registration requests. Run `supabase/schema.sql` before launch.
- Stripe Checkout handles card collection. Do not add card-number fields to TuNet pages.
- If Supabase values are blank, the site falls back to local preview storage only.

## Hardening The Future Backend And Database

### Authentication

- Use a managed identity provider such as Auth0, Clerk, or WorkOS.
- Store sessions in secure, HTTP-only, same-site cookies.
- Require MFA for staff and admin accounts.
- Add rate limiting, bot protection, and login anomaly monitoring.

### Database And Secrets

- Use a managed database with automatic backups, encryption at rest, point-in-time restore, and network isolation.
- Give the app a least-privilege database role instead of full admin rights.
- Keep database credentials only in Vercel environment variables, never in client-side JavaScript.
- Rotate secrets regularly and immediately after any suspected exposure.

### App Security

- Put all sensitive operations behind server-side APIs.
- Validate and sanitize all incoming data on the server.
- Use parameterized queries or an ORM to avoid SQL injection.
- Add authorization checks for every record read and write.
- Avoid storing raw payment data yourself; use Stripe Elements or Stripe Checkout so card handling stays with Stripe.

### Operational Security

- Turn on audit logging for auth events, admin changes, and data exports.
- Add alerts for repeated failed logins, privilege changes, and unusual traffic spikes.
- Keep dependencies updated and run regular dependency and SAST scans.
- Add a Web Application Firewall and DDoS protection in front of any backend endpoints.

### Privacy And Compliance

- Minimize the student data you collect.
- Separate parent, student, tutor, and admin roles with strict access controls.
- Document retention and deletion policies before launch.
- Review FERPA, state privacy law, and payment compliance obligations with legal counsel before production use.

## Launch Checklist

1. Add Supabase public URL and anon key to `assets/scripts/config.js`.
2. Add Vercel environment variables from `README.md`.
3. Create Stripe Price IDs for the $50 single session and $120 three-credit bundle.
4. Test sign-up, course registration, profile saving, and checkout in Stripe test mode.
