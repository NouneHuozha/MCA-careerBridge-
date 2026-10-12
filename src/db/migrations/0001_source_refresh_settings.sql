CREATE TABLE IF NOT EXISTS source_refresh_settings (
  source_key text PRIMARY KEY,
  refresh_enabled boolean NOT NULL DEFAULT false,
  refresh_frequency varchar(20) NOT NULL DEFAULT 'manual',
  fetch_method varchar(20) NOT NULL DEFAULT 'manual',
  updated_by varchar(191),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT source_refresh_settings_frequency_check
    CHECK (refresh_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'manual')),
  CONSTRAINT source_refresh_settings_method_check
    CHECK (fetch_method IN ('api', 'html', 'pdf', 'upload', 'manual'))
);
