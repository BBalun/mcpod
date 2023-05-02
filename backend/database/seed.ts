import { fetchObjectIds } from "../data/simbad";
import { replaceColumnValue } from "./replaceColumn";
import dotenv from "dotenv";
import papaparse from "papaparse";
import fs from "fs";
import { pathToDataDir } from "../constants";
import { prisma } from "./prisma";

dotenv.config();

const files = ["catalog.csv", "ephemeris.csv", "observation.csv", "reference.csv"];

async function main() {
  const cache = new Map<string, string>();
  const objectIdsCache = new Map<string, { oid: number; mainId: string; hip?: string; tyc?: string }>();

  if (!fs.existsSync(pathToDataDir + "/temp")) {
    fs.mkdirSync(pathToDataDir + "/temp");
  }

  try {
    for (const file of files) {
      console.log(`Converting star IDs from ${file} into SIMBAD IDs`);
      await replaceColumnValue(
        `${pathToDataDir}/source/${file}`,
        `${pathToDataDir}/temp/${file}`,
        "starId",
        async (starId) => {
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

  // Add ephemeris information to identifiers
  const ephemerisStr = fs.readFileSync(`${pathToDataDir}/temp/ephemeris.csv`, { encoding: "utf8" });
  const ephemerides = papaparse
    .parse<{ starId: string; epoch: string; period: string }>(ephemerisStr, { header: true })
    .data.map(({ starId, epoch, period }) => ({
      starId: Number(starId),
      epoch: Number(epoch),
      period: Number(period),
    }));

  const identifiers = [...objectIdsCache.values()].map((identifiers) => {
    const ephemeris = ephemerides.find((e) => e.starId === identifiers.oid);
    return {
      starId: identifiers.oid,
      mainId: identifiers.mainId,
      tyc: identifiers.tyc,
      hip: identifiers.hip,
      isFetched: false,
      epoch: ephemeris?.epoch,
      period: ephemeris?.period,
    };
  });

  try {
    await prisma.$transaction([
      prisma.$executeRawUnsafe(`TRUNCATE public."Catalog" RESTART IDENTITY CASCADE;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Observation" RESTART IDENTITY CASCADE;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Reference" RESTART IDENTITY CASCADE;`),
      prisma.$executeRawUnsafe(`TRUNCATE public."Identifier" RESTART IDENTITY CASCADE;`),

      // Insert all identifiers with ephemeris data
      prisma.identifier.createMany({
        data: identifiers,
      }),

      // path to CSV files depends on how is data file mounted in docker-compose.yml
      prisma.$executeRawUnsafe(`
        COPY public."Reference"("referenceId", "starId", "author", "bibcode", "referenceStarIds")
        FROM '/data/temp/reference.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Catalog"("starId", "julianDate", "magnitude", "magErr", "filter", "referenceId")
        FROM '/data/temp/catalog.csv' 
        DELIMITER ',' 
        CSV HEADER;
      `),
      prisma.$executeRawUnsafe(`
        COPY public."Observation"("starId", "lambdaEff", "filter", "referenceId", "magAverage", "magError", "stdError", "amplitudeEff")
        FROM '/data/temp/observation.csv' 
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
    ]);
  } catch (e) {
    console.error(e);
    console.log("DB seeding failed. See error above");
    process.exit(1);
  }

  console.log("DB seeded successfully");

  console.log("Removing temporary files");
  files.forEach((file) => fs.rmSync(`${pathToDataDir}/temp/${file}`, { recursive: true, force: true }));
  fs.rmdirSync(pathToDataDir + "/temp");
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
