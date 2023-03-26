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
  const cache = new Map<string, string>();
  // const objectIdsMap = new Map<string, { oid: number; mainId: string; hip?: string; tyc?: string }>();
  try {
    for (const file of ["catalog.csv", "ephemeris.csv", "observation.csv", "reference.csv"]) {
      console.log(`Converting star IDs from ${file} into SIMBAD IDs`);
      await replaceColumnValue(
        `${csvFolderPath}/${file}`,
        `${csvFolderPath}/out/${file}`,
        "starId",
        async (starId) => {
          const oid = await fetchObjectId(starId);
          if (!oid) {
            console.error(`starId ${starId} could not be converted into simbad object id`);
            process.exit(1);
          }
          return oid.toString();
          // const objectIds = await fetchObjectIds(id);
          // if (!objectIds) {
          //   console.error(`starId ${id} could not be converted into simbad object id`);
          //   process.exit(1);
          // }
          // objectIdsMap.set(id, objectIds);
          // return objectIds.oid.toString();
        },
        cache
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
        UPDATE public."Observation" SET "count" = (
          SELECT COUNT(*) FROM public."Catalog"
          WHERE "Catalog"."starId" = "Observation"."starId" 
            AND "Catalog"."referenceId" = "Observation"."referenceId" 
            AND "Catalog".filter = "Observation".filter
        )
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Reference"("referenceId", "starId", "author", "bibcode", "referenceStarIds")
        FROM '/data/output_without_tycho/out/reference.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      // Insert all identifiers
      // prisma.identifier.createMany({
      //   data: [...objectIdsMap.values()].map((identifiers) => ({
      //     starId: identifiers.oid,
      //     ...identifiers,
      //   })),
      //   skipDuplicates: true,
      // }),
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
