# Cloudflare preview feedback setup

Use these settings only for the `codex/commercial-redesign` preview. Do not attach the production database or production Turnstile keys to the preview environment.

## 1. Create the preview database

Create a D1 database named `apc-calm-feedback-preview` in the APC Cloudflare account. Apply `migrations/0001_feedback.sql` to that database.

Verify the schema in the D1 console:

```sql
SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'feedback';
PRAGMA table_info(feedback);
```

The table must contain only the fields defined in the migration. It must not contain an IP address, user agent, email, child, diagnosis, device, selected-action, or tool-entry field.

## 2. Bind preview storage

In the `apc-calm-companion` Pages project, add a preview-environment D1 binding:

- Variable name: `FEEDBACK_DB`
- Database: `apc-calm-feedback-preview`

Cloudflare requires a new deployment after bindings change.

## 3. Add preview variables and secret

Add these to the preview environment only:

| Name | Type | Value |
| --- | --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | Build variable | `1x00000000000000000000AA` |
| `TURNSTILE_SECRET_KEY` | Encrypted secret | `1x0000000000000000000000000000000AA` |
| `FEEDBACK_APP_VERSION` | Runtime variable | `1.0.0-beta.1` |
| `FEEDBACK_ALLOWED_ORIGIN` | Runtime variable | `https://codex-commercial-redesign.apc-calm-companion.pages.dev` |
| `FEEDBACK_ALLOWED_HOSTNAME` | Runtime variable | `codex-commercial-redesign.apc-calm-companion.pages.dev` |

The listed Turnstile keys are Cloudflare's public always-pass testing keys. They are suitable for a controlled preview only and must never be used for production.

## 4. Redeploy and test

Redeploy `codex/commercial-redesign`, then complete these checks:

1. Open Feedback and confirm the security check loads.
2. Submit: usefulness `Yes`, category `Wording`, comment `Beta feedback test. No personal information.`
3. Confirm a submission reference appears.
4. Query D1 using the reference and confirm exactly one row exists.
5. Confirm the response does not echo the comment.
6. Confirm refreshing the page does not submit again.
7. Confirm a foreign-origin request is rejected.
8. Confirm the form displays a safe retry message if the database binding is temporarily removed.

Verification query:

```sql
SELECT id, schema_version, helpfulness, category, app_version, created_at, review_status
FROM feedback
WHERE id = ?;
```

## 5. Test removal and reset the preview

Use the submission reference to remove the test comment:

```sql
UPDATE feedback
SET comment = NULL,
    review_status = 'removed'
WHERE id = ?;
```

Confirm the comment is `NULL`. Preview test rows may then be deleted before inviting parents. Do not perform these deletion steps on production data.

## Production hold

Production requires a separate D1 database, a real hostname-restricted Turnstile widget, production variables, rate limiting, live app-specific privacy and terms, and a fresh end-to-end test. Completing this preview setup does not authorise production activation.
