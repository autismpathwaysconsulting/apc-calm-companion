# Calm Companion controlled beta gates

Scope: review branches only. This record does not authorise a production merge, public promotion, paid sale, or connection of the printable QR code.

| Gate | Acceptance evidence | Current state |
| --- | --- | --- |
| Isolated preview | `codex/commercial-redesign` deploys to its Cloudflare Pages branch URL and production remains unchanged | Passed |
| Automated release | Lint, 43 tests, production build, release verification, build verification, and `npm audit` all pass from the exact candidate in a path containing spaces | Passed on 3 September 2026; dependency audit reports 0 vulnerabilities |
| Feedback fails closed | Missing D1 or Turnstile configuration returns an unavailable state and stores nothing | Passed |
| Preview feedback | Preview-only D1, preview Turnstile keys, exact origin restrictions, successful insert, and reference-based comment removal are demonstrated | Partially re-verified on 3 September 2026: the branch preview and Turnstile load and a feedback draft remains intact across More sections. A fresh insert, separate preview D1 identity, row inspection, and cleanup still require authenticated Cloudflare verification |
| App-specific policies | Calm Companion data flow, optional local-only nickname, shared-device privacy, feedback retention, and usage boundaries are added to APC privacy and terms pages on a review branch | Prepared and locally verified on `codex/calm-companion-beta-policies`; not live |
| Device and accessibility check | iPhone, Android, desktop, keyboard, and one screen-reader path pass without a material defect | Pending human-device testing |
| Five-parent beta | All safety criteria and at least 4 of 5 independent-use criteria in `operations/beta-test-plan.md` pass | Pending |
| Beta decision | One documented stop, revise once, or limited-release decision is made from the evidence | Pending |

## Release rule

The app may move to a limited organic public release only when every gate above passes. Paid printable sales and mass promotion remain separate later decisions.
