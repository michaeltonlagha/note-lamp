/*
# Fix reading_rooms SELECT policy for discoverability

## Summary
The original select_joined_rooms policy only allowed seeing rooms you created
or are already a member of. This makes it impossible to discover and join rooms.
Change: allow all authenticated users to SELECT reading_rooms so they can
browse and join. Membership-based visibility is still enforced on members,
progress, and posts tables.

## Security
- reading_rooms SELECT: open to authenticated (room metadata is not sensitive;
  the room name, book title, and description are needed to decide whether to join)
- reading_rooms INSERT/UPDATE/DELETE: unchanged (creator-only)
*/

DROP POLICY IF EXISTS "select_joined_rooms" ON reading_rooms;
CREATE POLICY "select_joined_rooms" ON reading_rooms
  FOR SELECT TO authenticated USING (true);
