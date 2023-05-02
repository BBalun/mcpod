import { fetchExternalEphemerides } from "../data/ephemerids";
import { findIdentifierByStarId } from "../data/identifier";

export async function getEphemerides(starId: number) {
  const data = await findIdentifierByStarId(starId);

  if (!data) {
    console.error(`getEphemerids failed. Parameter starId ${starId} is not present in identifiers table`);
    return {
      period: null,
      epoch: null,
    };
  }

  if (data?.period || data?.epoch) {
    return {
      period: data?.period?.toNumber() ?? null,
      epoch: data?.epoch?.toNumber() ?? null,
    };
  }

  // TODO: is there a possibility that both hip & tyc will be undefined and mainId won't exist in VSX?
  const ephemerids = await fetchExternalEphemerides(data.hip ?? data.tyc ?? data.mainId);
  if (ephemerids?.epoch) {
    ephemerids.epoch = ephemerids.epoch - 2_400_000;
  }
  return ephemerids;
}
