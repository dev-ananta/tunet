# TuNet Hosting And Security Notes

## Deploying To Vercel

1. Push this repository to GitHub.
2. In Vercel, choose `Add New... -> Project` and import the GitHub repository.
3. Keep the framework preset as `Other` because this is currently a static site.
4. Deploy. Vercel will serve the root files, and `index.html` will route visitors to `landing.html`.

## Connecting A Custom Domain

1. Open the project in Vercel.
2. Go to `Settings -> Domains`.
3. Add your domain, for example `tunet.com`.
4. Add the DNS records Vercel shows you at your domain registrar.
5. Wait for Vercel to verify the records and issue TLS certificates automatically.
6. If you want both apex and `www`, set one as the primary domain and redirect the other.

## Current Prototype Limits

- The sign-in flow is front-end only and stores session data in `localStorage`.
- The dashboard course list is also stored in the browser.
- Do not collect real customer passwords, payment data, or FERPA-sensitive student records with this prototype.

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

## Recommended Next Build Step

Replace the browser-only auth and storage with:

1. A real auth provider.
2. A server API layer.
3. A managed database with row-level or application-level authorization.
4. Stripe for payment collection.
