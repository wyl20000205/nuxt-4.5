CREATE TABLE IF NOT EXISTS t_comment (
  id bigserial PRIMARY KEY,
  post_id integer NOT NULL REFERENCES t_post(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES t_user(id) ON DELETE CASCADE,
  parent_id bigint REFERENCES t_comment(id) ON DELETE CASCADE,
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 1000),
  time timestamptz NOT NULL DEFAULT now(),
  active smallint NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE INDEX IF NOT EXISTS t_comment_post_time_idx
  ON t_comment (post_id, time)
  WHERE active = 1;
