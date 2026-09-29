-- AlterTable
ALTER TABLE "user_node_progress" ADD COLUMN     "clientUpdatedAt" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "hintsRemaining" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
