/*
  Warnings:

  - A unique constraint covering the columns `[referenceId,starId]` on the table `Reference` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reference_referenceId_starId_key" ON "Reference"("referenceId", "starId");
