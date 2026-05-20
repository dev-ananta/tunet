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
- Rahi, the AI assistant, appears only when the server has `RAHI_API_KEY`.
- Page copy, image URLs, prices, and placeholders are centralized in `assets/scripts/content-index.js`.
- If Supabase values are blank, the site falls back to local preview storage only.
- If `RAHI_API_KEY` is blank or missing, the assistant disappears automatically.

## Content Index System

Most editable site content lives in `assets/scripts/content-index.js` under `window.TuNetContent`.

Each page has its own object, such as `landing`, `signin`, `dashboard`, `payment`, `contact`, `notFound`, and `rahi`. Each object is separated into these categories:

- `images_index`: external media URLs.
- `headers_index`: main headings, section titles, card titles, and labels that function as headings.
- `subtext_index`: supporting descriptions and short helper copy.
- `text_index`: normal body text, button text, nav-like text, list items, and miscellaneous labels.
- `prices_index`: visible price strings and price suffixes.
- `placeholders_index`: input and textarea placeholder text.

HTML elements reference content with data attributes:

```html
<h2 data-content="landing.headers_index.2">Fallback heading</h2>
<p data-content="landing.subtext_index.3">Fallback subtext</p>
<img data-content-image="landing.images_index.0" alt="Tutor helping student" />
<input data-content-placeholder="landing.placeholders_index.0" placeholder="Email" />
<h1 data-content-html="landing.headers_index.1">Fallback HTML heading</h1>
```

`assets/scripts/common.js` hydrates these attributes on `DOMContentLoaded`. Always load scripts in this order on pages that use indexed content:

```html
<script src="assets/scripts/config.js"></script>
<script src="assets/scripts/content-index.js"></script>
<script src="assets/scripts/common.js"></script>
```

Use `data-content-html` only when the indexed value intentionally contains markup, such as the landing hero heading with an inner `<span>`. For normal text, use `data-content` so the value is inserted safely as text.

When adding a new image or text item:

1. Add the value to the correct page/category array in `content-index.js`.
2. Reference it from the HTML with the matching path, for example `payment.prices_index.2`.
3. Keep the fallback text inside the HTML element so the page still has readable content if JavaScript fails.
4. Do not hardcode external image URLs directly in HTML; put them in `images_index`.

## Rahi API Secret

Use a GitHub Secret for the assistant key. Never put the key in `assets/scripts/config.js` or any HTML file.

```sh
gh secret set RAHI_API_KEY
```

Optional provider settings:

```sh
gh secret set RAHI_API_BASE_URL
gh secret set RAHI_MODEL
```

The assistant route supports OpenAI-compatible chat-completions APIs. For Vercel deployments, mirror these as Vercel environment variables too, because the serverless function reads from runtime env vars.

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
4. Add `RAHI_API_KEY` as a GitHub Secret and Vercel environment variable if Rahi should appear.
5. Verify all `data-content*` paths resolve after content-index edits.
6. Test sign-up, course registration, profile saving, checkout in Stripe test mode, and Rahi navigation/pricing answers.
