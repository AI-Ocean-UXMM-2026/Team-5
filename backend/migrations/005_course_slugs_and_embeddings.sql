-- A short stable name per course, used by the website and the AI roadmap.
ALTER TABLE courses ADD COLUMN slug text UNIQUE;

UPDATE courses SET slug = 'starter' WHERE title = 'Career starter: working in IT' AND slug IS NULL;
UPDATE courses SET slug = 'frontend' WHERE title = 'Frontend basics: HTML, CSS and JavaScript' AND slug IS NULL;
UPDATE courses SET slug = 'qa' WHERE title = 'Manual QA testing' AND slug IS NULL;

-- One embedding per course for the AI roadmap search. content_hash skips courses whose text did not change.
CREATE TABLE course_embeddings (
  course_id uuid PRIMARY KEY REFERENCES courses (id) ON DELETE CASCADE,
  model text NOT NULL,
  content_hash text NOT NULL,
  embedding real[] NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
