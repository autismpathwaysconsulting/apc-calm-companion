# Calm Companion PWA and offline audit

Audit date: 3 September 2026

Candidate: `605af9d`

Exact Cloudflare deployment: `https://cd5e5666.apc-calm-companion.pages.dev/`

Browser: Microsoft Edge 152 in a clean automated context at 390 by 844.

## Procedure

1. Open the exact deployment online and wait for network activity to settle.
2. Wait for the Calm Companion service worker to activate.
3. Reload once online so the page is controlled by the worker.
4. Inspect the current `apc-calm-*` cache.
5. Disconnect the browser context from the network.
6. Confirm that an uncached external page fails.
7. Reload Calm Companion and navigate from Actions to Tools.

## Result

| Check | Result |
| --- | --- |
| Service worker active | Pass, state `activated` |
| Page controlled on revisit | Pass |
| Current versioned cache | Pass, one `apc-calm-*` cache |
| Core HTML, JavaScript and CSS cached | Pass |
| Fonts, manifest, app icons and installation visuals cached | Pass |
| Uncached external page while disconnected | Failed as required |
| Calm Companion offline reload | Pass, HTTP 200 |
| Offline route interaction | Pass, Tools opened and displayed “Choose a visual tool” |
| Mobile horizontal overflow | Pass, none at 390 by 844 |

Edge continued to expose `navigator.onLine` as true under automation, so that browser flag was not used as proof of connectivity. The evidence instead compares a failed uncached external navigation with a successful same-context Calm Companion reload and interaction.

## Remaining human verification

- Add to Home Screen and offline reopening in iPhone Safari.
- Add to Home Screen and offline reopening in Android Chrome.
- Timer background and return on both physical platforms.

This browser-level result proves that the deployed service worker can support offline reopening. It does not prove physical mobile installation behaviour.
