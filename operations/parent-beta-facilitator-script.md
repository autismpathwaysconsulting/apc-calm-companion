# Calm Companion parent beta facilitator script

Use this with `beta-test-plan.md` and the private launch-testing workbook.

## Before the participant joins

1. Assign the next code from P1 to P5.
2. Open the controlled beta link: `https://codex-commercial-redesign.apc-calm-companion.pages.dev/`.
3. Confirm the session is not being used for an emergency or immediate safety concern.
4. Keep the private launch-testing workbook open. Do not record names or identifiable child information.

## Opening script

“Thank you for helping test Calm Companion. We are testing the app, not you. Please say what you notice as you use it. I will not teach the interface unless you become completely stuck because we need to learn whether it works independently. You may stop at any time.

Please do not share names, diagnoses, schools, contact details, histories or private information about a child. Calm Companion is general educational parent support, not therapy, diagnosis, assessment, medical advice or emergency support.”

## Run the tasks

Read the ten tasks in `beta-test-plan.md` in order. Do not reword a task to lead the participant towards a control. Record only the allowed fields in the workbook.

If a participant describes immediate danger, serious injury or a medical emergency, stop the test and direct them away from the app. In Malaysia, call 999 for immediate danger or a medical emergency.

## Feedback submission

Ask the participant to submit one short app-focused response without personal information. Record the displayed reference in the Feedback reference column. Do not copy the optional comment into the workbook.

## Closing script

“Thank you. Your observations will be used to decide whether the app should continue, be revised or stop. This session does not show that the app changes a child's behaviour or produces a clinical outcome.”

## After all five sessions

1. Double-click `Export Calm Companion Beta Feedback.command`.
2. Open the newest `APC_Calm_Companion_Beta_Feedback_*.csv` file.
3. Match every recorded reference to exactly one preview-database row.
4. Record Yes or No in Exactly one database row.
5. Run the beta matcher from app:
   `npm run beta:verify <before-csv> <after-csv> <P1-ref> <P2-ref> <P3-ref> <P4-ref> <P5-ref>`
   You can paste a file name only or a full path. From the app folder, the script also looks in `Feedback_Exports` and `../Feedback_Exports` automatically.
6. Record Yes or No in Exactly one database row.
7. Do not copy optional comments into the launch-testing workbook.
8. Review the formula-driven decision on Launch Summary.
