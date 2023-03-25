import { PrismaClient } from "@prisma/client";
import { fetchObjectId } from "../services/fetchHdNumber";
import { replaceColumnValue } from "./replaceColumn";

const prisma = new PrismaClient();

// TODO:
// This should be loaded from env variable that will be specified in docker compose file
// Same path should be passed also to a postgres container
// Both containers should have this data folder mounted
const csvFolderPath = "../data/data/output_without_tycho";

async function main() {
  try {
    // for (const file of ["catalog.csv", "ephemeris.csv", "observation.csv", "reference.csv"]) {
    for (const file of ["ephemeris.csv", "reference.csv", "observation.csv", "catalog.csv"]) {
      console.log(`Converting star IDs from ${file} into SIMBAD IDs`);
      await replaceColumnValue(
        `${csvFolderPath}/${file}`,
        `${csvFolderPath}/out/${file}`,
        "starId",
        async (id) => (await fetchObjectId(id))!
      );
    }
  } catch (e) {
    console.error(e);
    console.error("Failed to convert star IDs from CSV files into SIMBAD object IDs.");
    console.error("See exception details above for more information.");
    process.exit(1);
  }

  try {
    await prisma.$transaction([
      prisma.$executeRawUnsafe(`TRUNCATE public."Catalog" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Ephemeris" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Observation" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Reference" RESTART IDENTITY;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Measurement" RESTART IDENTITY;`),

      // path to CSV files is specified in docker-compose.yml file
      // TODO: synchronize with a csvFolderPath variable
      prisma.$executeRawUnsafe(`
        COPY public."Catalog"("starId", "julianDate", "magnitude", "magErr", "filter", "referenceId")
        FROM '/data/output_without_tycho/out/catalog.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Ephemeris"("starId", "epoch", "period")
        FROM '/data/output_without_tycho/out/ephemeris.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Observation"("starId", "lambdaEff", "filter", "referenceId", "magAverage", "magError", "stdError", "amplitudeEff")
        FROM '/data/output_without_tycho/out/observation.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Reference"("referenceId", "starId", "author", "bibcode", "referenceStarIds")
        FROM '/data/output_without_tycho/out/reference.csv' 
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
  } catch (e) {
    console.error(e);
    console.log("DB seeding failed. See error above");
    process.exit(1);
  }

  console.log("DB seeded successfully");
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
