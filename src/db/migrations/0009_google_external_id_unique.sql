CREATE UNIQUE INDEX IF NOT EXISTS users_external_id_unique_idx
  ON users (external_id);
