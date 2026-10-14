CREATE TABLE IF NOT EXISTS catalogue_source_conflicts (
  case_key varchar(120) PRIMARY KEY,
  entity_type varchar(40) NOT NULL,
  entity_ref varchar(120) NOT NULL,
  entity_name varchar(180) NOT NULL,
  field_name varchar(100) NOT NULL,
  current_approved_value text NOT NULL,
  resolved_value text,
  detected_at timestamptz NOT NULL DEFAULT now(),
  status varchar(32) NOT NULL DEFAULT 'needs_decision',
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_sample boolean NOT NULL DEFAULT false,
  review_note text,
  reviewed_by varchar(191),
  reviewed_at timestamptz,
  decision_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS catalogue_source_conflicts_status_idx
  ON catalogue_source_conflicts (status);
CREATE INDEX IF NOT EXISTS catalogue_source_conflicts_detected_idx
  ON catalogue_source_conflicts (detected_at DESC);

-- Synthetic UI sample from the Screen 21 design brief; never updates catalogue data.
INSERT INTO catalogue_source_conflicts (
  case_key, entity_type, entity_ref, entity_name, field_name,
  current_approved_value, detected_at, status, sources, is_sample
) VALUES (
  'sample-bca-modern-college',
  'institution_course',
  'sample-only',
  'Bachelor of Computer Applications at Modern College, Kohima',
  'Availability',
  'offered',
  '2026-10-13T00:00:00+00:00'::timestamptz,
  'needs_decision',
  '[
    {"sourceTitle":"Official institution website","sourceType":"Official site","checkedAt":"2026-10-13T00:00:00.000Z","valueFound":"not_listed","evidenceExcerpt":"No current course listing appears in this sample excerpt. A missing listing is not proof that the course is not offered.","authorityLevel":"primary","sourceUrl":null,"sourceReference":null},
    {"sourceTitle":"Uploaded workbook","sourceType":"Excel import","checkedAt":"2026-10-12T00:00:00.000Z","valueFound":"offered","evidenceExcerpt":"The synthetic workbook example records BCA as offered; the source file itself is not attached.","authorityLevel":"internal","sourceUrl":null,"sourceReference":"Sample import · row 9"},
    {"sourceTitle":"Older directory","sourceType":"Secondary reference","checkedAt":"2026-08-03T00:00:00.000Z","valueFound":"offered","evidenceExcerpt":"The synthetic legacy-directory example says offered; it is older and secondary evidence.","authorityLevel":"secondary","sourceUrl":null,"sourceReference":null}
  ]'::jsonb,
  true
) ON CONFLICT (case_key) DO NOTHING;
