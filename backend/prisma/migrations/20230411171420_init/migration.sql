-- CreateTable
CREATE TABLE "Catalog" (
    "id" SERIAL NOT NULL,
    "starId" INTEGER NOT NULL,
    "referenceId" TEXT NOT NULL,
    "filter" TEXT NOT NULL,
    "julianDate" DECIMAL(65,30) NOT NULL,
    "magnitude" DECIMAL(65,30),
    "magErr" DECIMAL(65,30),

    CONSTRAINT "Catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" SERIAL NOT NULL,
    "starId" INTEGER NOT NULL,
    "referenceId" TEXT NOT NULL,
    "filter" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
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
    "starId" INTEGER NOT NULL,
    "author" TEXT,
    "bibcode" TEXT,
    "referenceStarIds" TEXT,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Identifier" (
    "starId" INTEGER NOT NULL,
    "mainId" TEXT NOT NULL,
    "isFetched" BOOLEAN NOT NULL DEFAULT false,
    "tyc" TEXT,
    "hip" TEXT,
    "epoch" DECIMAL(65,30),
    "period" DECIMAL(65,30),

    CONSTRAINT "Identifier_pkey" PRIMARY KEY ("starId")
);

-- CreateIndex
CREATE INDEX "Catalog_starId_idx" ON "Catalog"("starId");

-- CreateIndex
CREATE INDEX "Catalog_referenceId_idx" ON "Catalog"("referenceId");

-- CreateIndex
CREATE INDEX "Observation_starId_referenceId_idx" ON "Observation"("starId", "referenceId");

-- AddForeignKey
ALTER TABLE "Catalog" ADD CONSTRAINT "Catalog_starId_fkey" FOREIGN KEY ("starId") REFERENCES "Identifier"("starId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_starId_fkey" FOREIGN KEY ("starId") REFERENCES "Identifier"("starId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_starId_fkey" FOREIGN KEY ("starId") REFERENCES "Identifier"("starId") ON DELETE RESTRICT ON UPDATE CASCADE;
