# Calm Companion physical-device and accessibility runbook

Use this runbook with the `Device Checks` sheet in `APC_Calm_Companion_Public_Launch_Test_Record.xlsx`.

Candidate: `605af9d`

Participant and device URL: `https://codex-commercial-redesign.apc-calm-companion.pages.dev/`

Do not use the immutable deployment URL for feedback. The feedback endpoint is intentionally restricted to the stable participant hostname.

## Before each device run

1. Record only a general device model, operating-system version, browser version, date, and tester. Do not record child or family information.
2. Start online in a normal browser tab. Do not use Private Browsing or Incognito because installation and offline storage may be unavailable or temporary.
3. Open the candidate URL and complete one online visit to Actions, Tools, More, Safety, Install, and Feedback.
4. Record `Pass`, `Fail`, or `Not run` for the matching D01 to D14 row. Add the shortest reproducible observation. Use `Retest required` after any failure.
5. Stop promotion for any missing control, trapped focus, unreadable content, incorrect timer, failed offline reopen, privacy failure, or unsafe interpretation.

## Consolidated execution

Keep D01 to D14 as separate evidence rows, but complete them in two coordinated phone sessions:

1. Run D01 to D06 and D14 in one iPhone session. Change settings as directed between checks and record each result separately.
2. Run D07 to D12 in one Android session. Change settings as directed between checks and record each result separately.
3. Keep D13 as the existing desktop result unless the app code, focus behaviour or navigation changes.

A provisional result supports workflow continuity only. It is not a pass and does not permit production promotion.

## iPhone Safari, D01 to D06

### Default text, D01

1. Open Actions, every action detail, Tools, every tool, More, Safety, Feedback, and Install.
2. Confirm every visible control can be tapped, the bottom navigation stays available, and no text overlaps or is cut off.
3. Rotate once to landscape and back. Confirm the current route and entered tool values remain understandable.

### Increased text, D02

1. In iPhone Settings, open Accessibility, Display & Text Size, Larger Text.
2. Turn on Larger Accessibility Sizes and move the slider to its largest setting.
3. Repeat Actions, Tools, More, Feedback, and both installation-instruction paths.
4. Pass only if text remains readable, controls remain usable, and the page does not require horizontal page scrolling.

Apple reference: `https://support.apple.com/guide/iphone/make-text-easier-to-read-iph3c076905a/ios`

### Add to Home Screen and offline reopen, D03 and D04

1. Return text size to the tester's usual setting.
2. In Safari, open More, Install, See pictures, and compare the iPhone pictures with the actual controls.
3. Use Safari Share, Add to Home Screen, turn on Open as Web App if offered, then tap Add.
4. Open Calm Companion from its Home Screen icon while online. Confirm the APC icon, title, Actions, Tools, and More.
5. Close the installed app, enable Airplane Mode, reopen it, and open Tools.
6. Pass D03 only if the visual guide matches the actual installation path and the icon opens the app. Pass D04 only if the installed app reopens and core tools remain usable offline.

Apple reference: `https://support.apple.com/guide/iphone/turn-a-website-into-an-app-iphea86e5236/ios`

### Timer background and return, D05

1. Set the timer to one minute and tap Start.
2. Note the displayed time, leave the app for about ten seconds, then return.
3. Pass only if the elapsed time is reflected accurately, Pause works, and Reset returns to 1:00.

### VoiceOver, D06

1. Turn on VoiceOver in Settings, Accessibility, VoiceOver. A tester unfamiliar with VoiceOver should complete Apple's tutorial first.
2. Starting at Actions, swipe right through the page. Confirm the heading, emergency link, navigation, profile shortcut, and each action are announced in a useful order.
3. Open one action detail. Confirm focus reaches its heading and Back to all actions is understandable.
4. Open First-Then, enter two short items, and confirm labels and the resulting visual content are announced.
5. Open Install, activate See pictures, switch to Android and back, close the dialog, and confirm focus returns to See pictures.
6. Open Feedback, select Yes, choose a category, complete the security check, and submit a short response without personal information.
7. Confirm the success message, reference, Copy reference button, and copied confirmation are announced.
8. Pass only if no focus is lost or trapped and names, roles, values, errors, route changes, and success states are understandable without looking at the screen.

Apple reference: `https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios`

## Android Chrome, D07 to D12

Android setting names can vary by manufacturer and version. Record any difference in the observation column.

### Default text, D07

Repeat the D01 route and control check in Chrome. Rotate once to landscape and back.

### Increased text, D08

1. In Android Settings, search for Font size and set it to 200% or the largest available value.
2. Search for Display size and increase it one step if the device provides that setting.
3. In Chrome Settings, Accessibility, set Default zoom to 200% if available.
4. Repeat Actions, Tools, More, Feedback, and both installation-instruction paths.
5. Pass only if text remains readable, controls remain usable, and the page does not require horizontal page scrolling.

Google references: `https://support.google.com/accessibility/answer/11183305?hl=en` and `https://support.google.com/accessibility/answer/96810?co=GENIE.Platform%3DAndroid&hl=en`

### Add to Home Screen and offline reopen, D09 and D10

1. Return text and zoom to the tester's usual settings.
2. In Chrome, open More, Install, See pictures, and compare the Android pictures with the actual controls.
3. In Chrome's menu, choose Install and create shortcut or Add to Home screen, then complete the offered installation path.
4. Open Calm Companion from its Home Screen icon while online. Confirm the APC icon, title, Actions, Tools, and More.
5. Close the installed app, enable Airplane Mode, reopen it, and open Tools.
6. Apply the same pass rules as D03 and D04.

Google reference: `https://support.google.com/chrome/answer/15085120?co=GENIE.Platform%3DAndroid&hl=en`

### Timer background and return, D11

Repeat the D05 one-minute timer procedure.

### TalkBack, D12

1. Turn on TalkBack using the device's Accessibility settings. A tester unfamiliar with TalkBack should complete its tutorial first.
2. Swipe right to move through each control and double-tap to activate it.
3. Repeat the same route, First-Then, installation-dialog, and feedback-success tasks listed for VoiceOver.
4. Pass only if no focus is lost or trapped and names, roles, values, errors, route changes, and success states are understandable without looking at the screen.

Google references: `https://support.google.com/accessibility/android/answer/6283677?hl=en` and `https://support.google.com/accessibility/android/answer/6006598?hl=en`

## Desktop keyboard and reduced motion, D13 and D14

D13 already has automated browser evidence. For one human confirmation, use only Tab, Shift+Tab, Enter, Space, arrow keys, and Escape. Confirm visible focus, the skip link, every main navigation destination, one action, every tool, the installation dialog, and Feedback.

D14 already has browser-emulation evidence. On at least one physical phone, enable the operating system's reduced-motion or remove-animations setting and repeat navigation, the installation dialog, and Timer. Pass only if no unnecessary motion remains and every state change is still understandable.

## Evidence and decision

- Record failures with the shortest exact path, expected result, actual result, and whether the failure repeats.
- Do not include screenshots containing notifications, account names, contacts, or child information.
- Any failed row remains failed until the same device and setting pass a retest.
- The device gate passes only when D01 to D14 are all `Pass` and no material concern remains.
- After the device gate passes, complete P1 to P5 using `beta-test-plan.md`. Production promotion remains prohibited until both gates pass.
