-- CreateEnum
CREATE TYPE "EditionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "import_batch" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "importedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "subStages" JSONB NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "importBatchId" TEXT,
    "editionId" TEXT,
    "position" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "category" TEXT,
    "author" TEXT,
    "coverImage" TEXT,
    "estimatedTime" TEXT,
    "status" "EditionStatus" NOT NULL DEFAULT 'DRAFT',
    "date" DATE,
    "snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "game_editionId_position_idx" ON "game"("editionId", "position");

-- CreateIndex
CREATE INDEX "game_type_idx" ON "game"("type");

-- CreateIndex
CREATE UNIQUE INDEX "game_editionId_type_key" ON "game"("editionId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "edition_date_key" ON "edition"("date");

-- CreateIndex
CREATE INDEX "edition_status_date_idx" ON "edition"("status", "date");

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "import_batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "edition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
