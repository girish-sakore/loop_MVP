CREATE TABLE "daily_game" (
    "id" TEXT NOT NULL,
    "scheduledFor" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_game_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_game_scheduledFor_key" ON "daily_game"("scheduledFor");
CREATE INDEX "daily_game_type_idx" ON "daily_game"("type");

ALTER TABLE "daily_game"
  ADD CONSTRAINT "daily_game_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
