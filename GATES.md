# Calm Companion controlled beta gates

Scope: review branches only. This record does not authorise a production merge, public promotion, paid sale, or connection of the printable QR code.

| Gate | Acceptance evidence | Current state |
| --- | --- | --- |
| Isolated preview | `codex/commercial-redesign` deploys to its Cloudflare Pages branch URL and production remains unchanged | Passed on 3 September 2026 for `f327df6`: the branch URL serves the new fifth Quick Check tool while production remains on its earlier interface. The preview returns 200 with the expected CSP, HSTS, framing, permissions, referrer, and content-type protections; `/api/feedback` rejects GET with 405 and Function security headers |
| Automated release | Lint, tests, production build, release verification, build verification, and `npm audit` all pass from the exact candidate in a path containing spaces | Passed for `f327df6`: 43 tests pass and the dependency audit reports 0 vulnerabilities |
| Feedback fails closed | Missing D1 or Turnstile configuration returns an unavailable state and stores nothing | Passed |
| Preview feedback | Preview-only D1, preview Turnstile keys, exact origin restrictions, successful insert, and reference-based comment removal are demonstrated | Partially re-verified on 3 September 2026 for `f327df6`: the branch preview loads Turnstile, enables submission after the security check, and retains a feedback draft across More sections. A fresh insert, separate preview D1 identity, row inspection, and cleanup still require authenticated Cloudflare verification |
| App-specific policies | Calm Companion data flow, optional local-only nickname, shared-device privacy, feedback retention, and usage boundaries are added to APC privacy and terms pages on a review branch | Prepared and locally verified on `codex/calm-companion-beta-policies`; not live |
| Device and accessibility check | iPhone, Android, desktop, keyboard, and one screen-reader path pass without a material defect | Pending human-device testing |
| Five-parent beta | All safety criteria and at least 4 of 5 independent-use criteria in `operations/beta-test-plan.md` pass | Pending |
| Beta decision | One documented stop, revise once, or limited-release decision is made from the evidence | Pending |

## Release rule

The app may move to a limited organic public release only when every gate above passes. Paid printable sales and mass promotion remain separate later decisions.
