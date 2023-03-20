-- CreateTable
CREATE TABLE "elementy" (
    "hvezda" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "epocha" DECIMAL NOT NULL,
    "perioda" DECIMAL
);

-- CreateTable
CREATE TABLE "katalog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hvezda" INTEGER NOT NULL,
    "jd" DECIMAL NOT NULL,
    "mag" DECIMAL,
    "mag_err" DECIMAL,
    "filter" TEXT NOT NULL,
    "reference" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "pozorovani" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hvezda" INTEGER NOT NULL,
    "filter" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "lambda_eff" INTEGER,
    "pocet" INTEGER,
    "magavg" DECIMAL,
    "mag_err" DECIMAL,
    "stderr" DECIMAL,
    "amlit_eff" DECIMAL
);

-- CreateTable
CREATE TABLE "reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "reference" TEXT NOT NULL,
    "hvezda" INTEGER NOT NULL,
    "autor" TEXT,
    "bibcode" TEXT,
    "s_hvezda" TEXT,
    "description" TEXT
);

-- CreateIndex
CREATE INDEX "katalog_reference_idx" ON "katalog"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "pozorovani_hvezda_filter_reference_key" ON "pozorovani"("hvezda", "filter", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "reference_reference_hvezda_key" ON "reference"("reference", "hvezda");
