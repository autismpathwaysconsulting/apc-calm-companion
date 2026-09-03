# Calm Companion controlled beta gates

Scope: review branches only. This record does not authorise a production merge, public promotion, paid sale, or connection of the printable QR code.

| Gate | Acceptance evidence | Current state |
| --- | --- | --- |
| Isolated preview | `codex/commercial-redesign` deploys to its Cloudflare Pages branch URL and production remains unchanged | Passed on 3 September 2026 for `f327df6`: the branch URL serves the new fifth Quick Check tool while production remains on its earlier interface. The preview returns 200 with the expected CSP, HSTS, framing, permissions, referrer, and content-type protections; `/api/feedback` rejects GET with 405 and Function security headers |
| Automated release | Lint, tests, production build, release verification, build verification, and `npm audit` all pass from the exact candidate in a path containing spaces | Passed for `f327df6`: 43 tests pass and the dependency audit reports 0 vulnerabilities |
| Feedback fails closed | Missing D1 or Turnstile configuration returns an unavailable state and stores nothing | Passed |
| Preview feedback | Preview-only D1, preview Turnstile keys, exact origin restrictions, successful insert, and reference-based comment removal are demonstrated | Passed on 3 September 2026. Preview has the exact branch hostname and origin, explicit test mode, an encrypted secret, the official preview site key, and `FEEDBACK_DB` bound to `apc-calm-feedback-preview`. A fresh non-personal submission from the candidate increased the table from one row to two and stored `yes`, `wording`, and `1.0.0-beta.1`. Its optional comment was then removed and its review state set to `removed`. The synthetic local nickname was also removed from the browser |
| Production configuration | A separate production D1 database, real hostname-restricted Turnstile keys, exact production variables, migration, fail-closed runtime, and rate limit are visible before merge | Passed on 3 September 2026. `FEEDBACK_DB` is bound to the empty, migrated `apc-calm-feedback-production` database. A managed Turnstile widget is restricted to `calm.autismpathwaysconsulting.com`; its secret is encrypted. The exact production origin, hostname, app version, and site key are saved, with no preview test-mode variable. Pages is fail closed. The active zone rule blocks an IP for 10 seconds after more than five matching POST requests in 10 seconds; 10 seconds and Block were the only period and action offered by the current plan. These Pages settings take effect on the next deployment |
| App-specific policies | Calm Companion data flow, optional local-only nickname, shared-device privacy, feedback retention, and usage boundaries are added to APC privacy and terms pages on a review branch | Prepared and locally verified on `codex/calm-companion-beta-policies`; not live |
| Device and accessibility check | iPhone, Android, desktop, keyboard, and one screen-reader path pass without a material defect | Pending human-device testing |
| Five-parent beta | All safety criteria and at least 4 of 5 independent-use criteria in `operations/beta-test-plan.md` pass | Pending |
| Beta decision | One documented stop, revise once, or limited-release decision is made from the evidence | Pending |

## Release rule

The app may move to a limited organic public release only when every gate above passes. Paid printable sales and mass promotion remain separate later decisions.
