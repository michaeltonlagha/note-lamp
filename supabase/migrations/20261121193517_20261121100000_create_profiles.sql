-- Profiles: display names for reading room members and discussion posts
-- 1. New table: profiles (id references auth.users, display_name)
-- 2. RLS: authenticated can read all profiles (needed to show names in shared rooms),
--    users can insert/update only their own profile row.
-- 3. The app upserts the profile on sign-in, deriving the name from the email.

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
