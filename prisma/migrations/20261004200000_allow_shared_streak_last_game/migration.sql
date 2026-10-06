-- Multiple users can complete the same daily game. A streak's last game is
-- therefore many-to-one, not one-to-one.
DROP INDEX IF EXISTS "user_streak_lastGameId_key";

CREATE INDEX "user_streak_lastGameId_idx" ON "user_streak"("lastGameId");
