# Calm Companion accessibility audit

Audit date: 3 September 2026

Candidate: `605af9d`

Exact Cloudflare deployment: `https://cd5e5666.apc-calm-companion.pages.dev/`

Scope: automated browser audit, accessibility-tree inspection, and desktop keyboard checks. Physical VoiceOver and TalkBack checks remain separate release gates.

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Lighthouse accessibility | Pass, 100 | Lighthouse 13.0.3 using Microsoft Edge 152 on the exact deployment |
| Lighthouse best practices | Pass, 100 | Same audit run |
| Lighthouse performance | 95 | Same audit run; FCP 1.6 seconds, LCP 2.2 seconds, TBT 190 milliseconds, CLS 0.015, and no run warning |
| Automated accessibility failures | None | The final Lighthouse report contains no failing accessibility audit |
| Keyboard order | Pass | Skip link, emergency call, safety information, brand action, main navigation, profile, and action choices receive focus in logical order |
| Skip link | Pass | Activating Skip to main content places focus on `main#main-content` |
| Accessible button names | Pass after correction | The APC brand and profile buttons preserve their visible labels in the accessible name |
| Reduced-motion media path | Pass in browser emulation | The deployed candidate matches `prefers-reduced-motion: reduce`, reduces transitions and animations to 0.01 milliseconds, limits animations to one iteration, and uses automatic scrolling |
| Enlarged-text reflow | Pass after correction | On the exact deployment at 320 and 390 pixels with 200-percent text, Actions, Tools, More, and both installation dialogs have no page-level horizontal overflow or clipped visible text. The More section selector remains an intentional internal horizontal scroll region |

## Corrected issue

Description: Two buttons replaced their visible labels with different `aria-label` values.

Locations: APC header button and profile shortcut.

WCAG criterion: 2.5.3 Label in Name.

Severity before correction: Major. A speech-input user might say the visible label and fail to activate the control reliably.

Remediation: Removed the overriding `aria-label` values and added visually hidden action text inside each button. This keeps the visible words in the computed accessible name while still explaining the action.

Verification: Final deployment `cd5e5666` exposes names that retain the visible APC and profile labels. Lighthouse does not report `label-content-name-mismatch`.

Description: The word “Communication” and its summary forced the Tools page wider than the viewport at 320 pixels with 200-percent text.

WCAG criteria: 1.4.4 Resize Text and 1.4.10 Reflow.

Severity before correction: Major. A user relying on enlarged text could encounter horizontal page scrolling and lose the relationship between the tool label and its control.

Remediation: Allowed the tool-label grid item to shrink and long labels and summaries to wrap when necessary.

Verification: Headless Edge 152 checks of the exact final deployment at 320 and 390 pixels with a 200-percent root text size report matching document and viewport widths and no clipped visible text. Both platform installation dialogs remain within the viewport. Physical increased-text checks remain required.

## Remaining human verification

- VoiceOver on a physical iPhone.
- TalkBack on a physical Android phone.
- Default and increased text sizes on both platforms.
- Reduced motion on physical devices.
- Add to Home Screen and offline reopening on both platforms.
- Feedback success and reference-copy experience with assistive technology.

Automated results support the controlled beta. They do not replace physical assistive-technology testing or testing with disabled users.
