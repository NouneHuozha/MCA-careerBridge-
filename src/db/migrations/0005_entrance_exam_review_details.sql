ALTER TABLE entrance_exams
  ADD COLUMN IF NOT EXISTS required_subjects jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS minimum_academic_condition text,
  ADD COLUMN IF NOT EXISTS age_attempt_notes text,
  ADD COLUMN IF NOT EXISTS cycle_label varchar(80),
  ADD COLUMN IF NOT EXISTS correction_window varchar(160),
  ADD COLUMN IF NOT EXISTS result_date varchar(160),
  ADD COLUMN IF NOT EXISTS document_status jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS review_draft jsonb;
