/*
# NoteLamp — Note Sharing & Reading Rooms

## Summary
Adds two major features:
1. **Note Sharing** — Users share a note via a unique 8-char code. Others import
   it by entering the code (or scanning a QR code in the UI). The share stores a
   snapshot of the note content so it remains accessible even if the original is
   edited or deleted.
2. **Reading Rooms** — Group reading spaces where users read a book together,
   track per-member progress (page number), and share posts (experiences and
   lessons) visible to all room members.

## New Tables
- shared_notes — note snapshots with a unique share code
- reading_rooms — room metadata (name, book, total pages, creator)
- reading_room_members — join table (room_id, user_id)
- reading_room_progress — per-user current page in each room
- reading_room_posts — discussion posts within a room

## Security
- RLS on all tables.
- shared_notes: SELECT open to authenticated (the code is the access token);
  INSERT/DELETE restricted to sender.
- reading_rooms: SELECT limited to creator + members; INSERT open to
  authenticated (create rooms); UPDATE/DELETE creator only.
- reading_room_members: SELECT to members of same room; INSERT self-only;
  DELETE self or room creator.
- reading_room_progress: SELECT to members; INSERT/UPDATE self-only.
- reading_room_posts: SELECT to members; INSERT/DELETE self-only.
- All user_id columns default to auth.uid().
*/

-- ===== Create all tables first =====

CREATE TABLE IF NOT EXISTS shared_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  note_id uuid REFERENCES notes(id) ON DELETE SET NULL,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Sermon',
  scriptures text[] NOT NULL DEFAULT '{}',
  is_sermon boolean NOT NULL DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reading_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  book_title text NOT NULL DEFAULT '',
  book_author text NOT NULL DEFAULT '',
  total_pages integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS reading_room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES reading_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS reading_room_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES reading_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  current_page integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS reading_room_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES reading_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  page_reference integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ===== Enable RLS on all =====
ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_room_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_room_posts ENABLE ROW LEVEL SECURITY;

-- ===== Grants =====
GRANT SELECT, INSERT, DELETE ON shared_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON reading_rooms TO authenticated;
GRANT SELECT, INSERT, DELETE ON reading_room_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON reading_room_progress TO authenticated;
GRANT SELECT, INSERT, DELETE ON reading_room_posts TO authenticated;

-- ===== Policies: shared_notes =====
DROP POLICY IF EXISTS "select_shared_notes" ON shared_notes;
CREATE POLICY "select_shared_notes" ON shared_notes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_shared_notes" ON shared_notes;
CREATE POLICY "insert_own_shared_notes" ON shared_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "delete_own_shared_notes" ON shared_notes;
CREATE POLICY "delete_own_shared_notes" ON shared_notes
  FOR DELETE TO authenticated USING (auth.uid() = sender_id);

-- ===== Policies: reading_rooms =====
DROP POLICY IF EXISTS "select_joined_rooms" ON reading_rooms;
CREATE POLICY "select_joined_rooms" ON reading_rooms
  FOR SELECT TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM reading_room_members m
      WHERE m.room_id = reading_rooms.id AND m.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_rooms" ON reading_rooms;
CREATE POLICY "insert_rooms" ON reading_rooms
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "update_room_creator" ON reading_rooms;
CREATE POLICY "update_room_creator" ON reading_rooms
  FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "delete_room_creator" ON reading_rooms;
CREATE POLICY "delete_room_creator" ON reading_rooms
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ===== Policies: reading_room_members =====
DROP POLICY IF EXISTS "select_room_members" ON reading_room_members;
CREATE POLICY "select_room_members" ON reading_room_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM reading_room_members m2
      WHERE m2.room_id = reading_room_members.room_id AND m2.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM reading_rooms r
      WHERE r.id = reading_room_members.room_id AND r.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_membership" ON reading_room_members;
CREATE POLICY "insert_own_membership" ON reading_room_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_room_members" ON reading_room_members;
CREATE POLICY "delete_room_members" ON reading_room_members
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM reading_rooms r
      WHERE r.id = reading_room_members.room_id AND r.created_by = auth.uid()
    )
  );

-- ===== Policies: reading_room_progress =====
DROP POLICY IF EXISTS "select_room_progress" ON reading_room_progress;
CREATE POLICY "select_room_progress" ON reading_room_progress
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM reading_room_members m
      WHERE m.room_id = reading_room_progress.room_id AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM reading_rooms r
      WHERE r.id = reading_room_progress.room_id AND r.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_progress" ON reading_room_progress;
CREATE POLICY "insert_own_progress" ON reading_room_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON reading_room_progress;
CREATE POLICY "update_own_progress" ON reading_room_progress
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== Policies: reading_room_posts =====
DROP POLICY IF EXISTS "select_room_posts" ON reading_room_posts;
CREATE POLICY "select_room_posts" ON reading_room_posts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reading_room_members m
      WHERE m.room_id = reading_room_posts.room_id AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM reading_rooms r
      WHERE r.id = reading_room_posts.room_id AND r.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_posts" ON reading_room_posts;
CREATE POLICY "insert_own_posts" ON reading_room_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_posts" ON reading_room_posts;
CREATE POLICY "delete_own_posts" ON reading_room_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== Indexes =====
CREATE INDEX IF NOT EXISTS idx_shared_notes_code ON shared_notes(code);
CREATE INDEX IF NOT EXISTS idx_rr_members_room ON reading_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_rr_members_user ON reading_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_rr_progress_room ON reading_room_progress(room_id);
CREATE INDEX IF NOT EXISTS idx_rr_posts_room ON reading_room_posts(room_id);
CREATE INDEX IF NOT EXISTS idx_rr_rooms_creator ON reading_rooms(created_by);
