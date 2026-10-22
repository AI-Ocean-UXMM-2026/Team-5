CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('learner', 'company', 'teacher', 'staff')),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  headline text NOT NULL DEFAULT '',
  password_hash text,
  google_sub text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (password_hash IS NOT NULL OR google_sub IS NOT NULL)
);

CREATE TABLE user_skills (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  skill text NOT NULL,
  PRIMARY KEY (user_id, skill)
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sessions_user_id_idx ON sessions (user_id);

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL UNIQUE REFERENCES users (id),
  name text NOT NULL,
  about text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  social text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'verified', 'rejected')),
  review_note text,
  verified_at timestamptz,
  approval_seen boolean NOT NULL DEFAULT false,
  term_role text NOT NULL DEFAULT '',
  term_duration text NOT NULL DEFAULT '',
  term_location text NOT NULL DEFAULT '',
  term_stipend text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX companies_status_idx ON companies (status);

CREATE TABLE company_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('document', 'logo')),
  storage_key text NOT NULL,
  filename text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX company_files_one_logo ON company_files (company_id) WHERE kind = 'logo';

CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users (id),
  title text NOT NULL,
  skill text NOT NULL,
  level text NOT NULL,
  hours integer NOT NULL CHECK (hours > 0),
  price_mmk integer NOT NULL CHECK (price_mmk >= 0),
  description text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX courses_published_idx ON courses (published);

CREATE TABLE lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 1),
  title text NOT NULL,
  body text[] NOT NULL,
  key_points text[] NOT NULL,
  summary text NOT NULL,
  UNIQUE (course_id, position)
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES lessons (id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses (id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('quiz', 'test')),
  position integer NOT NULL CHECK (position >= 1),
  prompt text NOT NULL,
  options text[] NOT NULL CHECK (cardinality(options) >= 2),
  answer_index integer NOT NULL CHECK (answer_index >= 0 AND answer_index < cardinality(options)),
  CHECK (
    (kind = 'quiz' AND lesson_id IS NOT NULL AND course_id IS NULL)
    OR (kind = 'test' AND course_id IS NOT NULL AND lesson_id IS NULL)
  )
);

CREATE UNIQUE INDEX questions_lesson_position_idx ON questions (lesson_id, position) WHERE lesson_id IS NOT NULL;
CREATE UNIQUE INDEX questions_course_position_idx ON questions (course_id, position) WHERE course_id IS NOT NULL;

CREATE TABLE roadmaps (
  user_id uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  goal text NOT NULL,
  current_skills text NOT NULL DEFAULT '',
  hours_per_week integer NOT NULL CHECK (hours_per_week > 0),
  note text NOT NULL DEFAULT ''
);

CREATE TABLE roadmap_steps (
  user_id uuid NOT NULL REFERENCES roadmaps (user_id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 1),
  course_id uuid NOT NULL REFERENCES courses (id),
  PRIMARY KEY (user_id, position)
);

CREATE TABLE lesson_completions (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  completed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE notes (
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons (id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses (id),
  correct_count integer NOT NULL CHECK (correct_count >= 0),
  question_count integer NOT NULL CHECK (question_count > 0),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  passed boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id uuid NOT NULL REFERENCES users (id),
  course_id uuid NOT NULL REFERENCES courses (id),
  test_attempt_id uuid NOT NULL UNIQUE REFERENCES test_attempts (id),
  score integer NOT NULL CHECK (score >= 70 AND score <= 100),
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (learner_id, course_id)
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users (id),
  course_id uuid NOT NULL REFERENCES courses (id),
  amount_mmk integer NOT NULL CHECK (amount_mmk > 0),
  status text NOT NULL CHECK (status IN ('pending', 'paid', 'failed')),
  provider_ref text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE entitlements (
  user_id uuid NOT NULL REFERENCES users (id),
  course_id uuid NOT NULL REFERENCES courses (id),
  payment_id uuid NOT NULL UNIQUE REFERENCES payments (id),
  granted_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies (id),
  course_id uuid NOT NULL REFERENCES courses (id),
  title text NOT NULL,
  task text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE rubric_points (
  challenge_id uuid NOT NULL REFERENCES challenges (id) ON DELETE CASCADE,
  position integer NOT NULL CHECK (position >= 1),
  point text NOT NULL,
  PRIMARY KEY (challenge_id, position)
);

CREATE TABLE submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges (id),
  learner_id uuid NOT NULL REFERENCES users (id),
  answer text NOT NULL,
  link text NOT NULL DEFAULT '',
  ai_summary text,
  ai_score integer CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 100)),
  ai_feedback text[] NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('submitted', 'needs-work', 'interview', 'offered')),
  company_feedback text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, learner_id)
);

CREATE INDEX submissions_challenge_id_idx ON submissions (challenge_id);

CREATE TABLE interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES submissions (id),
  challenge_id uuid NOT NULL REFERENCES challenges (id),
  learner_id uuid NOT NULL REFERENCES users (id),
  company_id uuid NOT NULL REFERENCES companies (id),
  scheduled_for timestamptz,
  status text NOT NULL CHECK (status IN ('scheduled', 'offered', 'accepted', 'declined', 'not-selected')),
  CHECK (status <> 'scheduled' OR scheduled_for IS NOT NULL)
);

CREATE INDEX interviews_learner_id_idx ON interviews (learner_id);
CREATE INDEX interviews_company_id_idx ON interviews (company_id);

CREATE TABLE offer_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews (id),
  to_email text NOT NULL,
  sent_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text
);

CREATE TABLE ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews (id),
  from_user_id uuid NOT NULL REFERENCES users (id),
  target_type text NOT NULL CHECK (target_type IN ('user', 'company')),
  target_id uuid NOT NULL,
  stars integer NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment text NOT NULL DEFAULT '',
  UNIQUE (interview_id, from_user_id)
);

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users (id),
  kind text NOT NULL CHECK (kind IN ('course', 'challenge')),
  topic_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_kind_topic_idx ON posts (kind, topic_id);

CREATE TABLE replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users (id),
  body text NOT NULL,
  is_official boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX replies_one_official_idx ON replies (post_id) WHERE is_official;

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL CHECK (target_type IN ('post', 'reply')),
  target_id uuid NOT NULL,
  reporter_id uuid NOT NULL REFERENCES users (id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  staff_user_id uuid REFERENCES users (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  UNIQUE (target_type, target_id, reporter_id)
);

CREATE INDEX reports_status_idx ON reports (status);

CREATE TABLE staff_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id uuid NOT NULL REFERENCES users (id),
  subject_type text NOT NULL CHECK (subject_type IN ('company', 'report')),
  subject_id uuid NOT NULL,
  from_status text NOT NULL,
  to_status text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
