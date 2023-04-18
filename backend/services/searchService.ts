import { findIdentifierByStarId, setIdentifierToBeFetched, upsertIdentifiers } from "../data/identifier";
import { fetchExternalPhotometryData } from "../data/vizier";
import { fetchObjectIds } from "../data/simbad";
import { createCatalogs } from "../data/catalog";
import { createObservations } from "../data/observation";
import { createReferences } from "../data/reference";
import { InternalServerError } from "../exceptions/InternalServerError";
import { prisma } from "../database/prisma";

export async function search(input: string) {
  let starIds;

  try {
    starIds = await fetchObjectIds(input);
  } catch (e) {
    console.error("Failed to fetch object IDs from SIMBAD");
    console.error(e);
    throw new InternalServerError({
      message: "Failed to fetch object identifiers from SIMBAD",
    });
  }

  if (!starIds) {
    return null;
  }

  const identifier = await findIdentifierByStarId(starIds.oid);

  const hipparcosRef = {
    referenceId: "hip",
    starId: starIds.oid,
    author: "The Hipparcos Catalogues (ESA 1997)",
    bibcode: "1997yCat.1239....0E",
  };

  const tychoRef = {
    referenceId: "tyc",
    starId: starIds.oid,
    author: "The Tycho Catalogues (ESA 1997)",
    bibcode: "1997yCat.1239....0E",
  };

  // Make sure that identifier is in the DB and data is fetched
  if (!identifier || !identifier.isFetched) {
    const hip = starIds.hip?.toLocaleLowerCase().replace("hip", "") ?? null;
    const tyc = starIds.tyc?.toLocaleLowerCase().replace("tyc", "") ?? null;
    console.debug("hip", hip, "tyc", tyc);

    const externalData = await fetchExternalPhotometryData(hip, tyc);
    console.debug(
      `Fetched photometry data: Hp - ${externalData.Hp.length}, Bt - ${externalData.Bt.length}, Vt - ${externalData.Vt.length}`
    );

    try {
      await prisma.$transaction([
        upsertIdentifiers(starIds),
        createReferences([hipparcosRef, tychoRef]),
        createObservations([
          {
            starId: hipparcosRef.starId,
            referenceId: hipparcosRef.referenceId,
            filter: "30", // TODO: this probably should be fetched from `systems.json`, and use "30" as a default value
            count: externalData.Hp.length,
          },
          {
            starId: tychoRef.starId,
            referenceId: tychoRef.referenceId,
            filter: "31", // TODO: this probably should be fetched from `systems.json`, and use "30" as a default value
            count: externalData.Bt.length,
          },
          {
            starId: tychoRef.starId,
            referenceId: tychoRef.referenceId,
            filter: "32", // TODO: this probably should be fetched from `systems.json`, and use "30" as a default value
            count: externalData.Vt.length,
          },
        ]),
        createCatalogs([
          ...externalData.Hp.map((data) => ({
            ...data,
            filter: "30", // TODO: this probably should be fetched from `systems.json`, and use "30" as a default value
            starId: hipparcosRef.starId,
            referenceId: hipparcosRef.referenceId,
          })),
          ...externalData.Bt.map((data) => ({
            ...data,
            filter: "31", // TODO: this probably should be fetched from `systems.json`, and use "30" as a default value
            starId: tychoRef.starId,
            referenceId: tychoRef.referenceId,
          })),
          ...externalData.Vt.map((data) => ({
            ...data,
            filter: "32", // TODO: this probably should be fetched from `systems.json`, and use "30" as a default value
            starId: tychoRef.starId,
            referenceId: tychoRef.referenceId,
          })),
        ]),
        setIdentifierToBeFetched(starIds.oid),
      ]);
    } catch (e) {
      console.error(e);
      console.error("Failed insertion of external photometry data to the DB.");
      console.error("Request continues, but no external data will be displayed");
    }
    console.debug("External photometry data inserted into DB successfully");
  }

  return starIds;
}
