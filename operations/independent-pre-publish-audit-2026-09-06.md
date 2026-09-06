# Independent pre-publish audit record

Date: 6 September 2026

Reviewer scope: confirm whether we can publish `codex/commercial-redesign` candidate `605af9d` to public users safely.

## Executive summary

- The technical evidence for candidate `605af9d` is strong and reproducible in local artifacts.
- Technical readiness to begin the controlled beta is complete. Six of ten public-release gates are closed; the four remaining gates are intentionally human or post-promotion checks. Public-launch status is therefore **Hold**, not failed.
- The following gates remain incomplete and must be completed in the real environment before any public-domain promotion:
  - Device and accessibility physical verification (D01–D14),
  - Five-parent beta evidence and final gate decision (Phase 3),
  - Production-domain post-promotion validation.

## Gate-by-gate evidence

| Requirement | Evidence source | Status | Why |
| --- | --- | --- | --- |
| Isolated preview published | `GATES.md`, Cloudflare deployment list and live HTTP checks on 6 September 2026 | **Pass (live)** | Cloudflare reports the branch deployment from source `387c362`; the stable preview, manifest and service worker return HTTP 200 with restrictive headers. Production remains separately deployed from `e5d76c2`. |
| Automated release quality | `npm run check` (2026-09-06 run) | **Pass (local)** | `npm run check` completed with 56 passing tests, build passes, release + build verification pass. |
| Fail-closed endpoint posture | `tests/security` + API validation coverage in unit suite | **Pass (local verification evidence)** | Tests validate missing secrets, missing/invalid origin/token, invalid methods/content types, and fail-safe behavior. |
| Controlled beta feedback removal workflow | `feedback-access-and-excel-export.md`, `operations/public-launch-plan.md`, unit tests and live exports | **Pass (live)** | Separate preview and production exports completed successfully on 6 September 2026. The preview submission, reference matching and removal path were already demonstrated without exposing comments publicly. |
| Production config separation | `GATES.md`, Cloudflare deployment list, live exports and endpoint checks | **Pass (live)** | Preview and production remain separate deployments and databases. Both protected endpoints reject GET with HTTP 405, and the production binding, origin, Turnstile and rate-rule evidence is recorded in `GATES.md`. |
| Five-parent beta test | `operations/parent-beta-facilitator-script.md`, `operations/beta-test-plan.md` | **Pending** | No recorded P1–P5 table entries yet in this environment. |
| Physical iOS/Android + AT checks | `operations/physical-device-accessibility-runbook.md`, launch workbook | **Pending** | D01–D14 are still marked provisional in the readiness log. |
| Production promotion and rollback-safe post-check | `operations/public-launch-plan.md` | **Pending** | Promotion action must wait for Phase 2 and 3 pass. |

## Immediate next-step sequence (in order)

1. Complete Phase 2: one consolidated iPhone session for D01–D06 and D14, one consolidated Android session for D07–D12.
2. Complete Phase 3: recruit P1–P5, collect references and export feedback before/after with `Export Calm Companion Beta Feedback.command`.
3. Run:

   `npm run beta:verify <before-csv> <after-csv> <P1-ref> <P2-ref> <P3-ref> <P4-ref> <P5-ref>`

4. Record Continue/Revise/Stop decision in launch records.
5. If all criteria pass: execute production promotion sequence in `operations/public-launch-plan.md`, then submit one controlled non-personal production test feedback and verify production D1 insertion/removal workflow.
