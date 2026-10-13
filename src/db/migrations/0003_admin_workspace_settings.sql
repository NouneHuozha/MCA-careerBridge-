CREATE TABLE IF NOT EXISTS admin_workspace_settings (
  setting_key varchar(80) PRIMARY KEY,
  setting_value jsonb NOT NULL,
  updated_by integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_workspace_settings_updated_at_idx
  ON admin_workspace_settings (updated_at DESC);
