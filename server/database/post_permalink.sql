ALTER TABLE t_user
  ADD COLUMN IF NOT EXISTS username varchar(5);

DO $$
DECLARE
  user_row record;
  candidate varchar(5);
BEGIN
  FOR user_row IN SELECT id FROM t_user WHERE username IS NULL LOOP
    LOOP
      candidate := substr(md5(random()::text || clock_timestamp()::text), 1, 5);
      EXIT WHEN NOT EXISTS (SELECT 1 FROM t_user WHERE username = candidate);
    END LOOP;
    UPDATE t_user SET username = candidate WHERE id = user_row.id;
  END LOOP;
END $$;

ALTER TABLE t_user
  ALTER COLUMN username SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS t_user_username_key
  ON t_user (username);

ALTER TABLE t_post
  ADD COLUMN IF NOT EXISTS uuid varchar(5);

ALTER TABLE t_post
  ALTER COLUMN uuid SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS t_post_uuid_key
  ON t_post (uuid);
