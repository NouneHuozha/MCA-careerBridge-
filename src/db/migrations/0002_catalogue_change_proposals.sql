CREATE TABLE IF NOT EXISTS catalogue_change_proposals (
  id serial PRIMARY KEY,
  entity_type varchar(40) NOT NULL,
  entity_ref varchar(120) NOT NULL,
  entity_name varchar(180) NOT NULL,
  field_name varchar(100) NOT NULL,
  current_value text,
  proposed_value text NOT NULL,
  approved_value text,
  source_type varchar(80),
  source_url text,
  source_snapshot_url text,
  evidence_excerpt text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  status varchar(24) NOT NULL DEFAULT 'needs_review',
  review_note text,
  decision_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT catalogue_change_proposals_status_check
    CHECK (status IN ('needs_review', 'approved', 'kept_current', 'rejected'))
);
CREATE INDEX IF NOT EXISTS catalogue_change_proposals_status_fetched_idx
  ON catalogue_change_proposals (status, fetched_at DESC);
CREATE INDEX IF NOT EXISTS catalogue_change_proposals_entity_idx
  ON catalogue_change_proposals (entity_type, entity_ref, field_name);
