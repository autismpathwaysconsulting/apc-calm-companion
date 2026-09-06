# Launch readiness log (September 4, 2026)

## Current status

Approved workflow exception: physical-device gates may remain provisional while the controlled beta is organised because no test devices are available in this environment. This exception does not satisfy Phase 2 and does not authorise production promotion.

- Deployment candidate: `697e794` reviewed candidate family, currently deployed via `codex/commercial-redesign` branch and exposed at `https://846f1a7a.apc-calm-companion.pages.dev/`.
- Updated candidate and deployment evidence (6 September 2026): latest reviewed commit is `697e794` on `codex/commercial-redesign`, and the latest branch deployment is `https://846f1a7a.apc-calm-companion.pages.dev/` (source `697e794`).
- `export-feedback` and `export-preview-feedback` now run successfully from this environment with live Cloudflare auth.
- Automated verification status: **pass**
  - `npm run check`: 56 tests passed, lint/build/release/build-verification passed.
  - Route and PWA assets on preview: 200 responses confirmed (`/`, `manifest.webmanifest`, `sw.js`).
- Security/API behavior checks remain in place from existing suite and passed (validation, fail-closed behavior, secure feedback endpoint).
- Production domain is currently tied to an older source commit and is not yet on the reviewed candidate.

## Phase 2 (Device/Accessibility gate)

Status is `provisional` only for workflow continuity and must be verified with real devices before production promotion.

| Gate | Status | Notes |
| --- | --- | --- |
| D01 | provisional | iPhone Safari default text |
| D02 | provisional | iPhone Safari increased text |
| D03 | provisional | iPhone add to home screen |
| D04 | provisional | iPhone offline reopen |
| D05 | provisional | iPhone timer background/return |
| D06 | provisional | iPhone VoiceOver |
| D07 | provisional | Android Chrome default text |
| D08 | provisional | Android Chrome increased text |
| D09 | provisional | Android add to home screen |
| D10 | provisional | Android offline reopen |
| D11 | provisional | Android timer background/return |
| D12 | provisional | Android TalkBack |
| D13 | pass | Desktop keyboard/reduced-motion checklist previously validated |
| D14 | provisional | Physical reduced-motion retest |

## Blockers before production promotion

1. Complete one consolidated iPhone session for D01 to D06 and D14, and one consolidated Android session for D07 to D12. Record every result separately.
2. Complete five-parent beta feedback and reference-row matching.
   - Before P1, export preview CSV to `before-csv`.
   - After P5, export preview CSV to `after-csv`.
   - Run:
   `npm run beta:verify before-csv after-csv P1ref P2ref P3ref P4ref P5ref`
3. Obtain explicit `Continue` decision after the final pass criteria.
4. If all criteria pass, proceed to production fast-forward workflow from `operations/public-launch-plan.md`.

## P1–P5 result capture sheet (fill in)

Use this exact format for each participant.

| Participant | Device & browser | First sensible action (Yes/No) | Core tools completed (0–4) | Both emergency scenarios rejected (Yes/No) | App explained as general support (Yes/No) | Tool-entry privacy explained (Yes/No) | Feedback destination explained (Yes/No) | Feedback submitted (Yes/No) | Feedback reference | One matching preview row (Yes/No) | Ease (1–5) | One confusing point | One useful point |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 |  |  |  |  |  |  |  |  |  |  |  |  |
| P2 |  |  |  |  |  |  |  |  |  |  |  |  |
| P3 |  |  |  |  |  |  |  |  |  |  |  |  |
| P4 |  |  |  |  |  |  |  |  |  |  |  |  |
| P5 |  |  |  |  |  |  |  |  |  |  |  |  |

## Decision logic

Apply `beta-test-plan.md` pass rules with one final judgment:

- Continue: all criteria met.
- Revise once: only minor wording/focus/layout defects.
- Stop: safety, privacy, accessibility, or emergency-guidance risk.
