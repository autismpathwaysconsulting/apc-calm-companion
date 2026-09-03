# Owner feedback access and Excel export

Calm Companion feedback is stored in the private Cloudflare D1 database named `apc-calm-feedback-production`. It is not emailed, published, or stored in the public website files.

## Easiest review method

The release folder also contains `Feedback Access - START HERE.txt` for a short saveable copy of these instructions and `Open Cloudflare Feedback Database.webloc` for direct dashboard access.

1. Double-click `Export Calm Companion Feedback.command` in the `APC_Calm_Companion_Release` folder.
2. If Cloudflare asks you to sign in, use the APC Cloudflare account and approve the official Wrangler connection.
3. The export opens the `Feedback_Exports` folder when it finishes.
4. Open the newest `APC_Calm_Companion_Feedback_*.csv` file in Microsoft Excel.

The export is timestamped and does not overwrite an earlier file. It includes the reference, usefulness answer, improvement category, optional comment, app version, submission date, review state, and review date. CSV is used because Excel opens it directly and Cloudflare can export it without placing spreadsheet credentials in the public app.

Treat exports as restricted files. Optional comments may contain private information even though the form asks users not to include it. Delete old exports when they are no longer needed and continue the 90-day comment review described in `feedback-retention.md`.

## Check directly in Cloudflare

In the Cloudflare dashboard, open the APC account, then Storage and databases, D1 SQL Database, and `apc-calm-feedback-production`. In its console, run:

```sql
SELECT reference, helpfulness, category, comment, app_version,
       created_at, review_state, reviewed_at
FROM feedback
ORDER BY datetime(created_at) DESC;
```

The website must not expose a public feedback-download page. Owner access stays behind the Cloudflare account login.
