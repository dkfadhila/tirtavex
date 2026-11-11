CREATE TABLE IF NOT EXISTS schema_migrations (
  id text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY,
  data jsonb NOT NULL,
  CONSTRAINT site_settings_single CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS stats (
  id integer PRIMARY KEY,
  impressions_all double precision NOT NULL DEFAULT 0,
  impressions_30d double precision NOT NULL DEFAULT 0,
  likes double precision NOT NULL DEFAULT 0,
  posts double precision NOT NULL DEFAULT 0,
  followers double precision NOT NULL DEFAULT 0,
  best_post_id text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stats_single CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS agent_state (
  id integer PRIMARY KEY,
  last_heartbeat_at timestamptz,
  message text NOT NULL DEFAULT '',
  CONSTRAINT agent_state_single CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS work_items (
  id text PRIMARY KEY,
  x_url text NOT NULL UNIQUE,
  title text NOT NULL,
  note text NOT NULL DEFAULT '',
  category text NOT NULL,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  pinned boolean NOT NULL DEFAULT false,
  thumb_src text NOT NULL DEFAULT '',
  thumb_blurhash text NOT NULL DEFAULT '',
  thumb_dominant text NOT NULL DEFAULT '#10B981',
  thumb_w integer NOT NULL DEFAULT 1280,
  thumb_h integer NOT NULL DEFAULT 720,
  duration_sec double precision,
  author_name text NOT NULL DEFAULT '',
  author_handle text NOT NULL DEFAULT '',
  impressions double precision NOT NULL DEFAULT 0,
  likes double precision NOT NULL DEFAULT 0,
  reposts double precision NOT NULL DEFAULT 0,
  replies double precision NOT NULL DEFAULT 0,
  bookmarks double precision NOT NULL DEFAULT 0,
  quotes double precision NOT NULL DEFAULT 0,
  metrics_updated_at timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz NOT NULL DEFAULT now(),
  added_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'live',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS work_items_status_idx ON work_items (status, sort_order);

CREATE TABLE IF NOT EXISTS collabs (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  logo text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT '',
  date_label text NOT NULL DEFAULT '',
  post_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS programs (
  id text PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  start_label text NOT NULL DEFAULT '',
  end_label text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  post_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  impressions double precision NOT NULL DEFAULT 0,
  likes double precision NOT NULL DEFAULT 0,
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ambassadors (
  id text PRIMARY KEY,
  project text NOT NULL,
  title text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  start_label text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  duties jsonb NOT NULL DEFAULT '[]'::jsonb,
  post_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  year integer NOT NULL,
  client text NOT NULL DEFAULT '',
  date_label text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  budget text NOT NULL DEFAULT '',
  ai_tech text NOT NULL DEFAULT '',
  overview text NOT NULL DEFAULT '',
  challenge text NOT NULL DEFAULT '',
  approach text NOT NULL DEFAULT '',
  achievements jsonb NOT NULL DEFAULT '[]'::jsonb,
  outcome text NOT NULL DEFAULT '',
  scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  cover text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT '#10B981',
  x_url text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  review_quote text NOT NULL DEFAULT '',
  review_author text NOT NULL DEFAULT '',
  review_role text NOT NULL DEFAULT '',
  review_stat text NOT NULL DEFAULT '',
  review_stat_label text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contests (
  id text PRIMARY KEY,
  name text NOT NULL,
  organizer text NOT NULL DEFAULT '',
  date_label text NOT NULL DEFAULT '',
  year integer NOT NULL,
  placement text NOT NULL,
  entry_post_id text NOT NULL DEFAULT '',
  thumb text NOT NULL DEFAULT '',
  x_url text NOT NULL DEFAULT '',
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id text PRIMARY KEY,
  quote text NOT NULL,
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  source_url text NOT NULL DEFAULT '',
  stat text NOT NULL DEFAULT '',
  stat_label text NOT NULL DEFAULT '',
  result_line text NOT NULL DEFAULT '',
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS process_steps (
  id text PRIMARY KEY,
  kicker text NOT NULL DEFAULT '',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tools (
  id text PRIMARY KEY,
  name text NOT NULL,
  group_name text NOT NULL DEFAULT '',
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS articles (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'article',
  slug text NOT NULL DEFAULT '',
  title text NOT NULL,
  url text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  cover_dominant text NOT NULL DEFAULT '#10B981',
  published_at timestamptz NOT NULL DEFAULT now(),
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  pinned boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_unique ON articles (slug) WHERE slug <> '';

CREATE TABLE IF NOT EXISTS links (
  id text PRIMARY KEY,
  label text NOT NULL,
  url text NOT NULL,
  group_name text NOT NULL DEFAULT 'footer',
  hidden boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS legal_pages (
  slug text PRIMARY KEY,
  title text NOT NULL,
  eyebrow text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id text PRIMARY KEY,
  name text NOT NULL,
  project text NOT NULL DEFAULT '',
  budget text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_id_idx ON events (id);

CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL,
  reset_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
