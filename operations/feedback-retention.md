# Feedback retention runbook

Owner: APC Founder

Frequency: first working day of each month

Purpose: remove optional free-text comments older than 90 days during the monthly review while retaining the structured usefulness result for product analysis.

## Monthly procedure

1. Sign in to the Cloudflare account with multi-factor authentication.
2. Open the production `FEEDBACK_DB` database. Confirm that the production database, not preview, is selected.
3. Record the number of comments due for removal:

   ```sql
   SELECT COUNT(*) AS comments_due
   FROM feedback
   WHERE comment IS NOT NULL
     AND datetime(created_at) < datetime('now', '-90 days');
   ```

4. Remove the comment text:

   ```sql
   UPDATE feedback
   SET comment = NULL,
       review_status = 'removed'
   WHERE comment IS NOT NULL
     AND datetime(created_at) < datetime('now', '-90 days');
   ```

5. Verify that no overdue comments remain:

   ```sql
   SELECT COUNT(*) AS overdue_comments
   FROM feedback
   WHERE comment IS NOT NULL
     AND datetime(created_at) < datetime('now', '-90 days');
   ```

6. Save the date, `comments_due` result, `overdue_comments` result and operator name in APC's restricted compliance record. Do not export comment text for this evidence.

## Reference-based removal request

When a user provides a valid submission reference, confirm the exact row before changing it:

```sql
SELECT id, created_at, review_status
FROM feedback
WHERE id = ?;
```

Then remove the optional comment without exposing it:

```sql
UPDATE feedback
SET comment = NULL,
    review_status = 'removed'
WHERE id = ?;
```

Record the date, reference and completion status in the restricted compliance record. Do not include the removed comment.
