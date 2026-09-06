# APC Calm Companion launch operator checklist

Use this as the live execution sheet for the remaining gates.
Goal: move from reviewed candidate to controlled public release with auditable evidence.

## 0) Before external checks

- Confirm branch is clean and on `codex/commercial-redesign`.
- Confirm candidate is the reviewed build:
  - `git log --oneline -n 5`
  - `npm run check`
- Confirm export command can run in your environment:
  - `npm run beta:verify <before-csv> <after-csv> <P1-ref> <P2-ref> <P3-ref> <P4-ref> <P5-ref>`
- Open the launch workbook:
  - `APC_Calm_Companion_Release/outputs/01a064b3-f9fd-7e61-ac4c-f94c0971ce40/APC_Calm_Companion_Public_Launch_Test_Record.xlsx`

## 1) Phase 2 device and accessibility gate

Use one iPhone session and one Android session only.

### iPhone session
- Run D01 to D06 and D14 in sequence in `operations/physical-device-accessibility-runbook.md`.
- Keep each row as `Pass`, `Fail`, or `Not run`.
- If anything fails, set `Retest required` and repeat that same row immediately.

### Android session
- Run D07 to D12 in sequence in `operations/physical-device-accessibility-runbook.md`.
- Keep each row as `Pass`, `Fail`, or `Not run`.
- If anything fails, set `Retest required` and repeat that same row immediately.

### Gate rule for Phase 2
- Do not mark Phase 2 complete until D01 to D14 are all `Pass`.
- A provisional or partial pass is not enough for production.
- Any security, safety, focus-trap, installation, privacy, timer, offline, or unreadable-text issue should stop promotion.

## 2) Phase 3 five-parent controlled beta

Follow `operations/parent-beta-facilitator-script.md` and `operations/beta-test-plan.md`.

1. Assign P1 to P5 and collect a reference from each one short session.
2. Export preview CSV before P1:
   - `npm run feedback:export:preview`
3. Complete all five participants.
4. Export preview CSV after P5:
   - `npm run feedback:export:preview`
5. Run:

```bash
npm run beta:verify <before-csv> <after-csv> P1ref P2ref P3ref P4ref P5ref
```

6. Record Phase 3 results in the launch workbook.
7. Record one clear decision: Continue, Revise once, or Stop.

## 3) Pre-promotion preflight

Before switching `main`:
- Confirm all Phase 2 rows are final pass.
- Confirm Phase 3 decision is Continue.
- Confirm `operations/independent-pre-publish-audit-2026-09-06.md` is up to date.
- Confirm the following docs are ready for audit:
  - `GATES.md`
  - `operations/public-launch-plan.md`
  - `README.md`
  - `operations/feedback-access-and-excel-export.md`

## 4) Production promotion sequence

From the project context:
- Fast-forward `main` to approved commit.
- Deploy to production and verify by URL:
  - `https://calm.autismpathwaysconsulting.com/`
- Confirm:
  - Security headers and fail-closed response on `/api/feedback`
  - Offline reopen still works as configured
  - Add-to-home-screen and install visuals still match
  - Reduced motion and core keyboard path still work
- Run one non-personal production feedback submission end-to-end:
  - Submit via the visible Feedback page
  - Confirm one production DB row and optional comment remains removable

## 5) Post-promotion closure

- Update:
  - `GATES.md` with exact evidence links
  - `operations/launch-readiness-log-2026-09-04.md` with final status and timestamps
- Re-run `npm run check` on branch after production deployment artifacts are confirmed.
- Do not start broad public promotion until all gates show Pass in order.

## Notes

- Keep all feedback and beta data in workbook form and CSV exports.
- Do not include child names, diagnoses, schools, dates, contact details, or private identifiers in any test notes.
- This checklist does not replace consent and safety requirements from the beta scripts.
