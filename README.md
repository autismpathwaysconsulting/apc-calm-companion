# APC Calm Companion

APC Calm Companion is a parent-facing web app for ordinary, non-emergency moments. It helps a parent choose one observable situation, try one small action and use an optional visual tool.

## Product boundaries

- General educational support only
- Not therapy, diagnosis, assessment, medical advice or emergency support
- No claim that an action will calm every child
- No account, advertising tracker or clinical or behavioural profile
- One optional name or nickname, limited to 24 characters, may be saved only in that browser so the prompt can be personalised. It can be removed at any time and is never included with feedback
- No persistence of diagnoses, dates of birth, photos, school details, notes, histories, routines or behaviour records
- Optional feedback sends only a usefulness answer, an optional improvement category and an optional comment; the server adds the app version and submission date
- Feedback never includes tool entries or the action selected by the parent
- The form does not request personal or child information, but optional free text may contain information entered accidentally

## Local development

```bash
npm ci
npm run dev
```

The Vite development server shows the interface only. It does not serve the Pages Function or D1 database, so it cannot complete a feedback submission. End-to-end feedback testing must use a Cloudflare Pages preview with preview-only D1 and Turnstile configuration.

## Release checks

```bash
npm run check
```

The static host must honour `public/_headers`. Test the generated `dist` folder on representative iPhone, Android and desktop browsers before public promotion.

`npm run check` runs lint, content tests, the production build, safety and privacy verification, and production-asset verification. It does not replace deployed-device, assistive-technology or parent usability testing.

## Feedback service

The parent feedback form posts only to the same-origin `/api/feedback` Pages Function. The Function validates a strict data allow-list, always requires Turnstile and inserts through a prepared D1 statement. Feedback is not emailed or published; an authorised APC reviewer reads it in Cloudflare D1. The form does not request names, email addresses or child information. The database does not include fields for IP addresses, user agents, cookies, device identifiers, selected actions or tool contents. Restricted reviewers must still treat optional comments as potentially containing personal information entered accidentally.

The optional nickname is separate from feedback. It stays in browser `localStorage`, is not sent to APC and is excluded from the feedback request. On a shared device, anyone using the same browser may see it until it is removed, so parents should leave it blank or remove it after use when that matters for privacy. The app remains fully usable without a nickname.

Required production configuration:

- D1 binding: `FEEDBACK_DB`
- Secret: `TURNSTILE_SECRET_KEY`
- Variable: `VITE_TURNSTILE_SITE_KEY` for the public client site key
- Variable: `FEEDBACK_APP_VERSION`, for example `1.0.0-beta.1`; this is stamped by the server
- Variable: `FEEDBACK_ALLOWED_ORIGIN=https://calm.autismpathwaysconsulting.com`
- Variable: `FEEDBACK_ALLOWED_HOSTNAME=calm.autismpathwaysconsulting.com`

If any required binding or variable is missing, the endpoint fails closed and stores nothing.

Apply `migrations/0001_feedback.sql` to separate preview and production D1 databases. Use Cloudflare's official Turnstile test keys in automated or preview testing. Never place the Turnstile secret in a `VITE_` variable.

Before enabling production submissions:

1. Update the live app-specific privacy notice and terms.
2. Configure separate preview and production D1 bindings and Turnstile keys.
3. Add a Cloudflare rate-limit rule for `POST /api/feedback`. Start with a low managed-challenge threshold, document the chosen value and review false positives during the pilot.
4. Confirm that feedback is not queued by the service worker when offline.
5. Follow `operations/feedback-retention.md` every month and retain the audit evidence.
6. Test export, reference-based deletion and restricted reviewer access through the authenticated Cloudflare D1 dashboard.

For routine owner review, double-click `../Export Calm Companion Feedback.command`. It creates a timestamped Excel-readable CSV in `../Feedback_Exports` without exposing a download route in the public app. See `operations/feedback-access-and-excel-export.md`.

Controlled-beta operations:

- `GATES.md` records the release decision gates.
- `operations/cloudflare-preview-setup.md` gives the isolated preview configuration and end-to-end feedback checks.
- `operations/beta-test-plan.md` defines the five-parent usability and safeguarding test.
