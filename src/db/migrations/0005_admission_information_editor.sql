ALTER TABLE admission_information
  ADD COLUMN IF NOT EXISTS document_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS application_start_date varchar(10),
  ADD COLUMN IF NOT EXISTS application_end_date varchar(10),
  ADD COLUMN IF NOT EXISTS application_window_status varchar(24) NOT NULL DEFAULT 'not_confirmed',
  ADD COLUMN IF NOT EXISTS application_fee_note text,
  ADD COLUMN IF NOT EXISTS course_fee_note text,
  ADD COLUMN IF NOT EXISTS source_title varchar(200),
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz;

CREATE TABLE IF NOT EXISTS admission_information_drafts (
  id serial PRIMARY KEY,
  admission_id integer,
  institution_code varchar(64) NOT NULL,
  payload jsonb NOT NULL,
  review_note text,
  saved_by varchar(191),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS admission_drafts_record_idx
  ON admission_information_drafts (admission_id);
CREATE INDEX IF NOT EXISTS admission_drafts_institution_idx
  ON admission_information_drafts (institution_code);
