# Calm Companion public launch plan

Status date: 3 September 2026

Release candidate: `c7526ea`

Candidate preview: `https://codex-commercial-redesign.apc-calm-companion.pages.dev/`

Public launch means a limited organic release of the free web app. Paid printable sales and broad promotion remain separate decisions.

## Phase 1: technical candidate

- [x] Publish the reviewed branch to GitHub.
- [x] Complete Cloudflare branch deployment.
- [x] Pass lint, 54 automated tests, production build, release verification, and offline-cache verification.
- [x] Run the Excel export query against the actual D1 migration schema.
- [x] Complete a production D1 read without exposing feedback publicly.
- [x] Verify 390 by 844 layout, fixed bottom navigation, install-guide dialog, focus return, two-letter initials, and absence of browser errors.
- [x] Pass a Lighthouse audit with 100 accessibility, 100 best practices, and 94 performance on the exact deployment.
- [x] Verify logical keyboard order, the skip link, and visible-text inclusion in accessible button names.

## Phase 2: physical device and accessibility gate

Record device, browser, result, defect, and retest status without collecting child information.

- [ ] iPhone Safari at default and increased text size.
- [ ] Android Chrome at default and increased text size.
- [ ] Add to Home Screen on both platforms.
- [ ] Reopen offline after one complete online visit on both platforms.
- [ ] Background and return while the timer is running.
- [ ] VoiceOver route, dialog, tool, and feedback-success checks.
- [ ] TalkBack route, dialog, tool, and feedback-success checks.
- [ ] Desktop keyboard-only flow and visible-focus check.
- [ ] Reduced-motion check.

Any safety, privacy, blocking accessibility, installation, offline, or data-loss defect returns the candidate to revision.

## Phase 3: five-parent controlled beta

- [ ] Recruit five voluntary adult parents or caregivers.
- [ ] Use participant codes P1 to P5 only.
- [ ] Run every task in `beta-test-plan.md` without teaching the interface first.
- [ ] Confirm every safety criterion and the four-of-five independent-use criteria.
- [ ] Check that each feedback submission creates one reference and one database row.
- [ ] Record one Continue, Revise once, or Stop decision.

The beta evaluates usability and safety. It is not evidence that the app calms children or improves clinical outcomes.

## Phase 4: production promotion

Complete only after Phases 2 and 3 pass.

- [ ] Fast-forward `main` to the exact approved candidate commit.
- [ ] Confirm Cloudflare reports a successful production deployment from that commit.
- [ ] Check the custom domain on desktop, iPhone, and Android.
- [ ] Confirm security headers, privacy and terms links, PWA assets, offline reopening, and `/api/feedback` fail-closed behaviour.
- [ ] Confirm the production database receives only the intended beta submissions.
- [ ] Update `GATES.md` and the release report with exact evidence.

## Phase 5: limited organic public release

- [ ] Announce through APC-owned channels using general educational, non-emergency language.
- [ ] Link directly to `https://calm.autismpathwaysconsulting.com/`.
- [ ] Review feedback daily for the first seven days, then monthly.
- [ ] Remove optional comment text according to the 90-day retention procedure.
- [ ] Pause promotion if feedback identifies a safety, privacy, accessibility, or material comprehension problem.

Do not claim that the app will calm every child, prevent meltdowns, identify causes, replace individual support, or provide emergency help.
