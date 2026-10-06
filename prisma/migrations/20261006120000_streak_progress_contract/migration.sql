-- One canonical streak date; the daily game row is no longer referenced by streak state.
ALTER TABLE "user_streak" DROP CONSTRAINT IF EXISTS "user_streak_lastGameId_fkey";
DROP INDEX IF EXISTS "user_streak_lastGameId_idx";
DROP INDEX IF EXISTS "user_streak_lastGameId_key";
ALTER TABLE "user_streak" DROP COLUMN IF EXISTS "lastGameId";

-- Persist only known daily game and progress states.
CREATE TYPE "DailyGameStatus" AS ENUM ('draft', 'published');
CREATE TYPE "DailyGameProgressStatus" AS ENUM ('not_started', 'in_progress', 'completed');

ALTER TABLE "daily_game" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "daily_game"
  ALTER COLUMN "status" TYPE "DailyGameStatus"
  USING "status"::"DailyGameStatus";
ALTER TABLE "daily_game" ALTER COLUMN "status" SET DEFAULT 'draft';

ALTER TABLE "daily_game_progress" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "daily_game_progress"
  ALTER COLUMN "status" TYPE "DailyGameProgressStatus"
  USING "status"::"DailyGameProgressStatus";
ALTER TABLE "daily_game_progress" ALTER COLUMN "status" SET DEFAULT 'not_started';

-- These former edition/node progress tables have no remaining runtime consumers.
DROP TABLE IF EXISTS "user_node_progress";
DROP TABLE IF EXISTS "user_edition_progress";