import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$transaction([
      prisma.$executeRawUnsafe(`TRUNCATE public."Catalog" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Ephemeris" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Observation" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Reference" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Measurement" RESTART IDENTITY;`),
      // path to CSV files is specified in docker-compose.yml file
      prisma.$executeRawUnsafe(`
        COPY public."Catalog"("starId", "julianDate", "magnitude", "magErr", "filter", "referenceId")
        FROM '/data/output/catalog.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Ephemeris"("starId", "epoch", "period")
        FROM '/data/output/ephemeris.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Observation"("starId", "lambdaEff", "filter", "referenceId", "magAverage", "magError", "stdError", "amplitudeEff")
        FROM '/data/output/observation.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Reference"("referenceId", "starId", "author", "bibcode", "referenceStarIds")
        FROM '/data/output/reference.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      // Calculate measurements
      prisma.$executeRawUnsafe(`
        INSERT INTO public."Measurement" ("starId", "referenceId", "filter", "count") 
        SELECT "starId", "referenceId", "filter", COUNT(*) as "count" 
        FROM public."Catalog" 
        GROUP BY "starId", "referenceId", "filter"
      `),
    ]);
    console.log("DB seeded successfully");
  } catch (e) {
    console.error(e);
    console.log("DB seeding failed. See error above");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
