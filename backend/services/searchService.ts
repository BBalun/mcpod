import { findIdentifierByStarId } from "../data/identifier";
import { fetchExternalPhotometryData } from "../data/vizier";
import { fetchObjectIds } from "../data/simbad";
import { InternalServerError } from "../exceptions/InternalServerError";
import { insertExternalDataIntoDb } from "../data/externalPhotometryData";

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

  // Make sure that identifier is in the DB and data is fetched
  if (!identifier || !identifier.isFetched) {
    const hip = starIds.hip?.toLocaleLowerCase().replace("hip", "") ?? null;
    const tyc = starIds.tyc?.toLocaleLowerCase().replace("tyc", "") ?? null;
    console.debug("hip", hip, "tyc", tyc);

    const externalData = await fetchExternalPhotometryData(hip, tyc);
    console.debug(
      `Fetched photometry data: Hp - ${externalData.Hp.length}, Bt - ${externalData.Bt.length}, Vt - ${externalData.Vt.length}`
    );

    await insertExternalDataIntoDb(starIds, externalData);
  }

  return starIds;
}
