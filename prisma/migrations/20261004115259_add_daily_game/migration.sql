-- CreateTable
CREATE TABLE "daily_game" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "coverImage" TEXT,
    "scheduledFor" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_game_scheduledFor_key" ON "daily_game"("scheduledFor");

-- CreateIndex
CREATE INDEX "daily_game_type_idx" ON "daily_game"("type");

-- CreateIndex
CREATE INDEX "daily_game_status_scheduledFor_idx" ON "daily_game"("status", "scheduledFor");

-- AddForeignKey
ALTER TABLE "daily_game" ADD CONSTRAINT "daily_game_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
