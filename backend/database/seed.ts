import { PrismaClient } from "@prisma/client";
import { fetchObjectIds } from "../services/fetchHdNumber";
import { replaceColumnValue } from "./replaceColumn";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const pathToDataDir = process.env.PATH_TO_DATA_DIR ?? "../data";

async function main() {
  const cache = new Map<string, string>();
  const objectIdsCache = new Map<string, { oid: number; mainId: string; hip?: string; tyc?: string }>();

  try {
    for (const file of ["catalog.csv", "ephemeris.csv", "observation.csv", "reference.csv"]) {
      console.log(`Converting star IDs from ${file} into SIMBAD IDs`);
      await replaceColumnValue(
        `${pathToDataDir}/${file}`,
        `${pathToDataDir}/out/${file}`,
        "starId",
        async (starId) => {
          // const oid = await fetchObjectId(starId);
          // if (!oid) {
          //   console.error(`starId ${starId} could not be converted into simbad object id`);
          //   process.exit(1);
          // }
          // return oid.toString();
          const identifiers = await fetchObjectIds(starId);
          if (!identifiers) {
            console.error(`starId ${starId} could not be converted into simbad object id`);
            process.exit(1);
          }
          objectIdsCache.set(starId, identifiers);
          return identifiers.oid.toString();
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
      prisma.$executeRawUnsafe(`TRUNCATE public."Identifier" RESTART IDENTITY;`),

      // path to CSV files depends on how is data file mounted in docker-compose.yml
      prisma.$executeRawUnsafe(`
        COPY public."Catalog"("starId", "julianDate", "magnitude", "magErr", "filter", "referenceId")
        FROM '/data/out/catalog.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Ephemeris"("starId", "epoch", "period")
        FROM '/data/out/ephemeris.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Observation"("starId", "lambdaEff", "filter", "referenceId", "magAverage", "magError", "stdError", "amplitudeEff")
        FROM '/data/out/observation.csv' 
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
        FROM '/data/out/reference.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      // Insert all identifiers
      prisma.identifier.createMany({
        data: [...objectIdsCache.values()].map((identifiers) => ({
          starId: identifiers.oid,
          mainId: identifiers.mainId,
          tyc: identifiers.tyc,
          hip: identifiers.hip,
          isFetched: false,
        })),
        skipDuplicates: true,
      }),
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
