# Calm Companion five-parent beta test

## Purpose

Check whether parents can use Calm Companion quickly and safely during ordinary difficult moments. This is a usability test, not evidence that the app calms children or improves clinical outcomes.

## Participants

Invite five adult parents or caregivers with experience supporting an autistic or neurodivergent child. Participation must be voluntary and must not affect access to APC services.

Do not collect the child's name, diagnosis, school, medical history, behaviour records, or identifying details. Record participants only as P1 to P5.

Do not recruit anyone currently seeking emergency or crisis support.

## Device coverage

Across the five participants, include:

- at least two iPhones using Safari;
- at least two Android phones using Chrome;
- one desktop or laptop browser;
- one participant who uses larger text, keyboard navigation, or a screen reader if reasonably available.

## Test sequence

Give the participant the preview link without teaching the interface first. Ask them to think aloud.

1. **Ordinary transition:** "It is time to leave, but your child has not moved after several reminders. Nothing is unsafe." Ask the parent to choose one action.
2. **Verbal overload:** "You notice that you are adding more words and repeating yourself." Ask the parent to find a useful response.
3. **First-Then:** Ask the parent to create `Shoes on` then `Go to the car`.
4. **Choices:** Ask the parent to offer two manageable choices.
5. **Timer:** Set one minute, start it, place the app in the background briefly, return, pause, and reset.
6. **Communication:** Ask the parent to find and play or display `I need a break.`
7. **Safety exclusion A:** "A child has run towards moving traffic." Ask whether the app should be used.
8. **Safety exclusion B:** "A child is seriously injured and struggling to breathe." Ask what the parent should do.
9. **Privacy:** Ask what happens to words entered into the tools and where submitted feedback goes.
10. **Feedback:** Submit one short test response without personal information and note the submission reference.

Before the first session, export `apc-calm-feedback-preview` and record the existing row count without copying comment text. After all five sessions, double-click `Export Calm Companion Beta Feedback.command`. Match each P1 to P5 reference to exactly one new preview-database row.

### Condensed facilitation format

Run the ten tasks as five blocks without removing or teaching any task:

1. Choose an action for the ordinary-transition and verbal-overload scenarios.
2. Complete First-Then, Choices, Timer and Communication.
3. Reject app use in both emergency scenarios.
4. Explain the app boundaries, tool-entry privacy and feedback destination.
5. Submit feedback and record the displayed reference.

Use one preview export immediately before P1 and one after P5. Export between participants only when a submission fails or the displayed reference is unavailable.

For reconciliation, match every recorded reference exactly. Each must occur once, the final row-count increase must be five, the submission time must fit the session, and the app version must be `1.0.0-beta.1`. Do not use the total row count as the only evidence.

## Record for each participant

| Measure | Allowed entry |
| --- | --- |
| Participant | P1 to P5 |
| Device and browser | General model/browser only |
| First sensible action selected independently | Yes / No |
| Four core tools completed independently | 0 to 4 |
| Both emergency scenarios rejected | Yes / No |
| Correctly explains tool-entry privacy | Yes / No |
| Correctly explains feedback destination | Yes / No |
| Feedback submission completed | Yes / No |
| Feedback reference | Reference only |
| Exactly one matching preview row | Yes / No |
| Ease rating | 1 very difficult to 5 very easy |
| One confusing point | Short note without child information |
| One useful point | Short note without child information |

## Pass criteria

Continue to a limited release only if:

- all five parents reject app use in both emergency scenarios;
- all five understand that the app is general support, not therapy, diagnosis, assessment, medical advice, or a guaranteed calming tool;
- at least four of five select a sensible first action without coaching;
- at least four of five complete every core tool path without coaching;
- at least four of five correctly explain that tool entries are not saved or sent;
- at least four of five correctly explain that feedback goes to APC's Cloudflare database;
- all five feedback submissions produce one reference and one database row only;
- the median ease rating is at least 4 out of 5;
- no material safeguarding, privacy, accessibility, or communication concern appears.

## Decision

- **Continue:** every pass criterion is met.
- **Revise once:** the problem is limited to wording, hierarchy, focus, spacing, or one contained technical defect.
- **Stop:** any participant treats the app as emergency guidance, the app encourages forced compliance or unsupported intervention, a privacy failure occurs, or useful operation requires training or major expansion.

Do not use five-parent results as proof of market demand or outcome effectiveness.
