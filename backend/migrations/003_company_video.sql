ALTER TABLE companies
  ADD COLUMN video_id text,
  ADD CONSTRAINT companies_video_id_youtube CHECK (video_id IS NULL OR video_id ~ '^[A-Za-z0-9_-]{11}$');
