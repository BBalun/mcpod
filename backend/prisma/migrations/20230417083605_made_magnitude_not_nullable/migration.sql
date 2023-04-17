/*
  Warnings:

  - Made the column `magnitude` on table `Catalog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Catalog" ALTER COLUMN "magnitude" SET NOT NULL;
