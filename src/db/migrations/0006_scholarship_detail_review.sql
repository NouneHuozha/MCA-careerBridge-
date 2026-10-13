ALTER TABLE scholarships
  ADD COLUMN IF NOT EXISTS academic_conditions text,
  ADD COLUMN IF NOT EXISTS income_category_conditions text,
  ADD COLUMN IF NOT EXISTS residency_conditions text,
  ADD COLUMN IF NOT EXISTS other_conditions text,
  ADD COLUMN IF NOT EXISTS tuition_support text,
  ADD COLUMN IF NOT EXISTS maintenance_support text,
  ADD COLUMN IF NOT EXISTS renewal_note text,
  ADD COLUMN IF NOT EXISTS document_status jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_title varchar(180),
  ADD COLUMN IF NOT EXISTS source_retrieved_at timestamptz;

CREATE TABLE IF NOT EXISTS scholarship_review_drafts (
  id serial PRIMARY KEY,
  scholarship_slug varchar(64) NOT NULL UNIQUE,
  payload jsonb NOT NULL,
  saved_by varchar(191),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scholarship_review_drafts_updated_at_idx
  ON scholarship_review_drafts (updated_at DESC);
