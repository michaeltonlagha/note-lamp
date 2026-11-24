-- Reading room invite codes
-- 1. reading_rooms: add invite_code (text, unique, nullable for legacy rows)
-- 2. Backfill: every existing room without a code gets a unique 8-char code
-- 3. Unique index for fast code lookup on join

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reading_rooms' AND column_name = 'invite_code'
  ) THEN
    ALTER TABLE reading_rooms ADD COLUMN invite_code text;
  END IF;
END $$;

-- Backfill codes for existing rooms (skip if none missing)
DO $$
DECLARE
  r record;
  new_code text;
BEGIN
  FOR r IN SELECT id FROM reading_rooms WHERE invite_code IS NULL LOOP
    LOOP
      new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM reading_rooms WHERE invite_code = new_code);
    END LOOP;
    UPDATE reading_rooms SET invite_code = new_code WHERE id = r.id;
  END LOOP;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reading_rooms_invite_code
  ON reading_rooms(invite_code)
  WHERE invite_code IS NOT NULL;
