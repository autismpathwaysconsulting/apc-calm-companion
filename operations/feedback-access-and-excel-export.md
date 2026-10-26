# Owner feedback access and Excel export

Calm Companion feedback is stored in the private Cloudflare D1 database named `apc-calm-feedback-production`. It is not emailed, published, or stored in the public website files.

## Easiest review method

The release folder also contains `Feedback Access - START HERE.txt` for a short saveable copy of these instructions and `Open Cloudflare Feedback Database.webloc` for direct access to the production database in Cloudflare Studio.

1. Double-click `Export Calm Companion Feedback.command` in the `APC_Calm_Companion_Release` folder.
2. If Cloudflare asks you to sign in, use the APC Cloudflare account and approve the official Wrangler connection.
3. The export opens the `Feedback_Exports` folder when it finishes.
4. Open the newest `APC_Calm_Companion_Feedback_*.csv` file in Microsoft Excel.

The export is timestamped and does not overwrite an earlier file. It includes the reference, usefulness answer, improvement category, optional comment, app version, submission date, and review status. CSV is used because Excel opens it directly and Cloudflare can export it without placing spreadsheet credentials in the public app.

Treat exports as restricted files. Optional comments may contain private information even though the form asks users not to include it. Delete old exports when they are no longer needed and continue the 90-day comment review described in `feedback-retention.md`.

## Check directly in Cloudflare

Double-click `Open Cloudflare Feedback Database.webloc`, sign in with the APC Cloudflare account, and click `feedback` in the left column. This opens the production database directly in Cloudflare Studio.

If Cloudflare changes the direct link, open the APC account in the dashboard, then Storage & databases, D1 SQLite Database, and `apc-calm-feedback-production`. Click Explore Data.

To review the newest submissions with selected fields, open Query in Studio and run:

```sql
SELECT id AS reference, helpfulness, category, comment, app_version,
       created_at, review_status
FROM feedback
ORDER BY datetime(created_at) DESC;
```

The website must not expose a public feedback-download page. Owner access stays behind the Cloudflare account login.

## Controlled-beta feedback

The branch preview stores feedback in the separate `apc-calm-feedback-preview` database. During the five-parent beta, double-click `Export Calm Companion Beta Feedback.command` in the release folder. It creates a timestamped `APC_Calm_Companion_Beta_Feedback_*.csv` file in `Feedback_Exports`. To inspect the preview database directly, double-click `Open Cloudflare Beta Feedback Database.webloc` and select `feedback` in Cloudflare Studio.

Match each P1 to P5 submission reference to exactly one preview-database row. Do not copy optional comment text into the test record. Record only the reference and whether exactly one matching row exists.
