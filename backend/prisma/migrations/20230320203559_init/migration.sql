-- CreateTable
CREATE TABLE "Ephemeris" (
    "starId" TEXT NOT NULL PRIMARY KEY,
    "epoch" DECIMAL,
    "period" DECIMAL
);

-- CreateTable
CREATE TABLE "Catalog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "starId" TEXT NOT NULL,
    "julianDate" DECIMAL NOT NULL,
    "magnitude" DECIMAL,
    "magErr" DECIMAL,
    "filter" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "starId" TEXT NOT NULL,
    "filter" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "lambdaEff" DECIMAL,
    "magAverage" DECIMAL,
    "magError" DECIMAL,
    "stdError" DECIMAL,
    "amplitudeEff" DECIMAL
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenceId" TEXT NOT NULL,
    "starId" TEXT NOT NULL,
    "author" TEXT,
    "bibcode" TEXT,
    "referenceStarIds" TEXT
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "starId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "filter" TEXT NOT NULL,
    "countr" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Catalog_starId_idx" ON "Catalog"("starId");

-- CreateIndex
CREATE INDEX "Catalog_referenceId_idx" ON "Catalog"("referenceId");

-- CreateIndex
CREATE INDEX "Observation_starId_referenceId_idx" ON "Observation"("starId", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Reference_referenceId_starId_key" ON "Reference"("referenceId", "starId");

-- CreateIndex
CREATE UNIQUE INDEX "Measurement_starId_filter_referenceId_key" ON "Measurement"("starId", "filter", "referenceId");
