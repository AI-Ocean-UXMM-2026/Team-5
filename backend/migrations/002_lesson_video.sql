ALTER TABLE lessons
  ADD COLUMN video_id text,
  ADD CONSTRAINT lessons_video_id_youtube CHECK (video_id IS NULL OR video_id ~ '^[A-Za-z0-9_-]{11}$');
