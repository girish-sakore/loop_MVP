-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "edition" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "releaseAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "content" JSONB NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "edition_slug_key" ON "edition"("slug");

-- CreateIndex
CREATE INDEX "edition_status_releaseAt_idx" ON "edition"("status", "releaseAt");

-- AddForeignKey
ALTER TABLE "edition" ADD CONSTRAINT "edition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
