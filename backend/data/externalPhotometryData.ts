import { prisma } from "../database/prisma";
import { createCatalogs } from "./catalog";
import { upsertIdentifiers, setIdentifierToBeFetched } from "./identifier";
import { createObservations } from "./observation";
import { createReferences } from "./reference";

export async function insertExternalDataIntoDb(
  starIds: { oid: number; tyc: string | undefined; hip: string | undefined; mainId: string },
  externalData: {
    Hp: { julianDate: number; magnitude: number; magErr: number }[];
    Bt: { julianDate: number; magnitude: number; magErr: number }[];
    Vt: { julianDate: number; magnitude: number; magErr: number }[];
  }
) {
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

  try {
    await prisma.$transaction([
      upsertIdentifiers(starIds),
      createReferences([hipparcosRef, tychoRef]),
      createObservations([
        {
          starId: hipparcosRef.starId,
          referenceId: hipparcosRef.referenceId,
          filter: "30",
          count: externalData.Hp.length,
        },
        {
          starId: tychoRef.starId,
          referenceId: tychoRef.referenceId,
          filter: "31",
          count: externalData.Bt.length,
        },
        {
          starId: tychoRef.starId,
          referenceId: tychoRef.referenceId,
          filter: "32",
          count: externalData.Vt.length,
        },
      ]),
      createCatalogs([
        ...externalData.Hp.map((data) => ({
          ...data,
          filter: "30",
          starId: hipparcosRef.starId,
          referenceId: hipparcosRef.referenceId,
        })),
        ...externalData.Bt.map((data) => ({
          ...data,
          filter: "31",
          starId: tychoRef.starId,
          referenceId: tychoRef.referenceId,
        })),
        ...externalData.Vt.map((data) => ({
          ...data,
          filter: "32",
          starId: tychoRef.starId,
          referenceId: tychoRef.referenceId,
        })),
      ]),
      setIdentifierToBeFetched(starIds.oid),
    ]);
    console.debug("External photometry data inserted into DB successfully");
  } catch (e) {
    console.error(e);
    console.error("Failed insertion of external photometry data to the DB.");
    console.error("Request continues, but no external data will be displayed");
  }
}
