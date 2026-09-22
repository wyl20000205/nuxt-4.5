ALTER TABLE t_user
  ADD COLUMN IF NOT EXISTS active smallint NOT NULL DEFAULT 1
  CHECK (active IN (0, 1));

ALTER TABLE t_post
  ADD COLUMN IF NOT EXISTS active smallint NOT NULL DEFAULT 1
  CHECK (active IN (0, 1));
