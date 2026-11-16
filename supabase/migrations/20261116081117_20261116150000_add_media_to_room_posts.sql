-- Reading Room Posts - Media Attachments (Images & Audio)
-- Extends reading room discussion posts to support image screenshots and audio recordings.
-- 1. reading_room_posts: add image_url, audio_url columns; content becomes nullable
-- 2. Storage buckets: room-images (public), room-audio (public)
-- 3. Storage policies: authenticated uploads, public reads, owner-only deletes

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reading_room_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE reading_room_posts ADD COLUMN image_url text;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reading_room_posts' AND column_name = 'audio_url'
  ) THEN
    ALTER TABLE reading_room_posts ADD COLUMN audio_url text;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reading_room_posts' AND column_name = 'content'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE reading_room_posts ALTER COLUMN content DROP NOT NULL;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('room-audio', 'room-audio', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "room_images_upload" ON storage.objects;
CREATE POLICY "room_images_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'room-images');

DROP POLICY IF EXISTS "room_images_read" ON storage.objects;
CREATE POLICY "room_images_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'room-images');

DROP POLICY IF EXISTS "room_images_delete" ON storage.objects;
CREATE POLICY "room_images_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'room-images' AND owner = auth.uid());

DROP POLICY IF EXISTS "room_audio_upload" ON storage.objects;
CREATE POLICY "room_audio_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'room-audio');

DROP POLICY IF EXISTS "room_audio_read" ON storage.objects;
CREATE POLICY "room_audio_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'room-audio');

DROP POLICY IF EXISTS "room_audio_delete" ON storage.objects;
CREATE POLICY "room_audio_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'room-audio' AND owner = auth.uid());
