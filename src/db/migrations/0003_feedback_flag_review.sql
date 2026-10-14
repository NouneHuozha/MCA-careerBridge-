CREATE TABLE IF NOT EXISTS feedback_flags (
  id serial PRIMARY KEY,
  user_id integer,
  entity_type varchar(60) NOT NULL,
  entity_ref varchar(120) NOT NULL,
  issue_type varchar(48) NOT NULL DEFAULT 'other',
  reason text NOT NULL,
  source_url text,
  status varchar(24) NOT NULL DEFAULT 'open',
  assigned_to varchar(191),
  resolution_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feedback_flags ADD COLUMN IF NOT EXISTS issue_type varchar(48) NOT NULL DEFAULT 'other';
ALTER TABLE feedback_flags ADD COLUMN IF NOT EXISTS source_url text;
ALTER TABLE feedback_flags ADD COLUMN IF NOT EXISTS assigned_to varchar(191);
ALTER TABLE feedback_flags ADD COLUMN IF NOT EXISTS resolution_reason text;
ALTER TABLE feedback_flags ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS feedback_flags_status_created_idx ON feedback_flags (status, created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_flags_entity_idx ON feedback_flags (entity_type, entity_ref);
