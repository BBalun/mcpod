-- DropIndex
DROP INDEX "Identifier_hip_idx";

-- DropIndex
DROP INDEX "Identifier_tyc_idx";

-- AlterTable
ALTER TABLE "Identifier" ADD COLUMN     "isFetched" BOOLEAN NOT NULL DEFAULT false;
