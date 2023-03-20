/*
  Warnings:

  - You are about to drop the column `description` on the `reference` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "hvezda" INTEGER NOT NULL,
    "autor" TEXT,
    "bibcode" TEXT,
    "s_hvezda" TEXT,
    "popis" TEXT
);
INSERT INTO "new_reference" ("autor", "bibcode", "hvezda", "id", "reference", "s_hvezda") SELECT "autor", "bibcode", "hvezda", "id", "reference", "s_hvezda" FROM "reference";
DROP TABLE "reference";
ALTER TABLE "new_reference" RENAME TO "reference";
CREATE UNIQUE INDEX "reference_reference_hvezda_key" ON "reference"("reference", "hvezda");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
