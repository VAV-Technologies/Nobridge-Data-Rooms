# Nobridge Document Sharing Platform — Deployment Plan

## Overview

This plan covers the full setup of a self-hosted, rebranded Nobridge instance for Nobridge. The platform will be used for secure deal document sharing with buyers and sellers in M&A transactions across Southeast Asia.

**Source repo:** https://github.com/mfts/nobridge
**Target brand:** Nobridge
**Primary use case:** Sharing confidential deal documents (CIMs, financials, teasers, NDAs) with prospective buyers

---

## 1. Infrastructure Stack

| Layer | Service | Tier | Notes |
|---|---|---|---|
| Hosting | Vercel | Pro (existing plan) | Next.js native deployment |
| Blob Storage | Vercel Blob | Included with Vercel Pro | Document file storage |
| Database | Supabase | Free tier | PostgreSQL via connection pooler |
| Email | Resend | Free tier (100/day) | Transactional emails, link sharing |
| Analytics | Tinybird | Free tier | Page-by-page document view tracking |
| Background Jobs | Trigger.dev | Free tier | Doc processing, thumbnails, async tasks |
| Auth | NextAuth.js | Built-in | Google OAuth + email/password |
| Domain | Custom Nobridge subdomain | Existing | e.g. docs.nobridge.co or vault.nobridge.co |

---

## 2. Rebranding Requirements

### 2.1 Color System

Replace the entire Nobridge color palette with the Nobridge brand system.

**Primary palette:**

| Token | Hex | Usage |
|---|---|---|
| `--brand-primary` | `#0D0D39` | Primary brand color, nav bg, buttons, headings |
| `--brand-primary-light` | `#1A1A5E` | Hover states, secondary surfaces |
| `--brand-primary-dark` | `#08082A` | Active states, deep backgrounds |
| `--brand-accent` | `#FFFFFF` | Text on primary, button labels |
| `--brand-surface` | `#F8F8FC` | Page backgrounds, cards |
| `--brand-border` | `#E2E2EE` | Dividers, card borders |
| `--brand-text` | `#0D0D39` | Body text (matches primary) |
| `--brand-text-muted` | `#6B6B8D` | Secondary text, labels |
| `--brand-success` | `#10B981` | Success states |
| `--brand-warning` | `#F59E0B` | Warning states |
| `--brand-error` | `#EF4444` | Error states, destructive actions |

### 2.2 Typography and Logo

- Replace all instances of "Nobridge" with "Nobridge" across the entire codebase (UI strings, meta tags, emails, error messages, API responses)
- Replace all instances of "nobridge" in lowercase with "nobridge" (URLs, slugs, file references)
- Replace the Nobridge logo SVG/PNG in `/public` with the Nobridge logo
- Replace favicon and all app icons (favicon.ico, apple-touch-icon, og-image)
- Update `<title>` tags, OpenGraph meta, and Twitter card meta to reference Nobridge
- Update the default email sender name to "Nobridge" (e.g. "Nobridge <noreply@nobridge.co>")

### 2.3 Copy and Messaging

- Replace all marketing copy referencing "DocSend alternative" with language appropriate for M&A deal document sharing
- Landing page headline should reference secure deal document sharing, not generic document sharing
- Update footer links, help text, and onboarding copy to reference Nobridge
- Remove or replace any links to nobridge.co, Nobridge socials, or Nobridge community resources
- Remove the Product Hunt badge and contributor section

### 2.4 Files to Search and Replace

Run a global search-and-replace across the entire codebase for:

```
"Nobridge"  → "Nobridge"
"nobridge"  → "nobridge"
"NOBRIDGE"  → "NOBRIDGE"
"nobridge.co" → "[your-nobridge-domain]"
"nobridge.co"  → "[your-nobridge-domain]"
```

Key files and directories to audit manually after global replace:

- `app/layout.tsx` or `app/layout.js` (meta, title)
- `components/` (nav, sidebar, footer, logo references)
- `public/` (all image assets, favicons, og-images)
- `pages/` (any legacy page routes)
- `lib/` (email templates, constants, config)
- `prisma/schema.prisma` (check app name in comments/seeds)
- `package.json` (name field)
- `vercel.json` (project config)
- `next.config.mjs` (any hardcoded domain references)
- `middleware.ts` (domain checks, redirects)

---

## 3. Tailwind / CSS Configuration

Update `tailwind.config.js` to define the Nobridge brand tokens:

```js
// In tailwind.config.js, extend the theme:
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#0D0D39',
        light: '#1A1A5E',
        dark: '#08082A',
        surface: '#F8F8FC',
        border: '#E2E2EE',
        muted: '#6B6B8D',
      },
    },
  },
}
```

Then do a sweep of all Tailwind classes in components:

- Replace any `bg-primary`, `bg-black`, or Nobridge-specific color classes with `bg-brand`
- Replace hover states with `hover:bg-brand-light`
- Replace text color classes referencing the old palette with `text-brand` or `text-brand-muted`
- Ensure dark mode compatibility if applicable (Nobridge may have dark mode support)

---

## 4. Environment Variables

Create a `.env` file with the following variables. All values must be populated before deployment.

```env
# ============================================================
# CORE APPLICATION
# ============================================================
NEXTAUTH_SECRET=                          # Generate: openssl rand -base64 32
NEXTAUTH_URL=https://[your-nobridge-domain]
NEXT_PUBLIC_BASE_URL=https://[your-nobridge-domain]

# ============================================================
# DATABASE (Supabase PostgreSQL)
# ============================================================
DATABASE_URL=                             # Supabase connection string (with pgbouncer for pooling)
DIRECT_DATABASE_URL=                      # Supabase direct connection (for migrations only)

# ============================================================
# BLOB STORAGE (Vercel Blob)
# ============================================================
BLOB_READ_WRITE_TOKEN=                    # From Vercel dashboard > Storage > Blob

# ============================================================
# EMAIL (Resend)
# ============================================================
RESEND_API_KEY=                           # From Resend dashboard
EMAIL_FROM=noreply@[your-nobridge-domain]

# ============================================================
# AUTHENTICATION (Google OAuth)
# ============================================================
GOOGLE_CLIENT_ID=                         # From Google Cloud Console
GOOGLE_CLIENT_SECRET=                     # From Google Cloud Console

# ============================================================
# ANALYTICS (Tinybird)
# ============================================================
TINYBIRD_TOKEN=                           # From Tinybird dashboard, with read/write rights
NEXT_PUBLIC_TINYBIRD_TOKEN=               # Public read-only token for client-side analytics

# ============================================================
# BACKGROUND JOBS (Trigger.dev)
# ============================================================
TRIGGER_API_KEY=                          # From Trigger.dev dashboard
TRIGGER_API_URL=                          # Trigger.dev API endpoint

# ============================================================
# INTERNAL SECURITY
# ============================================================
INTERNAL_API_KEY=                         # Generate: openssl rand -base64 32
                                          # Used for internal API route authentication

# ============================================================
# OPTIONAL — SKIP FOR NOW
# ============================================================
# STRIPE_SECRET_KEY=                      # Not needed, billing disabled
# STRIPE_WEBHOOK_SECRET=                  #
# GITHUB_CLIENT_ID=                       # Optional second OAuth provider
# GITHUB_CLIENT_SECRET=                   #
```

---

## 5. Security Hardening

This is the most critical section. The platform will handle confidential M&A deal documents. Every layer must be locked down.

### 5.1 Authentication and Access

- [ ] Generate a strong `NEXTAUTH_SECRET` (minimum 32 bytes, use `openssl rand -base64 32`)
- [ ] Generate a strong `INTERNAL_API_KEY` using the same method
- [ ] Restrict OAuth to Google only (disable GitHub OAuth unless needed)
- [ ] Enable email verification for all document access links
- [ ] Set session expiry to a reasonable window (e.g. 24 hours, not 30 days)
- [ ] Review `middleware.ts` to ensure all `/api` routes are properly authenticated
- [ ] Ensure no API routes are publicly accessible without auth (audit every file in `pages/api/` and `app/api/`)

### 5.2 Document Access Controls

- [ ] Default all new document links to require email verification
- [ ] Default all new links to have expiration enabled (e.g. 30 days)
- [ ] Enable password protection as an option on every shared link
- [ ] Enable download prevention by default (viewers can view, not download)
- [ ] Enable watermarking by default on all shared documents (watermark with viewer email)
- [ ] Implement IP-based access logging for all document views
- [ ] Ensure link revocation immediately prevents access (no caching loopholes)

### 5.3 Network and Transport Security

- [ ] Enforce HTTPS everywhere (Vercel handles TLS automatically)
- [ ] Set strict Content Security Policy (CSP) headers
- [ ] Set `X-Content-Type-Options: nosniff`
- [ ] Set `X-Frame-Options: DENY` (prevent embedding in iframes)
- [ ] Set `X-XSS-Protection: 1; mode=block`
- [ ] Set `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Set `Permissions-Policy` to disable camera, microphone, geolocation
- [ ] Configure CORS to allow only your Nobridge domain(s)
- [ ] Add rate limiting to all API routes (especially auth and document access endpoints)

Add security headers in `next.config.mjs`:

```js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https://*.tinybird.co https://*.vercel.app https://*.supabase.co;"
  },
];
```

### 5.4 Database Security

- [ ] Use Supabase connection pooler URL for `DATABASE_URL` (not the direct connection)
- [ ] Use the direct connection URL only for `DIRECT_DATABASE_URL` (used by Prisma migrations only)
- [ ] Enable Row Level Security (RLS) on Supabase if accessing the database outside of the app
- [ ] Ensure Supabase project has a strong database password (change from default)
- [ ] Restrict Supabase network access if possible (IP allowlisting)
- [ ] Never expose database credentials in client-side code or public env vars

### 5.5 Blob Storage Security

- [ ] Ensure Vercel Blob tokens are server-side only (never in `NEXT_PUBLIC_*` vars)
- [ ] Verify that document URLs are signed/temporary (not permanently public)
- [ ] Confirm uploaded files cannot be accessed without going through the application auth layer
- [ ] Set maximum file upload size limits (e.g. 100MB per document)
- [ ] Validate file types on upload (allow only PDF, DOCX, PPTX, XLSX, images)

### 5.6 Email Security

- [ ] Configure SPF, DKIM, and DMARC records for the sending domain on Resend
- [ ] Verify the sending domain in Resend before going live
- [ ] Ensure email templates do not leak document content (only share links, never inline content)

### 5.7 Secrets Management

- [ ] Never commit `.env` to version control (verify `.gitignore` includes `.env*`)
- [ ] Store all secrets in Vercel Environment Variables (not in code)
- [ ] Use separate env vars for production, preview, and development in Vercel
- [ ] Rotate `NEXTAUTH_SECRET` and `INTERNAL_API_KEY` periodically (every 90 days)
- [ ] Audit all `NEXT_PUBLIC_*` environment variables to ensure no secrets are exposed client-side

### 5.8 Dependency Security

- [ ] Run `npm audit` before deploying and resolve all critical/high vulnerabilities
- [ ] Enable Dependabot or Renovate on the GitHub repo for automated dependency updates
- [ ] Pin dependency versions in `package.json` (avoid `^` ranges for critical packages)
- [ ] Review the `ee/` (enterprise edition) directory for any phone-home or license-check code that should be removed or disabled

---

## 6. Deployment Steps (Ordered)

Follow these steps in exact order.

### Phase 1: Setup External Services

```
1. Supabase
   - Create a new project
   - Copy the connection pooler URL → DATABASE_URL
   - Copy the direct connection URL → DIRECT_DATABASE_URL
   - Set a strong database password

2. Resend
   - Create account at resend.com
   - Add and verify your sending domain (e.g. nobridge.co)
   - Set up SPF, DKIM, DMARC DNS records as instructed by Resend
   - Copy API key → RESEND_API_KEY

3. Google OAuth
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Create an OAuth 2.0 Client ID (Web Application)
   - Set authorized redirect URI to: https://[your-domain]/api/auth/callback/google
   - Copy Client ID → GOOGLE_CLIENT_ID
   - Copy Client Secret → GOOGLE_CLIENT_SECRET

4. Tinybird
   - Create account at tinybird.co
   - Create a new workspace
   - Note the auth token → TINYBIRD_TOKEN
   - Create a read-only token → NEXT_PUBLIC_TINYBIRD_TOKEN
   - (Datasources and endpoints will be pushed in Phase 3)

5. Trigger.dev
   - Create account at trigger.dev
   - Create a new project
   - Copy API key → TRIGGER_API_KEY
   - Copy API URL → TRIGGER_API_URL

6. Vercel Blob
   - In your Vercel dashboard, go to Storage → Create Blob Store
   - Link it to the project
   - Copy the read/write token → BLOB_READ_WRITE_TOKEN
```

### Phase 2: Clone, Rebrand, Configure

```
1. Clone the repository
   git clone https://github.com/mfts/nobridge.git nobridge-docs
   cd nobridge-docs

2. Remove the existing git remote and create your own
   git remote remove origin
   git remote add origin [your-private-repo-url]

3. Run the global rebrand (search and replace)
   - Replace all "Nobridge" → "Nobridge"
   - Replace all "nobridge" → "nobridge"
   - Replace logo assets in /public
   - Update meta tags, titles, favicons
   - Update email templates in /lib or /components
   - Update tailwind.config.js with Nobridge color system

4. Configure environment variables
   cp .env.example .env
   - Fill in all values from Phase 1
   - Generate NEXTAUTH_SECRET and INTERNAL_API_KEY

5. Install dependencies
   npm install

6. Run npm audit and fix critical issues
   npm audit
   npm audit fix
```

### Phase 3: Database and Analytics Setup

```
1. Push Prisma schema to Supabase
   npx prisma generate
   npx prisma db push
   (or npx prisma migrate deploy if using migrations)

2. Push Tinybird datasources
   cd lib/tinybird
   tb auth              # authenticate with Tinybird CLI
   tb push datasources/*
   tb push endpoints/get_*
   cd ../..
```

### Phase 4: Security Hardening

```
1. Add security headers to next.config.mjs (see Section 5.3)
2. Audit all API routes for proper authentication
3. Review middleware.ts for domain and auth checks
4. Set default document security options (see Section 5.2)
5. Validate .gitignore excludes all env and secret files
6. Review and remove any Nobridge telemetry, analytics pings, or license checks
7. Review the ee/ directory — remove or disable any enterprise license verification code
```

### Phase 5: Test Locally

```
1. Run the development server
   npm run dev

2. Test the following flows:
   - [ ] User registration/login via Google OAuth
   - [ ] Document upload (PDF, DOCX)
   - [ ] Document link creation with password protection
   - [ ] Document link creation with email verification
   - [ ] Document viewing as an external recipient
   - [ ] Document view analytics appearing in Tinybird
   - [ ] Email delivery via Resend (link sharing notification)
   - [ ] Link expiration enforcement
   - [ ] Link revocation
   - [ ] Watermark rendering on viewed documents
   - [ ] Download prevention working correctly
   - [ ] Background job execution via Trigger.dev

3. Test security:
   - [ ] Try accessing API routes without authentication (should fail)
   - [ ] Try accessing documents with expired links (should fail)
   - [ ] Try accessing documents with revoked links (should fail)
   - [ ] Verify security headers present in browser dev tools (Network tab)
   - [ ] Verify no secrets exposed in client-side JS bundles
```

### Phase 6: Deploy to Vercel

```
1. Push to your private repo
   git add .
   git commit -m "Nobridge rebrand + security hardening"
   git push origin main

2. Import the project in Vercel
   - Connect your GitHub repo
   - Set all environment variables in Vercel dashboard
   - Use separate values for Production / Preview / Development

3. Set the custom domain
   - Add your domain (e.g. docs.nobridge.co) in Vercel project settings
   - Update DNS records as instructed by Vercel
   - Verify SSL certificate is active

4. Post-deployment verification
   - [ ] Visit the live URL, confirm Nobridge branding loads
   - [ ] Test the full document sharing flow end-to-end
   - [ ] Verify HTTPS is enforced
   - [ ] Check security headers at securityheaders.com
   - [ ] Run a Lighthouse audit for performance baseline
```

---

## 7. Post-Launch Maintenance

- Monitor Vercel usage dashboard for blob storage and serverless function usage
- Monitor Supabase dashboard for database connection limits (free tier: 500MB storage, direct connections limited)
- Monitor Resend for email delivery rates and bounce rates
- Set up Vercel deployment notifications (Slack or email)
- Pull upstream Nobridge updates periodically for security patches (but carefully merge to avoid overwriting Nobridge branding)
- Rotate secrets every 90 days (NEXTAUTH_SECRET, INTERNAL_API_KEY, RESEND_API_KEY)
- Run `npm audit` monthly

---

## 8. Domain Recommendation

Use a subdomain that signals security and professionalism to deal counterparties:

- `vault.nobridge.co` (recommended — conveys security for deal docs)
- `docs.nobridge.co` (straightforward)
- `deal.nobridge.co` (deal-specific)
- `room.nobridge.co` (data room connotation)

---

## 9. Files Reference

Key files in the Nobridge repo that will need the most attention:

```
nobridge/
├── .env.example              ← Template for env vars
├── next.config.mjs           ← Security headers, domain config
├── middleware.ts              ← Auth middleware, domain routing
├── tailwind.config.js        ← Color system rebrand
├── vercel.json               ← Vercel deployment config
├── trigger.config.ts         ← Trigger.dev job config
├── prisma/
│   └── schema.prisma         ← Database schema
├── lib/
│   ├── tinybird/             ← Analytics datasources and endpoints
│   └── ...                   ← Email templates, utils, constants
├── components/               ← All UI components (rebrand sweep)
├── app/                      ← App router pages
├── pages/                    ← Pages router (if any legacy routes)
├── public/                   ← Logo, favicon, og-image, static assets
└── ee/                       ← Enterprise features (audit for license checks)
```

---

## 10. Important Notes for Claude Code

- Do NOT skip any security hardening steps. Every checkbox in Section 5 must be addressed.
- Do NOT leave any Nobridge branding in the codebase. Search exhaustively.
- Do NOT expose any secrets in `NEXT_PUBLIC_*` environment variables.
- The `ee/` directory may contain enterprise license checks that gate features. Review and modify so features work without a Nobridge license key, or remove the license check logic entirely.
- When updating colors, preserve hover/focus/active state contrast ratios for accessibility. The primary `#0D0D39` is very dark, so ensure text on this background is always white or very light.
- All email templates must be updated to say "Nobridge" and use the Nobridge color scheme.
- The CSP header in Section 5.3 is a starting template. It may need adjustment based on which external resources Nobridge loads (fonts, scripts, etc.). Test thoroughly.
- Prioritize security over features. If a feature cannot be made secure in the initial deployment, disable it and flag it for later.
