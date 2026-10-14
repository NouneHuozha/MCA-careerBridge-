# Database migrations

These SQL files are **manual supplemental migrations**. The repository does not currently define an automatic runner or a migration journal for this folder. Apply them only after the baseline CareerBridge schema exists, and record which scripts were applied to each database.

The numeric prefixes are labels, not unique migration IDs: there are two independent `0002` scripts and two independent `0005` scripts. Do not infer that one supersedes the other, and do not rename files that may already have been applied in a deployed database. Use this explicit filename order when setting up a database that needs all of these changes:

1. `0001_source_refresh_settings.sql`
2. `0002_catalogue_change_proposals.sql`
3. `0002_scholarships_cycle_label.sql`
4. `0003_feedback_flag_review.sql`
5. `0004_admin_workspace_settings.sql`
6. `0005_admission_information_editor.sql`
7. `0005_entrance_exam_review_details.sql`
8. `0006_scholarship_detail_review.sql`
9. `0007_source_conflict_resolution.sql`

Before applying to production, take a database backup and verify the target schema and applied-migration record. For future migrations, use a unique, monotonically increasing identifier and add the filename to this list; adopting an automated migration runner should include a one-time reconciliation of already-applied SQL.
