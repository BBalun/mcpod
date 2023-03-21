-- CreateTable
CREATE TABLE "Ephemeris" (
    "starId" TEXT NOT NULL,
    "epoch" DECIMAL(65,30),
    "period" DECIMAL(65,30),

    CONSTRAINT "Ephemeris_pkey" PRIMARY KEY ("starId")
);

-- CreateTable
CREATE TABLE "Catalog" (
    "id" SERIAL NOT NULL,
    "starId" TEXT NOT NULL,
    "julianDate" DECIMAL(65,30) NOT NULL,
    "magnitude" DECIMAL(65,30),
    "magErr" DECIMAL(65,30),
    "filter" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,

    CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" SERIAL NOT NULL,
    "starId" TEXT NOT NULL,
    "filter" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "lambdaEff" DECIMAL(65,30),
    "magAverage" DECIMAL(65,30),
    "magError" DECIMAL(65,30),
    "stdError" DECIMAL(65,30),
    "amplitudeEff" DECIMAL(65,30),

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reference" (
    "id" SERIAL NOT NULL,
    "referenceId" TEXT NOT NULL,
    "starId" TEXT NOT NULL,
    "author" TEXT,
    "bibcode" TEXT,
    "referenceStarIds" TEXT,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" SERIAL NOT NULL,
    "starId" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "filter" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
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
