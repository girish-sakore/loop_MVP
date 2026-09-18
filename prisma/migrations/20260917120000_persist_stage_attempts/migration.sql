ALTER TABLE "user_node_progress"
ADD COLUMN "attemptsRemaining" INTEGER,
ADD COLUMN "stagePassed" BOOLEAN NOT NULL DEFAULT false;
