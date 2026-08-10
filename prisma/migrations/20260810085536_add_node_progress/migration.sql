/*
  Warnings:

  - You are about to drop the column `currentStage` on the `user_edition_progress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_edition_progress" DROP COLUMN "currentStage",
ADD COLUMN     "current_stage" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_node_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "currentSubStage" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "totalAnswers" INTEGER NOT NULL DEFAULT 0,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_node_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_node_progress_userId_editionId_nodeId_key" ON "user_node_progress"("userId", "editionId", "nodeId");

-- AddForeignKey
ALTER TABLE "user_node_progress" ADD CONSTRAINT "user_node_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
