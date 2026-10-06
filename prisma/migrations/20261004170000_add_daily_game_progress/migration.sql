-- AlterTable: link user_streak to the day its last game was played (1:1)
ALTER TABLE "user_streak" ADD COLUMN "lastGameId" TEXT;

-- CreateTable: per-user progress on a single daily game.
-- Mirrors user_node_progress (one game == one former "edition/node"):
-- currentSubStage tracks which sub-stage/round the user is on.
CREATE TABLE "daily_game_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyGameId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "currentSubStage" INTEGER NOT NULL DEFAULT 0,
    "attemptsRemaining" INTEGER,
    "stagePassed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalAnswers" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "hintsRemaining" INTEGER NOT NULL DEFAULT 3,
    "clientUpdatedAt" BIGINT NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_game_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_game_progress_userId_dailyGameId_key" ON "daily_game_progress"("userId", "dailyGameId");

-- CreateIndex
CREATE INDEX "daily_game_progress_dailyGameId_idx" ON "daily_game_progress"("dailyGameId");

-- CreateIndex
CREATE UNIQUE INDEX "user_streak_lastGameId_key" ON "user_streak"("lastGameId");

-- AddForeignKey
ALTER TABLE "daily_game_progress" ADD CONSTRAINT "daily_game_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_game_progress" ADD CONSTRAINT "daily_game_progress_dailyGameId_fkey" FOREIGN KEY ("dailyGameId") REFERENCES "daily_game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_lastGameId_fkey" FOREIGN KEY ("lastGameId") REFERENCES "daily_game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
