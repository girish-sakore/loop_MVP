-- Persist each calendar day that a user completes at least one game. Keeping
-- daily activity separate from the streak summary makes the calendar accurate
-- after a replay and lets the summary be rebuilt from durable data.
CREATE TABLE "user_streak_day" (
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "user_streak_day_pkey" PRIMARY KEY ("userId", "date")
);

ALTER TABLE "user_streak_day"
ADD CONSTRAINT "user_streak_day_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Carry existing completions into the new daily activity log. Prisma stores
-- DateTime values as UTC, while streaks use the Asia/Kolkata calendar day.
INSERT INTO "user_streak_day" ("userId", "date")
SELECT DISTINCT
    "userId",
    (("completedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata')::date
FROM "user_node_progress"
WHERE "status" = 'completed' AND "completedAt" IS NOT NULL
ON CONFLICT ("userId", "date") DO NOTHING;
