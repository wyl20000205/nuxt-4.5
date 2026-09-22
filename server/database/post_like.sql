CREATE TABLE IF NOT EXISTS t_post_like (
  post_id integer NOT NULL REFERENCES t_post(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES t_user(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
