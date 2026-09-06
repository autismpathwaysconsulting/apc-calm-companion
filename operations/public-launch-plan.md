# Calm Companion public launch plan

Status date: 6 September 2026

Interface candidate: `605af9d` (last commit that changes the shipped interface)

Launch operations branch: `codex/commercial-redesign`, published to GitHub. Commits after `605af9d` change launch records or verification tooling only and do not create a new interface candidate.

Candidate preview: `https://codex-commercial-redesign.apc-calm-companion.pages.dev/`

Exact interface-verified deployment: `https://cd5e5666.apc-calm-companion.pages.dev/`

Use the stable branch-preview URL for participant sessions. Feedback is intentionally restricted to that hostname.  
For live execution, also use `operations/launch-operator-checklist-2026-09-06.md`.

Public launch means a limited organic release of the free web app. Paid printable sales and broad promotion remain separate decisions.

## Phase 1: technical candidate

- [x] Publish the reviewed branch to GitHub.
- [x] Complete Cloudflare branch deployment.
- [x] Pass lint, 56 automated tests, production build, release verification, and offline-cache verification.
- [x] Run the Excel export query against the actual D1 migration schema.
- [x] Complete a production D1 read without exposing feedback publicly.
- [x] Verify 390 by 844 layout, fixed bottom navigation, install-guide dialog, focus return, two-letter initials, and absence of browser errors.
- [x] Pass a Lighthouse audit with 100 accessibility, 100 best practices, and 95 performance on the exact deployment.
- [x] Verify logical keyboard order, the skip link, and visible-text inclusion in accessible button names.
- [x] Verify an activated service worker, complete runtime cache, offline HTTP 200 reopening, offline Tools navigation, and no horizontal overflow at 390 by 844 while an uncached external page fails.
- [x] Verify the deployed reduced-motion media path uses near-zero transitions and animations, one animation iteration, and automatic scrolling.
- [x] Verify the deployed one-minute timer advances by the elapsed deadline after a 3.2-second browser background interval, then pauses and resets correctly.
- [x] Correct the Tools-menu overflow found at 320 pixels with 200-percent text and verify Actions, Tools, and More reflow without page overflow or clipped text.
- [x] Verify the final deployed build at 320 and 390 pixels with 200-percent text, including both visual installation dialogs.
- [x] Pass a 12-check black-box audit of all action routes, all five tools, two-letter initials, feedback draft persistence, install-dialog focus return, and browser Back with no page or console error.
- [x] Submit one non-personal response through the visible Feedback journey, confirm HTTP 201 and one matching private preview-D1 row, then remove only that synthetic row and confirm zero matches remain.
- [x] Confirm the feedback endpoint rejects GET, foreign origins, wrong content types, missing security tokens, and the immutable deployment hostname.
- [x] Create and verify separate private production and controlled-beta feedback exports.
- [x] Add a private beta record with P1 to P5 feedback-reference matching and formula-driven pass criteria.

## Phase 2: physical device and accessibility gate

Record device, browser, result, defect, and retest status without collecting child information.

Follow `physical-device-accessibility-runbook.md` and record D01 to D14 in the launch workbook.

Keep all fourteen evidence rows, but execute them as one consolidated iPhone session and one consolidated Android session. A provisional row does not count as a pass.

- [ ] iPhone Safari at default and increased text size.
- [ ] Android Chrome at default and increased text size.
- [ ] Add to Home Screen on both platforms.
- [ ] Reopen offline after one complete online visit on both platforms.
- [ ] Background and return while the timer is running.
- [ ] VoiceOver route, dialog, tool, and feedback-success checks.
- [ ] TalkBack route, dialog, tool, and feedback-success checks.
- [x] Desktop keyboard-only flow and visible-focus check.
- [ ] Reduced motion on at least one physical device.

Any safety, privacy, blocking accessibility, installation, offline, or data-loss defect returns the candidate to revision.

## Phase 3: five-parent controlled beta

- [ ] Recruit five voluntary adult parents or caregivers.
- [ ] Use participant codes P1 to P5 only.
- [ ] Run every task in `beta-test-plan.md` without teaching the interface first.
- [ ] Confirm every safety criterion and the four-of-five independent-use criteria.
- [ ] Check that each feedback submission creates one reference and one database row.
- [ ] Export preview feedback with `Export Calm Companion Beta Feedback.command` and match each recorded reference without copying optional comments.
- [ ] Record one Continue, Revise once, or Stop decision.

The beta evaluates usability and safety. It is not evidence that the app calms children or improves clinical outcomes.

Use the launch workbook as the operational source of truth. Export the preview database once immediately before P1 and once after P5. Perform additional exports only after a failed or uncertain submission.

## Phase 4: production promotion

Complete only after Phases 2 and 3 pass.

- [ ] Fast-forward `main` to the exact approved candidate commit.
- [ ] Confirm Cloudflare reports a successful production deployment from that commit.
- [ ] Check the custom domain on desktop, iPhone, and Android.
- [ ] Confirm security headers, privacy and terms links, PWA assets, offline reopening, and `/api/feedback` fail-closed behaviour.
- [ ] Confirm the production database receives only the controlled post-promotion validation submission. P1 to P5 remain in the preview database.
- [ ] Update `GATES.md` and the release report with exact evidence.

Run the automated release suite once immediately before promotion. Repeat earlier Lighthouse, black-box, reflow, offline-emulation or accessibility audits only if app code, dependencies, build settings or Cloudflare configuration changed after the verified candidate.

The P1 to P5 rows remain in the preview database and must not be migrated into production. After promotion, use one controlled non-personal production submission to confirm the production reference and D1 row, then remove its optional test comment according to the established procedure.

## Phase 5: limited organic public release

- [ ] Announce through APC-owned channels using general educational, non-emergency language.
- [ ] Link directly to `https://calm.autismpathwaysconsulting.com/`.
- [ ] Review feedback daily for the first seven days, then monthly.
- [ ] Remove optional comment text according to the 90-day retention procedure.
- [ ] Pause promotion if feedback identifies a safety, privacy, accessibility, or material comprehension problem.

Do not claim that the app will calm every child, prevent meltdowns, identify causes, replace individual support, or provide emergency help.
